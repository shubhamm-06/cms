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
 */

const catalogueColumns =
  "id,slug,public_name,public_property_type,region,area,short_location_line,tagline,short_description,promotional_badge,bedrooms,beds,bathrooms,max_guests,pool_type,distance_from_beach,starting_price,show_price,price_note,is_featured,display_order,cover_storage_path,cover_alt_text";

/** Public-safe catalogue row. Every field here is safe to send to the browser. */
export type CatalogueProperty = Database["public"]["Views"]["public_property_catalogue"]["Row"];

export type CatalogueLoadResult = {
  failed: boolean;
  properties: CatalogueProperty[];
};

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

  return data;
}, ["public-catalogue-v1", process.env.NEXT_PUBLIC_SUPABASE_URL || "unconfigured"], { tags: [PUBLIC_PROPERTIES_TAG], revalidate: PUBLIC_DATA_TTL_SECONDS });

export async function loadPublicCatalogue(): Promise<CatalogueLoadResult> {
  await connection();
  try {
    return { failed: false, properties: await readCatalogue(publicReadPeriod()) };
  } catch {
    return { failed: true, properties: [] };
  }
}
