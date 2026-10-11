"use client";

import { Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { buildStayEnquiryMessage } from "@/src/features/catalogue/property-enquiry-message";
import { trackWhatsAppClick } from "@/src/lib/analytics";
import { getPublicPhoneUrl, getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";

/**
 * Sticky enquiry bar for `/property/[slug]` below `lg`, where the stay card sits
 * low on the page. It replaces the site-wide floating WhatsApp button on these
 * pages. The message carries the property name and URL only; dates are chosen
 * in the stay card. An in-flow spacer of the bar's height follows the footer,
 * so the bar never covers the footer or the end of the content.
 */
export function PropertyMobileEnquiryBar({
  acceptBookingRequests,
  propertyName,
  propertyUrl,
}: {
  acceptBookingRequests: boolean;
  propertyName: string;
  propertyUrl: string;
}) {
  const whatsappUrl = acceptBookingRequests
    ? getPublicWhatsAppUrl(buildStayEnquiryMessage({ propertyName, propertyUrl }))
    : null;
  const phoneHref = getPublicPhoneUrl();

  if (!whatsappUrl && !phoneHref) return null;

  return (
    <>
      <div aria-hidden="true" className="h-[calc(76px+env(safe-area-inset-bottom))] lg:hidden" />
      <div
        aria-label="Enquire about this stay"
        className="fixed inset-x-0 bottom-0 z-[60] border-t border-public-hairline bg-white/95 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden"
        role="region"
      >
        <div className="mx-auto flex max-w-[640px] items-center gap-3">
          {whatsappUrl ? (
            // The colour sits on the inner span: globals.css sets `a { color: inherit }` unlayered.
            <a
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-whatsapp px-4 py-2.5 outline-none transition-colors hover:bg-whatsapp-hover focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2"
              href={whatsappUrl}
              onClick={() => trackWhatsAppClick("property_page_mobile_bar")}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="inline-flex items-center gap-2 text-[16px] font-semibold text-white">
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
