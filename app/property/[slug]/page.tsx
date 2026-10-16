import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { notFound } from "next/navigation";
import { buildMarketingMetadata, siteOrigin } from "@/app/seo";
import { PublicFooter } from "@/components/home/public-footer";
import { PublicHeader } from "@/components/home/public-header";
import { PropertyDetailPage } from "@/src/features/catalogue/property-detail-page";
import { PropertyMobileEnquiryBar } from "@/src/features/catalogue/property-mobile-enquiry-bar";
import { PropertyEnquiryProvider } from "@/src/features/catalogue/property-enquiry-context";
import { loadPublicPropertyDetail } from "@/src/features/catalogue/public-property-detail-data";
import { getPropertySeo } from "@/src/lib/property-seo";
import { getPropertyImageUrl } from "@/src/lib/utils/property-image-url";

/**
 * Public property detail route.
 *
 * Reads only the public-safe `public_property_details` and
 * `public_property_gallery` views. Missing, unpublished and operationally
 * inactive slugs are all absent from those views, so they produce the same
 * `notFound()` result and the page never reveals that a private property exists.
 *
 * Because `loading.tsx` streams a fallback, the response has already committed
 * to 200 by the time `notFound()` fires, so this route serves the 404 page as a
 * documented soft 404. Next.js injects `<meta name="robots" content="noindex">`
 * into that stream, so the miss is still kept out of search indexes.
 */

const propertyFont = Figtree({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-homepage",
});

type PropertyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadPublicPropertyDetail(slug);

  if (result.status !== "found") {
    return { title: { absolute: "Stay not found | CurateMyStay" } };
  }

  const { gallery, property } = result;
  const seo = getPropertySeo(slug);
  const name = property.public_name || "Curated stay";
  const derivedTitle = `${name}${property.area ? `, ${property.area}` : ""} | Stays in Goa | CurateMyStay`;
  const description =
    seo?.metaDescription ||
    property.seo_description?.trim() ||
    property.short_description?.trim() ||
    property.tagline?.trim() ||
    `${name} is a CurateMyStay-managed stay in Goa. Ask our team about dates and rates.`;

  const metadata = buildMarketingMetadata({
    title: seo?.title || property.seo_title?.trim() || derivedTitle,
    description,
    canonicalPath: seo ? new URL(`/property/${slug}`, siteOrigin).href : `/property/${property.slug}`,
  });

  // Prefer this property's cover photo for sharing; the bucket is public and the
  // host is already allow-listed in next.config.ts.
  const coverUrl = getPropertyImageUrl(gallery[0]?.storage_path);
  if (!coverUrl) return metadata;

  const coverImage = { url: coverUrl, alt: seo?.altBase || gallery[0]?.alt_text || name };

  return {
    ...metadata,
    openGraph: { ...metadata.openGraph, images: [coverImage] },
    twitter: { ...metadata.twitter, images: [coverImage] },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const result = await loadPublicPropertyDetail(slug);

  if (result.status === "notFound") notFound();

  const seo = result.status === "found" ? getPropertySeo(slug) : undefined;
  const canonicalUrl = new URL(`/property/${slug}`, siteOrigin).href;
  const jsonLd = seo && result.status === "found" ? {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    "@id": canonicalUrl,
    url: canonicalUrl,
    name: seo.h1,
    description: seo.metaDescription,
    image: result.gallery
      .map((image) => getPropertyImageUrl(image.storage_path))
      .filter((url): url is string => Boolean(url))
      .map((url) => new URL(url, siteOrigin).href),
    ...(seo.schema.registrationId ? { identifier: seo.schema.registrationId } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: seo.schema.locality,
      addressRegion: `${seo.schema.region}, Goa`,
      addressCountry: "IN",
    },
    checkinTime: "14:00",
    checkoutTime: "11:00",
    brand: { "@type": "Organization", name: "CurateMyStay", url: siteOrigin },
    containsPlace: {
      "@type": "Accommodation",
      additionalType: `https://schema.org/${seo.schema.type}`,
      occupancy: { "@type": "QuantitativeValue", value: seo.schema.guests },
      numberOfBedrooms: seo.schema.bedrooms,
      numberOfBathroomsTotal: seo.schema.bathrooms,
      petsAllowed: seo.schema.petsAllowed,
      amenityFeature: seo.schema.amenities.map((name) => ({
        "@type": "LocationFeatureSpecification", name, value: true,
      })),
    },
  } : null;

  return (
    <div className={`${propertyFont.variable} cms-homepage`}>
      {jsonLd ? (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
          type="application/ld+json"
        />
      ) : null}
      <main className="min-h-screen bg-white font-sans text-public-ink antialiased">
        {/* Below md a found property shows its own back and share buttons over the photo
            instead; `md:contents` keeps the header's sticky behaviour unchanged from md. */}
        <div className={result.status === "found" ? "max-md:hidden md:contents" : "contents"}>
          <PublicHeader analyticsLocation="property_page" />
        </div>

        {result.status === "failed" ? (
          <div className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6 sm:py-16 md:px-8">
            <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-public-sand-line bg-public-cream px-6 py-12 text-center">
              <h1 className="text-[19px] font-bold tracking-[-0.01em] text-public-ink">
                We could not load this stay just now
              </h1>
              <p className="mx-auto mt-2.5 max-w-md text-[15px] leading-7 text-public-body">
                Please refresh the page in a moment. If it keeps happening, message us and we will
                share the homes that suit you.
              </p>
            </div>
          </div>
        ) : (
          <PropertyEnquiryProvider
            key={result.property.slug}
            maxGuests={result.property.max_guests}
            propertyName={result.property.public_name || "Curated stay"}
            propertyUrl={`${siteOrigin}/property/${result.property.slug}`}
          >
            <PropertyDetailPage gallery={result.gallery} property={result.property} />
            <PublicFooter analyticsLocation="property_page" homeAnchorPrefix="/" />
            <PropertyMobileEnquiryBar acceptBookingRequests={result.property.accept_booking_requests} />
          </PropertyEnquiryProvider>
        )}

        {result.status === "failed" ? <PublicFooter analyticsLocation="property_page" homeAnchorPrefix="/" /> : null}
      </main>
    </div>
  );
}
