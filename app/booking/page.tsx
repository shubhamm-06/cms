import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { buildMarketingMetadata } from "@/app/seo";
import { BookingGuestReviews } from "@/components/home/booking-guest-reviews";
import { BookingGuestServices } from "@/components/home/booking-guest-services";
import { BookingHero } from "@/components/home/booking-hero";
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

        <BookingHero
          imageAlt={leadProperty?.cover_alt_text}
          imageUrl={getPropertyImageUrl(leadProperty?.cover_storage_path)}
        />

        {catalogue.failed ? (
          <section className="bg-white">
            <div className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6 sm:py-16 md:px-8">
              <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-[#e2d5cd] bg-[#fbf7f1] px-6 py-12 text-center">
                <h2 className="text-[19px] font-bold tracking-[-0.01em] text-[#222222]">
                  We could not load our stays just now
                </h2>
                <p className="mx-auto mt-2.5 max-w-md text-[15px] leading-7 text-[#484848]">
                  Please refresh the page in a moment. If it keeps happening, message us and we will
                  share the homes that suit you.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <div className="relative z-10 -mt-8 lg:-mt-[40px]">
            <PropertyCatalogue properties={catalogue.properties} />
          </div>
        )}

        <BookingWhyDirect />
        <BookingGuestReviews />
        <BookingGuestServices />
        <FamilySection />

        <PublicFooter analyticsLocation="booking_page" homeAnchorPrefix="/" />
      </main>
    </div>
  );
}
