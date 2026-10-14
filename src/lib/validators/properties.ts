import { z } from "zod";
import { extractIframeSrc, isAllowedMapHost, safeHttpUrl } from "@/src/lib/maps";
import { normalizePropertySlug } from "@/src/lib/utils/property-slug";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : typeof value === "string" ? value.trim() : value),
  z.string().nullable().optional(),
);

const optionalInteger = z.preprocess(
  (value) => (value === "" || value === undefined || value === null ? null : Number(value)),
  z.number().int().nullable().optional(),
);

const optionalDecimal = z.preprocess(
  (value) => (value === "" || value === undefined || value === null ? null : Number(value)),
  z.number().nullable().optional(),
);

const optionalTime = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/, "Enter a valid time.").nullable().optional(),
);

const formBoolean = (defaultValue: boolean) =>
  z.preprocess((value) => (value === "true" ? true : value === "false" ? false : value), z.boolean()).default(defaultValue);

const lineList = z
  .preprocess(
    (value) =>
      typeof value === "string"
        ? value
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean)
        : value,
    z.array(z.string()).default([]),
  )
  .transform((items) => items.map((item) => item.trim()).filter(Boolean));

const slug = z.preprocess(
  (value) => (typeof value === "string" ? normalizePropertySlug(value) || null : value),
  z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.").nullable().optional(),
);

/**
 * An HTTPS Airbnb listing link, for example https://www.airbnb.co.in/rooms/12345678.
 * Any Airbnb country domain is accepted; the path must be a listing (`/rooms/...`).
 */
export function isAirbnbListingUrl(value: string | null | undefined) {
  try {
    const url = new URL(value?.trim() ?? "");
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      /^(?:[a-z]+\.)?airbnb\.(?:[a-z]{2,3}|co\.[a-z]{2}|com\.[a-z]{2})$/i.test(url.hostname) &&
      /^\/rooms\/(plus\/)?\d+/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export const propertySchema = z
  .object({
    id: z.string().uuid().optional().or(z.literal("")),
    name: z.string().min(2),
    city: optionalText,
    address: optionalText,
    bedrooms: optionalInteger.refine((value) => value === null || value === undefined || value >= 0, "Bedrooms cannot be negative."),
    owner_id: z.string().uuid().optional().or(z.literal("")),
    owner_share: z.coerce.number().min(0).max(100),
    cms_share: z.coerce.number().min(0).max(100),
    image_url: z.string().optional(),
    status: z.enum(["active", "inactive"]),
    show_on_website: formBoolean(false),
    accept_booking_requests: formBoolean(true),
    slug,
    public_name: optionalText,
    public_property_type: optionalText,
    region: optionalText,
    area: optionalText,
    short_location_line: optionalText,
    public_location_text: optionalText,
    google_maps_url: z.preprocess(
      // A pasted <iframe> embed code is stored as the link inside it.
      (value) => (typeof value === "string" && value.trim() === "" ? null : typeof value === "string" ? extractIframeSrc(value) ?? value.trim() : value),
      z.string().url("Enter a valid Google Maps URL.").refine((value) => {
        const url = safeHttpUrl(value);
        return Boolean(url && !url.username && !url.password && isAllowedMapHost(url.hostname));
      }, "Use a Google Maps link.").nullable().optional(),
    ),
    airbnb_listing_url: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? null : typeof value === "string" ? value.trim() : value),
      z
        .string()
        .refine(isAirbnbListingUrl, "Use an HTTPS Airbnb listing link, for example https://www.airbnb.co.in/rooms/12345678.")
        .nullable()
        .optional(),
    ),
    tagline: optionalText,
    short_description: optionalText,
    full_description: optionalText,
    promotional_badge: optionalText,
    beds: optionalInteger.refine((value) => value === null || value === undefined || value >= 0, "Beds cannot be negative."),
    bathrooms: optionalDecimal.refine(
      (value) => value === null || value === undefined || value >= 0,
      "Bathrooms cannot be negative.",
    ),
    max_guests: optionalInteger.refine(
      (value) => value === null || value === undefined || value >= 1,
      "Maximum guests must be at least 1.",
    ),
    pool_type: optionalText,
    distance_from_beach: optionalText,
    amenities: lineList,
    property_highlights: lineList,
    house_rules: lineList,
    starting_price: optionalDecimal.refine(
      (value) => value === null || value === undefined || value >= 0,
      "Starting price cannot be negative.",
    ),
    show_price: formBoolean(true),
    price_note: optionalText,
    minimum_nights: optionalInteger.refine(
      (value) => value === null || value === undefined || value >= 1,
      "Minimum nights must be at least 1.",
    ),
    check_in_time: optionalTime,
    check_out_time: optionalTime,
    booking_enquiry_note: optionalText,
    is_featured: formBoolean(false),
    display_order: z.preprocess(
      (value) => (value === "" || value === undefined || value === null ? 0 : Number(value)),
      z.number().int().min(0, "Display order cannot be negative."),
    ),
    show_in_similar_properties: formBoolean(true),
    seo_title: optionalText,
    seo_description: optionalText,
  })
  .refine((data) => data.owner_share + data.cms_share === 100, {
    message: "Owner share and CMS share must total 100.",
    path: ["cms_share"],
  })
  .superRefine((data, context) => {
    if (!data.show_on_website) return;

    const requiredPublicFields: Array<[keyof typeof data, string]> = [
      ["public_name", "Public property name is required to publish."],
      ["slug", "Slug is required to publish."],
      ["public_property_type", "Public property type is required to publish."],
      ["region", "Region is required to publish."],
      ["area", "Area is required to publish."],
      ["short_location_line", "Short location line is required to publish."],
      ["short_description", "Short description is required to publish."],
      ["full_description", "Full description is required to publish."],
      ["bedrooms", "Bedrooms are required to publish."],
      ["bathrooms", "Bathrooms are required to publish."],
      ["max_guests", "Maximum guests is required to publish."],
    ];

    requiredPublicFields.forEach(([field, message]) => {
      const value = data[field];
      if (value === null || value === undefined || value === "") {
        context.addIssue({ code: "custom", message, path: [field] });
      }
    });
  });
