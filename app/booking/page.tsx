import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { buildMarketingMetadata } from "@/app/seo";
import { BookingHero, BookingWhatsAppDemo } from "@/components/home/booking-hero";
import { BookingGuestReviews } from "@/components/home/booking-guest-reviews";
import { BookingGuestServices } from "@/components/home/booking-guest-services";
import { BookingWhyDirect } from "@/components/home/booking-why-direct";
import { CalendlyPopupLoader } from "@/components/home/calendly-popup";
import { FamilySection } from "@/components/home/family-section";
import { PublicFooter } from "@/components/home/public-footer";
import { GuestHeader } from "@/components/home/guest-header";
import { PropertyCatalogue } from "@/src/features/catalogue/property-catalogue";
import { loadPublicCatalogue } from "@/src/features/catalogue/public-catalogue-data";

const bookingFont = Figtree({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-homepage",
});

export const metadata: Metadata = {
  ...buildMarketingMetadata({
    title: "Stays in Goa | CurateMyStay",
    description:
      "Hand-picked villas and apartments in Goa, personally managed by our team. Book directly on WhatsApp for a better rate than Airbnb.",
    canonicalPath: "/booking",
  }),
};

export default async function BookingPage() {
  const catalogue = await loadPublicCatalogue();

  return (
    <div className={`${bookingFont.variable} cms-homepage`}>
      <main className="min-h-screen bg-white font-sans text-[#222222] antialiased">
        <CalendlyPopupLoader />
        <GuestHeader page="booking" />

        <div className="relative z-10 pt-6 lg:pt-7">
          <BookingHero
            imageAlt="Sunlit living room with a cream sectional sofa and floor-to-ceiling windows"
            imageUrl="/homepage/booking-hero.jpg"
          />
          <BookingWhatsAppDemo />
          <PropertyCatalogue failed={catalogue.failed} properties={catalogue.properties} />
        </div>

        <BookingWhyDirect />
        <BookingGuestReviews />
        <BookingGuestServices />
        <FamilySection />

        <PublicFooter analyticsLocation="booking_page" homeAnchorPrefix="/" />
      </main>
    </div>
  );
}
