import type { Metadata } from "next";

export const siteName = "CurateMyStay";
export const siteTitle = "CurateMyStay";
export const siteDescription =
  "Full-service Airbnb and short-term rental management in Goa with owner-approved monthly P&L visibility.";
export const siteOrigin = "https://www.curatemystay.net";

export const metadataBase = new URL(siteOrigin);

export const ogImage = {
  url: "/OG.png",
  width: 1256,
  height: 672,
  alt: "CurateMyStay Goa vacation rental property management preview",
} as const;

export const twitterImage = {
  url: "/OG.png",
  width: 1256,
  height: 672,
  alt: "CurateMyStay Goa vacation rental property management preview",
} as const;

type MarketingMetadataOptions = {
  canonicalPath: string;
  description: string;
  title: string;
};

export function buildMarketingMetadata({
  canonicalPath,
  description,
  title,
}: MarketingMetadataOptions): Metadata {
  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName,
      url: canonicalPath,
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [twitterImage],
    },
  };
}

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
