"use client";

import { Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { usePropertyEnquiry } from "@/src/features/catalogue/property-enquiry-context";
import { formatStayRange } from "@/src/features/catalogue/property-enquiry-message";
import { STAY_DATES_SECTION_ID } from "@/src/features/catalogue/property-mobile-date-picker";
import { getPublicPhoneUrl } from "@/src/lib/public-whatsapp";

/**
 * Sticky enquiry bar for `/property/[slug]` below `lg`, where the stay card sits
 * low on the page. It replaces the site-wide floating WhatsApp button on these
 * pages. Dates and guests share the stay card's state and validation. An in-flow spacer of the bar's height follows the footer,
 * so the bar never covers the footer or the end of the content.
 */
export function PropertyMobileEnquiryBar({
  acceptBookingRequests,
}: {
  acceptBookingRequests: boolean;
}) {
  const enquiry = usePropertyEnquiry();
  const whatsappUrl = acceptBookingRequests ? enquiry.whatsappUrl : null;
  const phoneHref = getPublicPhoneUrl();
  const range = formatStayRange(enquiry.checkIn, enquiry.checkOut);

  if (!whatsappUrl && !phoneHref) return null;

  function scrollToDates() {
    document.getElementById(STAY_DATES_SECTION_ID)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      block: "start",
    });
  }

  return (
    <>
      <div aria-hidden="true" className="h-[calc(76px+env(safe-area-inset-bottom))] lg:hidden" />
      <div
        aria-label="Enquire about this stay"
        className="fixed inset-x-0 bottom-0 z-[60] border-t border-public-hairline bg-white/95 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden"
        role="region"
      >
        <div className="mx-auto flex max-w-[640px] items-center gap-3">
          {/* Below md: the chosen dates (or a prompt), which jump to the inline calendar. */}
          {whatsappUrl ? (
            <button className="min-w-0 flex-1 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-public-coral md:hidden" onClick={scrollToDates} type="button">
              {range ? (
                <>
                  <span className="block truncate text-[15px] font-semibold text-public-ink underline underline-offset-4">{range}</span>
                  <span className="block truncate text-[13px] text-public-muted">
                    {enquiry.guestCount} {enquiry.guestCount === 1 ? "guest" : "guests"}
                  </span>
                </>
              ) : (
                <>
                  <span className="block text-[15px] font-bold text-public-ink">Add dates</span>
                  <span className="block text-[13px] text-public-muted">for availability</span>
                </>
              )}
            </button>
          ) : null}
          {whatsappUrl ? (
            // The colour sits on the inner span: globals.css sets `a { color: inherit }` unlayered.
            <a
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-whatsapp px-3.5 py-2.5 md:flex-1 md:shrink md:px-4 outline-none transition-colors hover:bg-whatsapp-hover focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2"
              href={whatsappUrl}
              onClick={(event) => enquiry.handleWhatsAppClick(event, "property_page_mobile_bar")}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="inline-flex items-center gap-2 whitespace-nowrap text-[15px] font-semibold text-white md:text-[16px]">
                <FaWhatsapp aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
                Ask about this stay
              </span>
            </a>
          ) : (
            <p className="flex-1 text-[14px] leading-5 text-public-body">Enquiries for this stay are currently paused.</p>
          )}
          {phoneHref ? (
            <a
              aria-label="Call us"
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-public-control bg-white outline-none transition-colors hover:bg-public-hover focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2"
              href={phoneHref}
            >
              <span className="text-public-ink">
                <Phone aria-hidden="true" className="h-5 w-5" />
              </span>
            </a>
          ) : null}
        </div>
      </div>
    </>
  );
}
