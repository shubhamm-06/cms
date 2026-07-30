import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { buildMarketingMetadata, siteOrigin } from "@/app/seo";
import { faqs, PropertyManagementPage } from "@/components/property-management/property-management-page";

const propertyManagementFont = Figtree({ display: "swap", subsets: ["latin"], variable: "--font-homepage" });

export const metadata: Metadata = {
  ...buildMarketingMetadata({
    title: "Property Management Company in Goa : Airbnb Villas & Apartments | Curate My Stay",
    description: "Full-service property management in Goa for Airbnb, villas and holiday homes. We handle guests, dynamic pricing, housekeeping and compliance : with an owner-approved monthly P&L. 4.98★ Superhost.",
    canonicalPath: "/property-management-goa",
  }),
  robots: { index: true, follow: true },
};

const jsonLd = [
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: siteOrigin }, { "@type": "ListItem", position: 2, name: "Property Management in Goa", item: `${siteOrigin}/property-management-goa` }] },
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
];

export default function PropertyManagementGoaPage() {
  return <div className={`${propertyManagementFont.variable} cms-homepage`}><script dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} type="application/ld+json" /><PropertyManagementPage /></div>;
}
