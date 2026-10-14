import "server-only";

import { cache } from "react";
import { createClient } from "@/src/lib/supabase/server";
import type { Database } from "@/types/database.types";

/**
 * Public property detail read for `/property/[slug]`.
 *
 * Reads the public-safe `public_property_details` and `public_property_gallery`
 * views with the ordinary anon server client. Those views are the security
 * boundary: they expose public columns only and already filter to
 * `show_on_website = true`, `status = 'active'` and a non-null slug, so no
 * visibility filtering belongs in application code.
 *
 * Never query `properties` or `property_images` directly here, and never use the
 * service-role client for public reads.
 */

const detailColumns =
  "id,slug,public_name,public_property_type,region,area,short_location_line,public_location_text,google_maps_url,tagline,short_description,full_description,promotional_badge,bedrooms,beds,bathrooms,max_guests,pool_type,distance_from_beach,amenities,property_highlights,house_rules,starting_price,show_price,price_note,minimum_nights,check_in_time,check_out_time,booking_enquiry_note,accept_booking_requests,seo_title,seo_description,airbnb_listing_url";

const galleryColumns = "property_id,storage_path,alt_text,sort_order,is_cover,created_at";

/** Public-safe detail row. Every field here is safe to send to the browser. */
export type PropertyDetail = Database["public"]["Views"]["public_property_details"]["Row"];

/** Public-safe gallery row. Every field here is safe to send to the browser. */
export type PropertyGalleryImage = Database["public"]["Views"]["public_property_gallery"]["Row"];

/**
 * `notFound` and `failed` stay separate so the page can call `notFound()` for a
 * slug that is missing, unpublished or inactive, while a real query failure gets
 * the public error state instead of a misleading 404.
 */
export type PropertyDetailLoadResult =
  | { status: "found"; property: PropertyDetail; gallery: PropertyGalleryImage[] }
  | { status: "notFound" }
  | { status: "failed" };

/**
 * Cached per request so `generateMetadata` and the page render share one pair of
 * queries instead of repeating them.
 */
export const loadPublicPropertyDetail = cache(async function loadPublicPropertyDetail(
  slug: string,
): Promise<PropertyDetailLoadResult> {
  const supabase = await createClient();

  const { data: property, error: detailError } = await supabase
    .from("public_property_details")
    .select(detailColumns)
    .eq("slug", slug)
    .maybeSingle();

  if (detailError) {
    // Safe technical context only; visitors see the generic error state.
    console.error("[property] detail read failed", detailError.code, detailError.message);
    return { status: "failed" };
  }

  // Missing, unpublished and inactive slugs are all simply absent from the view,
  // so they are indistinguishable here and to the visitor.
  if (!property) return { status: "notFound" };

  const { data: gallery, error: galleryError } = await supabase
    .from("public_property_gallery")
    .select(galleryColumns)
    .eq("property_id", property.id)
    .order("is_cover", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (galleryError) {
    // A gallery failure should not hide a published property, so the page falls
    // back to the no-images placeholder.
    console.error("[property] gallery read failed", galleryError.code, galleryError.message);
    return { status: "found", property, gallery: [] };
  }

  return { status: "found", property, gallery };
});
