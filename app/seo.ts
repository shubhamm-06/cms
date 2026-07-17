import type { Metadata } from "next";

export const siteName = "CurateMyStay";
export const siteTitle = "CurateMyStay";
export const siteDescription =
  "Full-service Airbnb and short-term rental management in Goa with owner-approved monthly P&L visibility.";
export const siteOrigin = "https://www.curatemystay.net";

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

type MarketingMetadataOptions = {
  canonicalPath: string;
  description: string;
  openGraphDescription?: string;
  openGraphTitle?: string;
  title: string;
  twitterDescription?: string;
  twitterTitle?: string;
};

export function buildMarketingMetadata({
  canonicalPath,
  description,
  openGraphDescription,
  openGraphTitle,
  title,
  twitterDescription,
  twitterTitle,
}: MarketingMetadataOptions): Metadata {
  const resolvedOpenGraphTitle = openGraphTitle ?? title;
  const resolvedOpenGraphDescription = openGraphDescription ?? description;
  const resolvedTwitterTitle = twitterTitle ?? resolvedOpenGraphTitle;
  const resolvedTwitterDescription =
    twitterDescription ?? resolvedOpenGraphDescription;

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
      title: resolvedOpenGraphTitle,
      description: resolvedOpenGraphDescription,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTwitterTitle,
      description: resolvedTwitterDescription,
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
