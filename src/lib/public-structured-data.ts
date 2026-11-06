import { business } from "@/src/lib/business";
import { getPropertyImageUrl } from "@/src/lib/utils/property-image-url";
import type { PropertySeo } from "@/src/lib/property-seo";
import type { PropertyDetail, PropertyGalleryImage } from "@/src/features/catalogue/public-property-detail-data";
import type { CatalogueProperty } from "@/src/features/catalogue/public-catalogue-data";

export const organizationId = `${business.url}/#organization`;

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: business.name,
    url: business.url,
    logo: `${business.url}/logo.png`,
    email: business.email,
    description: `${business.guests.summary} ${business.owners.summary}`,
    areaServed: business.serviceArea,
    ...(business.contactNumber ? {
      contactPoint: {
        "@type": "ContactPoint",
        telephone: `+${business.contactNumber}`,
        contactType: "Customer service",
        url: `https://wa.me/${business.contactNumber}`,
        areaServed: business.serviceArea,
      },
    } : {}),
    ...(business.sameAs.length ? { sameAs: business.sameAs } : {}),
  };
}

export function buildServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${business.url}/property-management-goa#service`,
    serviceType: "Short-term rental property management",
    name: `Property management in ${business.area}`,
    description: business.owners.summary,
    url: `${business.url}/property-management-goa`,
    provider: { "@type": "Organization", "@id": organizationId, name: business.name, url: business.url },
    areaServed: business.serviceArea,
  };
}

export function buildFaqJsonLd(items: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

export function buildBreadcrumbJsonLd(items: ReadonlyArray<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, url }, index) => ({
      "@type": "ListItem", position: index + 1, name, item: url,
    })),
  };
}

export function buildCatalogueJsonLd(properties: ReadonlyArray<CatalogueProperty>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: properties.map((property, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "VacationRental",
        url: `${business.url}/property/${property.slug}`,
        ...(property.public_name?.trim() ? { name: property.public_name.trim() } : {}),
      },
    })),
  };
}

function validTime(value: string | null) {
  const match = value?.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  return match && Number(match[1]) < 24 && Number(match[2]) < 60 && Number(match[3] || 0) < 60
    ? `${match[1]}:${match[2]}:${match[3] || "00"}` : undefined;
}

export function buildPropertyJsonLd(property: PropertyDetail, gallery: PropertyGalleryImage[], seo?: PropertySeo) {
  const url = `${business.url}/property/${property.slug}`;
  // Keep the identifier independent of listing content so edits to a title or description do not change it.
  const identifier = property.id?.trim() || property.slug;
  const propertyType = property.public_property_type?.trim().toLowerCase() || "";
  const additionalType = propertyType.includes("villa")
    ? "Villa"
    : propertyType.includes("studio") || propertyType.includes("apartment")
      ? "Apartment"
      : "VacationRental";
  const name = seo?.h1 || property.public_name?.trim();
  // Use the same curated introduction as the visible About section when an override exists.
  const description = seo?.intro || property.full_description?.trim() || property.short_description?.trim() || property.tagline?.trim();
  const area = property.area?.trim();
  const images = gallery.map((image) => getPropertyImageUrl(image.storage_path)).filter((url): url is string => Boolean(url));
  const amenities = [...new Set(property.amenities.map((name) => name.trim()).filter(Boolean))];
  const checkinTime = validTime(property.check_in_time);
  const checkoutTime = validTime(property.check_out_time);
  const bathrooms = property.bathrooms;
  // Exact coordinates are intentionally not published, and review data belongs to third parties.
  // TODO(public-facts): A fractional bathroom value does not identify the full/partial bathroom count.
  // schema.org has no numberOfBathroomUnits. numberOfBathroomsTotal expects an integer; preserve fractions as a PropertyValue.
  // TODO(public-facts): Missing locality, capacity, amenities, photos or times must be supplied in public listing data; do not infer them.
  return {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    "@id": url,
    url,
    identifier,
    additionalType,
    ...(name ? { name } : {}),
    ...(description ? { description } : {}),
    ...(images.length ? { image: images } : {}),
    address: {
      "@type": "PostalAddress",
      ...(area ? { addressLocality: area } : {}),
      addressRegion: business.area,
      addressCountry: "IN",
    },
    containedInPlace: { "@type": "AdministrativeArea", name: business.area, containedInPlace: { "@type": "Country", name: business.country } },
    ...(checkinTime ? { checkinTime } : {}),
    ...(checkoutTime ? { checkoutTime } : {}),
    brand: { "@type": "Organization", "@id": organizationId, name: business.name },
    ...(amenities.length ? { amenityFeature: amenities.map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })) } : {}),
    containsPlace: {
      "@type": "Accommodation",
      ...(property.public_property_type?.trim() ? { accommodationCategory: property.public_property_type.trim() } : {}),
      ...(property.max_guests != null ? { occupancy: { "@type": "QuantitativeValue", value: property.max_guests } } : {}),
      ...(property.bedrooms != null ? { numberOfBedrooms: property.bedrooms } : {}),
      ...(bathrooms != null && Number.isInteger(bathrooms) ? { numberOfBathroomsTotal: bathrooms } : {}),
      ...(bathrooms != null && !Number.isInteger(bathrooms) ? { additionalProperty: { "@type": "PropertyValue", name: "Bathrooms", value: bathrooms } } : {}),
    },
  };
}

/** Safe inside an HTML script element even when public descriptions contain HTML. */
export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
