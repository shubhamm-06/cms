import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { buildMarketingMetadata } from "@/app/seo";
import { AboutPublicPage } from "@/components/home/reference-home";

const aboutFont = Figtree({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-homepage",
});

export const metadata: Metadata = {
  ...buildMarketingMetadata({
    title: "About Curate My Stay | Property Management Company in Goa",
    description:
      "A family-run property management company in Goa managing short-term rentals like an investment portfolio. 20+ years facility management, 4.98\u2605 across 200+ stays.",
    canonicalPath: "/about",
  }),
};

export default function AboutPage() {
  return (
    <div className={`${aboutFont.variable} cms-homepage`}>
      <AboutPublicPage />
    </div>
  );
}
