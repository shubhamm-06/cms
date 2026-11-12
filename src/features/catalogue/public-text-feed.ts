import "server-only";

import { business } from "@/src/lib/business";
import { loadPublicCatalogue, type CatalogueProperty } from "@/src/features/catalogue/public-catalogue-data";
import { loadPublicPropertyDetail, type PropertyDetail } from "@/src/features/catalogue/public-property-detail-data";

/** Preserve public wording while keeping user-entered text within its Markdown line. */
function line(value: string) {
  return value.replace(/\s+/g, " ").trim().replace(/[\\`*_[\]<>#]/g, "\\$&");
}

function propertyUrl(slug: string) {
  return `${business.url}/property/${slug}`;
}

function fullProperty(property: PropertyDetail) {
  const descriptions = [...new Set([property.tagline, property.short_description, property.full_description]
    .filter((value): value is string => Boolean(value?.trim())).map((value) => value.trim()))];
  const facts = [
    property.public_property_type?.trim() ? `Type: ${line(property.public_property_type)}` : null,
    property.area?.trim() ? `Area: ${line(property.area)}, ${business.area}` : null,
    property.public_location_text?.trim() ? `Location: ${line(property.public_location_text)}` : null,
    property.max_guests != null ? `Guests: ${property.max_guests}` : null,
    property.bedrooms != null ? `Bedrooms: ${property.bedrooms}` : null,
    property.bathrooms != null ? `Bathrooms: ${property.bathrooms}` : null,
    property.distance_from_beach?.trim() ? `Beach: ${line(property.distance_from_beach)}` : null,
    property.check_in_time?.trim() ? `Check-in: ${line(property.check_in_time)}` : null,
    property.check_out_time?.trim() ? `Check-out: ${line(property.check_out_time)}` : null,
    property.minimum_nights != null ? `Minimum nights: ${property.minimum_nights}` : null,
  ].filter(Boolean);
  return [
    `### [${line(property.public_name?.trim() || property.slug)}](${propertyUrl(property.slug)})`,
    ...descriptions.map(line),
    ...facts.map((fact) => `- ${fact}`),
    ...property.property_highlights.filter((value) => value.trim()).map((value) => `- Highlight: ${line(value)}`),
    ...(property.amenities.some((value) => value.trim()) ? ["#### Amenities", ...property.amenities.filter((value) => value.trim()).map((value) => `- ${line(value)}`)] : []),
    ...(property.house_rules.some((value) => value.trim()) ? ["#### House rules", ...property.house_rules.filter((value) => value.trim()).map((value) => `- ${line(value)}`)] : []),
    ...(property.booking_enquiry_note?.trim() ? [`Enquiries: ${line(property.booking_enquiry_note)}`] : []),
    ...(!property.accept_booking_requests ? ["Enquiries for this stay are currently paused."] : []),
  ].join("\n\n");
}

/** Public information for people and crawlers alike; no user-agent branching. */
export function renderPublicTextFeed(properties: CatalogueProperty[] = [], details: PropertyDetail[] = []) {
  const stays = properties.map((property) => {
    const facts = [
      property.public_property_type?.trim(), property.area?.trim(),
      property.max_guests != null ? `${property.max_guests} ${property.max_guests === 1 ? "guest" : "guests"}` : null,
      property.short_description?.trim() || property.tagline?.trim(),
    ].filter((value): value is string => Boolean(value));
    return `- [${line(property.public_name?.trim() || property.slug)}](${propertyUrl(property.slug)})${facts.length ? `: ${facts.map(line).join("; ")}` : ""}`;
  });
  return [
    `# ${business.name}`,
    `${business.guests.summary} ${business.owners.summary}`,
    "## For guests",
    `${business.guests.booking}\n\n[Explore stays](${business.url}/booking).`,
    ...(stays.length ? ["## Stays", stays.join("\n")] : []),
    ...(details.length ? ["## Full stay details", ...details.map(fullProperty)] : []),
    "## For property owners",
    `${business.owners.summary} ${business.owners.start}`,
    `[Property management in Goa](${business.url}/property-management-goa)\n\n[Case studies](${business.url}/case-studies)`,
    "What's included:\n" + business.owners.included.map((item) => `- ${item}`).join("\n"),
    "## Key pages",
    [
      ["Home", ""], ["Stays", "/booking"], ["Goa villa stays", "/goa-villa-stays"], ["Property management", "/property-management-goa"],
      ["Property management proposal", "/property-management-proposal"], ["Case studies", "/case-studies"],
      ["About", "/about"], ["FAQ", "/faq"],
    ].map(([name, path]) => `- [${name}](${business.url}${path})`).join("\n"),
    "## Contact",
    `- Website: ${business.url}\n- Email: ${business.email}\n- Service area: ${business.serviceArea}`,
    ...(business.contactNumber ? [`- WhatsApp: https://wa.me/${business.contactNumber}\n- Phone: +${business.contactNumber}`] : []),
  ].join("\n\n") + "\n";
}

export async function buildPublicTextFeed(full: boolean) {
  try {
    // Both endpoints share the same anon-only 60-second cache as /booking.
    const catalogue = await loadPublicCatalogue();
    if (catalogue.failed) return renderPublicTextFeed();
    const properties = [...new Map(catalogue.properties.map((property) => [property.slug, property])).values()];
    if (!full) return renderPublicTextFeed(properties);
    const results = await Promise.all(properties.map((property) => loadPublicPropertyDetail(property.slug)));
    if (results.some((result) => result.status === "failed")) return renderPublicTextFeed();
    const details = results.flatMap((result) => result.status === "found" ? [result.property] : []);
    const publishedSlugs = new Set(details.map((property) => property.slug));
    return renderPublicTextFeed(properties.filter((property) => publishedSlugs.has(property.slug)), details);
  } catch {
    return renderPublicTextFeed();
  }
}

export function publicTextResponse(content: string) {
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // The loaders already own the 60-second TTL. Do not extend it with another response cache.
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
