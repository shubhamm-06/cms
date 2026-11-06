import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { buildMarketingMetadata, siteOrigin } from "@/app/seo";
import { faqs, PropertyManagementPage } from "@/components/property-management/property-management-page";
import { buildFaqJsonLd, buildServiceJsonLd, serializeJsonLd } from "@/src/lib/public-structured-data";

const propertyManagementFont = Figtree({ display: "swap", subsets: ["latin"], variable: "--font-homepage" });

export const metadata: Metadata = {
  ...buildMarketingMetadata({
    title: "Property Management Company in Goa : Airbnb Villas & Apartments | Curate My Stay",
    description: "Full-service property management in Goa for Airbnb, villas and holiday homes. We handle guests, dynamic pricing, housekeeping and compliance : with an owner-approved monthly P&L. 4.9+★ Superhost.",
    canonicalPath: "/property-management-goa",
  }),
  robots: { index: true, follow: true },
};

const jsonLd = [
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: siteOrigin }, { "@type": "ListItem", position: 2, name: "Property Management in Goa", item: `${siteOrigin}/property-management-goa` }] },
  buildServiceJsonLd(),
  buildFaqJsonLd(faqs.map(([question, answer]) => ({ question, answer }))),
];

export default function PropertyManagementGoaPage() {
  return <div className={`${propertyManagementFont.variable} cms-homepage`}><script dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} type="application/ld+json" /><PropertyManagementPage /></div>;
}
