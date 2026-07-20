import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { buildMarketingMetadata, siteOrigin } from "@/app/seo";
import { CaseStudiesPublicPage } from "@/components/home/case-studies-public-page";
import { propertyCaseStudies } from "@/components/home/case-studies-data";

const caseStudiesFont = Figtree({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-homepage",
});

export const metadata: Metadata = {
  ...buildMarketingMetadata({
    title: "Goa Airbnb Management Case Studies | CurateMyStay",
    description:
      "See real occupancy, guest-rating, expense and revenue results from CurateMyStay-managed Airbnb properties in Panjim and Varca, Goa.",
    canonicalPath: "/case-studies",
    openGraphTitle: "Real Airbnb Management Results in Goa | CurateMyStay",
  }),
};

const caseStudiesJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "CurateMyStay Goa Airbnb Management Case Studies",
  description:
    "Real operating results from CurateMyStay-managed Airbnb properties in Panjim and Varca, Goa.",
  url: `${siteOrigin}/case-studies`,
  mainEntity: {
    "@type": "ItemList",
    itemListElement: propertyCaseStudies.map((study, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Article",
        headline: study.title,
        description: study.propertyLabel,
        url: `${siteOrigin}/case-studies#${study.slug}`,
      },
    })),
  },
};

export default function CaseStudiesPage() {
  return (
    <div className={`${caseStudiesFont.variable} cms-homepage`}>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(caseStudiesJsonLd).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
      <CaseStudiesPublicPage />
    </div>
  );
}
