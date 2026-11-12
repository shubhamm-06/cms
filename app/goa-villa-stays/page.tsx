import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { buildMarketingMetadata } from "@/app/seo";
import { GoaStaysAreas, type GoaStayArea } from "@/components/home/goa-stays-areas";
import { GoaStaysClosingCta } from "@/components/home/goa-stays-closing-cta";
import { GoaStaysFaq } from "@/components/home/goa-stays-faq";
import { GoaStaysHero } from "@/components/home/goa-stays-hero";
import { GoaStaysComparison } from "@/components/home/goa-stays-comparison";
import { GoaStaysHowItWorks } from "@/components/home/goa-stays-how-it-works";
import { GoaStaysListing } from "@/components/home/goa-stays-listing";
import { GoaStaysPicker } from "@/components/home/goa-stays-picker";
import { GoaStaysVillaVsHotel } from "@/components/home/goa-stays-villa-vs-hotel";
import { GuestHeader } from "@/components/home/guest-header";
import { PublicFooter } from "@/components/home/public-footer";
import { loadPublicCatalogue } from "@/src/features/catalogue/public-catalogue-data";
import { getPropertyImageUrl } from "@/src/lib/utils/property-image-url";
import { goaStaysCopy } from "@/src/features/goa-stays/goa-stays-copy";
import { business } from "@/src/lib/business";
import { buildBreadcrumbJsonLd, buildCatalogueJsonLd, buildFaqJsonLd, serializeJsonLd } from "@/src/lib/public-structured-data";
import { groupGoaStays } from "@/src/features/goa-stays/goa-stays-groups";

const goaStaysFont = Figtree({ display: "swap", subsets: ["latin"], variable: "--font-homepage" });

export const metadata: Metadata = {
  ...buildMarketingMetadata({
    title: goaStaysCopy.metadata.title,
    description: goaStaysCopy.metadata.description,
    canonicalPath: "/goa-villa-stays",
  }),
  robots: { index: true, follow: true },
};

export default async function GoaVillaStaysPage() {
  const catalogue = await loadPublicCatalogue();
  const groups = catalogue.failed ? [] : groupGoaStays(catalogue.properties);
  const groupIds = groups.map((group) => group.id);
  const areas = new Map<string, GoaStayArea>();
  for (const property of catalogue.failed ? [] : catalogue.properties) {
    const name = property.area?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    const existing = areas.get(key);
    if (existing) {
      existing.count += 1;
      if (!existing.coverUrl && property.cover_storage_path) {
        existing.coverUrl = getPropertyImageUrl(property.cover_storage_path);
      }
    } else {
      areas.set(key, {
        count: 1,
        coverUrl: getPropertyImageUrl(property.cover_storage_path),
        name,
        region: property.region?.trim() || null,
      });
    }
  }
  // Same order and set as the stay cards: grouped, in loader order within each group.
  const listedProperties = groups.flatMap((group) => group.properties);
  const jsonLd = [
    buildFaqJsonLd(goaStaysCopy.faq.items),
    buildBreadcrumbJsonLd([
      { name: goaStaysCopy.breadcrumbs.home, url: business.url },
      { name: goaStaysCopy.breadcrumbs.page, url: `${business.url}/goa-villa-stays` },
    ]),
    ...(listedProperties.length > 0 ? [buildCatalogueJsonLd(listedProperties)] : []),
  ];
  const pickerGroups = groups.map((group) => ({
    coverUrl: getPropertyImageUrl(group.properties.find((property) => property.cover_storage_path)?.cover_storage_path),
    id: group.id,
  }));

  return (
    <div className={`${goaStaysFont.variable} cms-homepage`}>
      {jsonLd.map((data) => (
        <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} key={data["@type"]} type="application/ld+json" />
      ))}
      <main className="min-h-screen bg-white font-sans text-public-ink antialiased">
        <GuestHeader page="booking" />
        <GoaStaysHero staysTargetId={groupIds.includes("villas") ? "villas" : "stays"} />
        <GoaStaysPicker groups={pickerGroups} />
        <GoaStaysListing failed={catalogue.failed} groups={groups} />
        <GoaStaysHowItWorks />
        <GoaStaysComparison />
        <GoaStaysVillaVsHotel />
        <GoaStaysAreas areas={[...areas.values()]} />
        <GoaStaysFaq />
        <GoaStaysClosingCta />
        <PublicFooter analyticsLocation="goa_stays_page" />
      </main>
    </div>
  );
}
