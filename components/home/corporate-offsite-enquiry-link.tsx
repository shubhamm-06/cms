"use client";

import { FaWhatsapp } from "react-icons/fa6";
import { stayOptionsCopy, type StayOptionId } from "@/src/features/corporate-offsite/stay-options-copy";
import { trackBookingEnquiry, trackWhatsAppClick } from "@/src/lib/analytics";
import { publicType } from "@/src/lib/public-type";
import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";

const base = `${publicType.button} w-full outline-none focus-visible:ring-2 focus-visible:ring-public-ink focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none sm:w-auto`;

const variants = {
  primary: { link: `${publicType.buttonLg} border-transparent bg-whatsapp shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:bg-whatsapp-hover`, icon: "" },
  secondary: { link: `${publicType.buttonMd} border-public-control bg-white hover:bg-public-hover`, icon: "text-whatsapp-ink" },
};

/** The WhatsApp button on a stay option card. Client-side only for the click tracking. */
export function CorporateOffsiteEnquiryLink({ optionId, title, variant }: { optionId: StayOptionId; title: string; variant: keyof typeof variants }) {
  const href = getPublicWhatsAppUrl(stayOptionsCopy.enquiryMessage(title));
  if (!href) return null;

  return (
    <a
      className={`${base} ${variants[variant].link}`}
      href={href}
      onClick={() => {
        trackWhatsAppClick("corporate_offsite_option");
        trackBookingEnquiry("corporate_offsite_option", "corporate_offsite", undefined, optionId);
      }}
      rel="noopener noreferrer"
      target="_blank"
    >
      {/* The unlayered `a { color: inherit }` outranks Tailwind text colours, so the label colour sits on this span. */}
      <span className="inline-flex items-center gap-[9px] text-public-ink">
        <FaWhatsapp aria-hidden="true" className={`h-5 w-5 shrink-0 ${variants[variant].icon}`} />
        {stayOptionsCopy.enquiryLabel}
        {/* Three buttons share the visible label, so screen readers also hear which stay it is. */}
        <span className="sr-only">{`: ${title}`}</span>
      </span>
    </a>
  );
}
