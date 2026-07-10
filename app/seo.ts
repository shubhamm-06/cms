import type { Metadata } from "next";

export const siteName = "CurateMyStay";
export const siteTitle = "CurateMyStay | Goa Vacation Rental Property Management";
export const siteDescription =
  "CurateMyStay helps Goa property owners manage vacation rentals with transparent reporting, full-service operations, and owner-first performance tracking.";
export const siteKeywords = [
  "Goa property management",
  "vacation rental management Goa",
  "Airbnb management Goa",
  "villa management Goa",
  "short term rental management Goa",
  "CurateMyStay",
];
export const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://curatemystay.com";

export const metadataBase = new URL(siteOrigin);

export const ogImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "CurateMyStay Goa vacation rental property management preview",
} as const;

export const twitterImage = {
  url: "/twitter-image",
  width: 1200,
  height: 630,
  alt: "CurateMyStay Goa vacation rental property management preview",
} as const;

export const noIndexMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: siteName,
  url: siteOrigin,
  description: siteDescription,
  areaServed: "Goa",
  serviceType: "Vacation rental property management",
};
