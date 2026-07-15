import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { ogImage, siteName } from "@/app/seo";
import { AboutPublicPage } from "@/components/home/reference-home";

const aboutCanonicalUrl = "https://curatemystay.net/about";

const aboutFont = Figtree({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-homepage",
});

export const metadata: Metadata = {
  title: {
    absolute: "About CurateMyStay | Goa Property Management",
  },
  description:
    "Learn about CurateMyStay, a Goa-based property management firm focused on short-term rental operations, owner visibility and long-term property value.",
  keywords: [
    "About CurateMyStay",
    "property management company in Goa",
    "Goa short-term rental management",
    "Goa holiday home management",
  ],
  alternates: {
    canonical: aboutCanonicalUrl,
  },
  openGraph: {
    title: "About CurateMyStay",
    description:
      "CurateMyStay is a Goa-based property management firm combining hands-on operations, owner visibility and long-term value in mind.",
    images: [ogImage],
    siteName,
    type: "website",
    url: aboutCanonicalUrl,
  },
};

export default function AboutPage() {
  return (
    <div className={`${aboutFont.variable} cms-homepage`}>
      <AboutPublicPage />
    </div>
  );
}
