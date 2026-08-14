import "server-only";

import { createClient } from "@/src/lib/supabase/server";
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

export async function loadPublicCatalogue(): Promise<CatalogueLoadResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_property_catalogue")
    .select(catalogueColumns)
    .order("is_featured", { ascending: false })
    .order("display_order", { ascending: true })
    .order("public_name", { ascending: true });

  if (error) {
    // Safe technical context only; visitors see the generic catalogue error state.
    console.error("[booking] catalogue read failed", error.code, error.message);
    return { failed: true, properties: [] };
  }

  return { failed: false, properties: data };
}
