"use client";

import { FaWhatsapp } from "react-icons/fa6";
import { buildGuestHeaderWhatsAppMessage } from "@/src/features/catalogue/guest-whatsapp-message";
import { goaStaysCopy } from "@/src/features/goa-stays/goa-stays-copy";
import { trackWhatsAppClick } from "@/src/lib/analytics";
import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";

export function GoaStaysClosingCta() {
  const whatsappUrl = getPublicWhatsAppUrl(buildGuestHeaderWhatsAppMessage());

  return (
    <section className="scroll-mt-20 px-4 py-12 sm:px-6 md:px-8 lg:scroll-mt-24 lg:py-16">
      <div className="mx-auto max-w-[1180px] rounded-3xl bg-public-ink p-8 text-center md:p-12">
        <h2 className="text-balance text-[28px] font-extrabold leading-[1.12] text-white sm:text-4xl">{goaStaysCopy.closingCta.heading}</h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-7 text-white/75 sm:text-[18px]">{goaStaysCopy.closingCta.text}</p>
        {whatsappUrl ? (
          <a
            className="mt-7 inline-flex h-[52px] w-full items-center justify-center rounded-xl bg-public-coral px-6 transition-colors hover:bg-public-coral-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-public-ink sm:w-auto"
            href={whatsappUrl}
            onClick={() => trackWhatsAppClick("goa_stays_page_closing")}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="inline-flex items-center gap-2 whitespace-nowrap text-[15px] font-bold text-white">
              <FaWhatsapp aria-hidden="true" className="h-5 w-5" />
              {goaStaysCopy.closingCta.button}
            </span>
          </a>
        ) : null}
        <p className="mt-5 text-[14px] leading-6 text-white/60">{goaStaysCopy.hero.trustLine}</p>
      </div>
    </section>
  );
}
