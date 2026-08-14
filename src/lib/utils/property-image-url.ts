const propertyImagesBucket = "property-images";

/**
 * Public URL for an image stored in the public `property-images` Storage bucket.
 * Paths are the generated `{property-id}/{uuid}.{extension}` values held in
 * `property_images.storage_path`, never full URLs.
 */
export function getPropertyImageUrl(storagePath: string | null | undefined) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!storagePath || !supabaseUrl) return null;

  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${propertyImagesBucket}/${storagePath}`;
}
