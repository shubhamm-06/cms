import type { PropertyDetail } from "@/src/features/catalogue/public-property-detail-data";

export function buildPropertyGlance(property: PropertyDetail) {
  const base = [
    property.public_property_type?.trim(),
    property.area?.trim(),
    property.max_guests != null ? `${property.max_guests} ${property.max_guests === 1 ? "guest" : "guests"}` : null,
    property.bedrooms != null ? `${property.bedrooms} ${property.bedrooms === 1 ? "bedroom" : "bedrooms"}` : null,
    property.beds != null ? `${property.beds} ${property.beds === 1 ? "bed" : "beds"}` : null,
    property.bathrooms != null ? `${property.bathrooms} ${property.bathrooms === 1 ? "bathroom" : "bathrooms"}` : null,
  ].filter(Boolean);
  // Reuse complete public sentences verbatim. Never calculate distances or infer included services.
  // TODO(public-facts): Dedicated airport-distance and breakfast-inclusion facts are not exposed by the views.
  const descriptionFacts = [property.short_description, property.full_description, property.tagline]
    .filter((text): text is string => Boolean(text?.trim()))
    .flatMap((text) => text.split(/(?<=[.!?])\s+|\n+/))
    .map((text) => text.trim())
    .filter((text) => /\b(?:\d+(?:\.\d+)?\s*(?:km|metres?|meters?|minutes?|mins?)\b|breakfast\b)/i.test(text));
  const facts = [
    property.distance_from_beach?.trim() ? `Beach: ${property.distance_from_beach.trim()}` : null,
    ...property.property_highlights.map((text) => text.trim()).filter(Boolean),
    ...descriptionFacts,
  ].filter((text): text is string => Boolean(text));
  return [...base, ...new Set(facts)].slice(0, base.length + 2).join(" · ");
}
