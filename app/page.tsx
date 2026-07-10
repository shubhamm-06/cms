import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { ReferenceHome } from "@/components/home/reference-home";
import { homeJsonLd, siteDescription, siteTitle } from "@/app/seo";

const homepageFont = Figtree({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-homepage",
});

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
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
