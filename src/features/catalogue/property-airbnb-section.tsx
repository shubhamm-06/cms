"use client";

import { ExternalLink } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { usePropertyEnquiry } from "@/src/features/catalogue/property-enquiry-context";

/**
 * Social proof for `/property/[slug]`: a link to the stay's own Airbnb listing (where its
 * reviews live) and a direct-booking prompt. Only rendered for a valid Airbnb listing URL,
 * so a stay without one never implies it has Airbnb reviews. The WhatsApp button is the
 * page's existing enquiry button (same message, date validation and analytics).
 */
export function PropertyAirbnbSection({
  acceptBookingRequests,
  airbnbListingUrl,
}: {
  acceptBookingRequests: boolean;
  airbnbListingUrl: string;
}) {
  const enquiry = usePropertyEnquiry();

  return (
    <section aria-labelledby="airbnb-listing-heading" className="grid gap-6">
      <div>
        <h2 className="text-[21px] font-bold leading-tight tracking-[-0.01em] text-public-ink sm:text-[23px]" id="airbnb-listing-heading">
          See Our Guest Reviews &amp; Airbnb Listing
        </h2>
        <p className="mt-2 text-[15.5px] leading-[1.7] text-public-body sm:text-base">
          Explore our property&rsquo;s Airbnb listing, browse guest reviews, and see real guest experiences before booking with us.
        </p>
        <a
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-public-ink px-4 py-2.5 text-[14.5px] font-semibold text-public-ink outline-none transition-colors hover:bg-public-hover focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2"
          href={airbnbListingUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          View Reviews &amp; Listing on Airbnb
          <ExternalLink aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>

      {acceptBookingRequests && enquiry.whatsappUrl ? (
        <div className="rounded-[20px] bg-public-cream p-5 sm:p-6">
          <h3 className="text-[18px] font-bold leading-tight text-public-ink sm:text-[19px]">Book Directly for a Better Rate</h3>
          <p className="mt-2 text-[15px] leading-[1.7] text-public-body">
            Enjoy a better rate by booking directly with CurateMyStay. Contact us on WhatsApp for pricing and availability.
          </p>
          {/* The colour sits on the inner span: globals.css sets `a { color: inherit }` unlayered. */}
          <a
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-whatsapp px-4 py-2.5 outline-none transition-colors hover:bg-whatsapp-hover focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2"
            href={enquiry.whatsappUrl}
            onClick={(event) => enquiry.handleWhatsAppClick(event, "property_page_direct_booking")}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-white">
              <FaWhatsapp aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
              Ask about this stay
            </span>
          </a>
        </div>
      ) : null}
    </section>
  );
}
