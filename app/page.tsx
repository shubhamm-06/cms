import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { ReferenceHome } from "@/components/home/reference-home";
import { buildMarketingMetadata, homeJsonLd } from "@/app/seo";
import { loadPublicCatalogue } from "@/src/features/catalogue/public-catalogue-data";

const homepageFont = Figtree({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-homepage",
});

export const metadata: Metadata = {
  ...buildMarketingMetadata({
    title: "Stay in Goa. Properly. | Curate My Stay",
    description:
      "Hand-picked villas and apartments in Goa, personally managed by our team. Explore our stays and book directly with Curate My Stay.",
    canonicalPath: "/",
  }),
};

export default async function Home() {
  const catalogue = await loadPublicCatalogue();
  return (
    <div className={`${homepageFont.variable} cms-homepage`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <ReferenceHome catalogue={catalogue} />
    </div>
  );
}
