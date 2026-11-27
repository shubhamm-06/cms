"use client";

import { heroQuoteMessage, whatsappButton, WhatsAppButtonLabel } from "@/components/home/corporate-offsite-hero";
import { trackBookingEnquiry, trackWhatsAppClick } from "@/src/lib/analytics";
import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";

/**
 * The hero's WhatsApp quote button (same classes, message and events) for use further down the page.
 * `optionId` is what tells the two apart in reporting. The label is dark here: white on the WhatsApp
 * green is about 2:1.
 */
export function CorporateOffsiteQuoteButton({ optionId }: { optionId: string }) {
  const href = getPublicWhatsAppUrl(heroQuoteMessage);
  if (!href) return null;

  return (
    <a
      // This section has no shadows, so the hero button's glow is switched off.
      className={`${whatsappButton} shadow-none! sm:w-auto`}
      href={href}
      onClick={() => {
        trackWhatsAppClick("corporate_offsite_hero_direct");
        trackBookingEnquiry("hero_whatsapp", "corporate_offsite", undefined, optionId);
      }}
      rel="noopener noreferrer"
      target="_blank"
    >
      <WhatsAppButtonLabel colour="text-public-ink" />
    </a>
  );
}
