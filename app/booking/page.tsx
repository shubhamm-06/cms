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
import { business } from "@/src/lib/business";
import { buildCatalogueJsonLd, serializeJsonLd } from "@/src/lib/public-structured-data";

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
  const areas = [...new Set(catalogue.properties.map((property) => property.area?.trim()).filter((area): area is string => Boolean(area)))].sort((a, b) => a.localeCompare(b));

  return (
    <div className={`${bookingFont.variable} cms-homepage`}>
      {!catalogue.failed && catalogue.properties.length > 0 ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildCatalogueJsonLd(catalogue.properties)) }} />
      ) : null}
      <main className="min-h-screen bg-white font-sans text-[#222222] antialiased">
        <CalendlyPopupLoader />
        <GuestHeader page="booking" />

        <div className="relative z-10 pt-6 lg:pt-7">
          <BookingHero
            imageAlt="Sunlit living room with a cream sectional sofa and floor-to-ceiling windows"
            imageUrl="/homepage/booking-hero.jpg"
          />
          <BookingWhatsAppDemo />
          <p className="mx-auto max-w-[1180px] px-4 pt-10 text-[16px] leading-7 text-public-body sm:px-6 md:px-8">
            {business.guests.summary}{" "}
            {areas.length ? `Areas in this catalogue: ${areas.join(", ")}. ` : ""}
            {business.guests.booking}
          </p>
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
