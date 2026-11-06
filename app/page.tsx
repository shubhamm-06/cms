import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { ReferenceHome } from "@/components/home/reference-home";
import { buildMarketingMetadata } from "@/app/seo";

const homepageFont = Figtree({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-homepage",
});

export const metadata: Metadata = {
  ...buildMarketingMetadata({
    title: "Airbnb & Villa Property Management in Goa | Curate My Stay",
    description:
      "Full-service Airbnb & short-term rental management in Goa. Dynamic pricing, guests, housekeeping, compliance with an owner-approved monthly P&L. 4.9+\u2605 Superhost.",
    canonicalPath: "/",
  }),
};

export default function Home() {
  return (
    <div className={`${homepageFont.variable} cms-homepage`}>
      <ReferenceHome />
    </div>
  );
}
