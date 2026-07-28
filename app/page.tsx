import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { ReferenceHome } from "@/components/home/reference-home";
import { buildMarketingMetadata, homeJsonLd } from "@/app/seo";

const homepageFont = Figtree({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-homepage",
});

export const metadata: Metadata = {
  ...buildMarketingMetadata({
    title: "Airbnb & Villa Property Management in Goa | Curate My Stay",
    description:
      "Full-service Airbnb & short-term rental management in Goa. Dynamic pricing, guests, housekeeping, compliance with an owner-approved monthly P&L. 4.98\u2605 Superhost.",
    canonicalPath: "/",
  }),
};

export default function Home() {
  return (
    <div className={`${homepageFont.variable} cms-homepage`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <ReferenceHome />
    </div>
  );
}