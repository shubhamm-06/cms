import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { buildMarketingMetadata } from "@/app/seo";
import { BookingGuestReviews } from "@/components/home/booking-guest-reviews";
import { BookingGuestServices } from "@/components/home/booking-guest-services";
import { BookingWhyDirect } from "@/components/home/booking-why-direct";
import { CalendlyPopupLoader } from "@/components/home/calendly-popup";
import { FamilySection } from "@/components/home/family-section";
import { PublicFooter } from "@/components/home/public-footer";
import { GuestHeader } from "@/components/home/guest-header";
import { PropertyCatalogue } from "@/src/features/catalogue/property-catalogue";
import { loadPublicCatalogue } from "@/src/features/catalogue/public-catalogue-data";
import { getPropertyImageUrl } from "@/src/lib/utils/property-image-url";

const bookingFont = Figtree({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-homepage",
});

export const metadata: Metadata = {
  ...buildMarketingMetadata({
    title: "Stays in Goa | CurateMyStay",
    description:
      "Browse villas, apartments and holiday homes in Goa managed by CurateMyStay. Filter by region, area, property type, guests, bedrooms and pool.",
    canonicalPath: "/booking",
  }),
};

export default async function BookingPage() {
  const catalogue = await loadPublicCatalogue();
  const leadProperty = catalogue.properties[0];

  return (
    <div className={`${bookingFont.variable} cms-homepage`}>
      <main className="min-h-screen bg-white font-sans text-[#222222] antialiased">
        <CalendlyPopupLoader />
        <GuestHeader page="booking" />

        <div className="relative z-10 pt-6 lg:pt-7">
          <PropertyCatalogue
            failed={catalogue.failed}
            heroImageAlt={leadProperty?.cover_alt_text}
            heroImageUrl={getPropertyImageUrl(leadProperty?.cover_storage_path)}
            properties={catalogue.properties}
          />
        </div>

        <BookingGuestReviews />
        <BookingWhyDirect />
        <BookingGuestServices />
        <FamilySection />

        <PublicFooter analyticsLocation="booking_page" homeAnchorPrefix="/" />
      </main>
    </div>
  );
}
