import "server-only";

import { unstable_cache } from "next/cache";
import { connection } from "next/server";
import { createPublicClient } from "@/src/lib/supabase/public";
import { PUBLIC_DATA_TTL_SECONDS, PUBLIC_PROPERTIES_TAG, publicReadPeriod } from "@/src/features/shared/cache-policy";
import type { Database } from "@/types/database.types";

/**
 * Public property catalogue read for `/booking`.
 *
 * Reads the public-safe `public_property_catalogue` view with the ordinary anon
 * server client. The view is the security boundary: it exposes public columns
 * only and already filters to `show_on_website = true`, `status = 'active'` and
 * a non-null slug, so no visibility filtering belongs in application code.
 *
 * Never query `properties` or `property_images` directly here, and never use the
 * service-role client for public catalogue reads.
 *
 * Card carousels use `public_property_gallery`, read once for every property (one
 * query, never one per card) and grouped here. That view applies the same publication
 * predicates, so a property's photos are only exposed when the property itself is.
 */

const catalogueColumns =
  "id,slug,public_name,public_property_type,region,area,short_location_line,tagline,short_description,promotional_badge,bedrooms,beds,bathrooms,max_guests,pool_type,distance_from_beach,starting_price,show_price,price_note,is_featured,display_order,cover_storage_path,cover_alt_text";

/** A photo shown in a catalogue card, in display order. */
export type CatalogueImage = { alt_text: string | null; storage_path: string };

/** Most photos a card carries, so a large gallery cannot weigh down the grid. */
const MAX_CARD_IMAGES = 8;

/** Public-safe catalogue row plus its card photos. Every field here is safe to send to the browser. */
export type CatalogueProperty = Database["public"]["Views"]["public_property_catalogue"]["Row"] & {
  images: CatalogueImage[];
};

export type CatalogueLoadResult = {
  failed: boolean;
  properties: CatalogueProperty[];
};

type CatalogueRow = Omit<CatalogueProperty, "images">;

const readCatalogue = unstable_cache(async (period: number) => {
  void period; // Key-only argument: each minute requires a fresh, blocking read.
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("public_property_catalogue")
    .select(catalogueColumns)
    .order("is_featured", { ascending: false })
    .order("display_order", { ascending: true })
    .order("public_name", { ascending: true });

  if (error) {
    // Safe technical context only; visitors see the generic catalogue error state.
    console.error("[booking] catalogue read failed", error.code, error.message);
    throw new Error("Public catalogue read failed.");
  }

  return data satisfies CatalogueRow[];
}, ["public-catalogue-v1", process.env.NEXT_PUBLIC_SUPABASE_URL || "unconfigured"], { tags: [PUBLIC_PROPERTIES_TAG], revalidate: PUBLIC_DATA_TTL_SECONDS });

/** Every public photo in display order (cover first), keyed by property id. */
const readGalleries = unstable_cache(async (period: number) => {
  void period;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("public_property_gallery")
    .select("property_id,storage_path,alt_text")
    .order("is_cover", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[booking] gallery read failed", error.code, error.message);
    throw new Error("Public gallery read failed.");
  }

  return data;
}, ["public-catalogue-galleries-v1", process.env.NEXT_PUBLIC_SUPABASE_URL || "unconfigured"], { tags: [PUBLIC_PROPERTIES_TAG], revalidate: PUBLIC_DATA_TTL_SECONDS });

/** The cover first, then the other photos, without repeating the cover. */
function cardImages(property: CatalogueRow, gallery: CatalogueImage[]) {
  const cover = property.cover_storage_path
    ? [{ alt_text: property.cover_alt_text, storage_path: property.cover_storage_path }]
    : [];
  const seen = new Set<string>();

  return [...cover, ...gallery]
    .filter((image) => !seen.has(image.storage_path) && seen.add(image.storage_path))
    .slice(0, MAX_CARD_IMAGES);
}

export async function loadPublicCatalogue(): Promise<CatalogueLoadResult> {
  await connection();
  try {
    const period = publicReadPeriod();
    // A gallery failure must not hide published properties: cards fall back to their cover.
    const [rows, galleries] = await Promise.all([readCatalogue(period), readGalleries(period).catch(() => [])]);
    const byProperty = Map.groupBy(galleries, (image) => image.property_id);

    return {
      failed: false,
      properties: rows.map((row) => ({ ...row, images: cardImages(row, byProperty.get(row.id) ?? []) })),
    };
  } catch {
    return { failed: true, properties: [] };
  }
}
