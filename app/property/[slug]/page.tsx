import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { notFound } from "next/navigation";
import { buildMarketingMetadata } from "@/app/seo";
import { PublicFooter } from "@/components/home/public-footer";
import { PublicHeader } from "@/components/home/public-header";
import { PropertyDetailPage } from "@/src/features/catalogue/property-detail-page";
import { loadPublicPropertyDetail } from "@/src/features/catalogue/public-property-detail-data";
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
  const name = property.public_name || "Curated stay";
  const derivedTitle = `${name}${property.area ? `, ${property.area}` : ""} | Stays in Goa | CurateMyStay`;
  const description =
    property.seo_description?.trim() ||
    property.short_description?.trim() ||
    property.tagline?.trim() ||
    `${name} is a CurateMyStay-managed stay in Goa. Ask our team about dates and rates.`;

  const metadata = buildMarketingMetadata({
    title: property.seo_title?.trim() || derivedTitle,
    description,
    canonicalPath: `/property/${property.slug}`,
  });

  // Prefer this property's cover photo for sharing; the bucket is public and the
  // host is already allow-listed in next.config.ts.
  const coverUrl = getPropertyImageUrl(gallery[0]?.storage_path);
  if (!coverUrl) return metadata;

  const coverImage = { url: coverUrl, alt: gallery[0]?.alt_text || name };

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

  return (
    <div className={`${propertyFont.variable} cms-homepage`}>
      <main className="min-h-screen bg-white font-sans text-public-ink antialiased">
        <PublicHeader analyticsLocation="property_page" />

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
          <PropertyDetailPage gallery={result.gallery} property={result.property} />
        )}

        <PublicFooter analyticsLocation="property_page" homeAnchorPrefix="/" />
      </main>
    </div>
  );
}
