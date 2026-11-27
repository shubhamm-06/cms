import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { buildMarketingMetadata } from "@/app/seo";
import { CorporateOffsiteHero } from "@/components/home/corporate-offsite-hero";
import { CorporateOffsiteFaqs } from "@/components/home/corporate-offsite-faqs";
import { CorporateOffsiteHowToBook } from "@/components/home/corporate-offsite-how-to-book";
import { CorporateOffsiteOptions } from "@/components/home/corporate-offsite-options";
import { CorporateOffsiteWhyUs } from "@/components/home/corporate-offsite-why-us";
import { GuestHeader } from "@/components/home/guest-header";
import { PublicFooter } from "@/components/home/public-footer";

const corporateOffsiteFont = Figtree({ display: "swap", subsets: ["latin"], variable: "--font-homepage" });

export const metadata: Metadata = {
  ...buildMarketingMetadata({
    title: "Corporate Offsite Villas in Goa - CurateMyStay",
    description: "Private building in Goa for your team offsite, with Wi-Fi, workspace and common space. Also villas and apartments. GST invoice. Quote on WhatsApp.",
    canonicalPath: "/corporate-offsite-villas-goa",
  }),
  robots: { index: true, follow: true },
};

export default function CorporateOffsiteVillasGoaPage() {
  return (
    <div className={`${corporateOffsiteFont.variable} cms-homepage`}>
      <main className="min-h-screen bg-public-ink font-sans text-white antialiased">
        <GuestHeader page="booking" />
        <CorporateOffsiteHero />
        <CorporateOffsiteOptions />
        <CorporateOffsiteWhyUs />
        <CorporateOffsiteHowToBook />
        <CorporateOffsiteFaqs />
      </main>
      <PublicFooter analyticsLocation="footer" homeAnchorPrefix="/" />
    </div>
  );
}
