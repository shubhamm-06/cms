"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import type { MouseEvent } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { goaStaysCopy } from "@/src/features/goa-stays/goa-stays-copy";
import { buildGuestHeaderWhatsAppMessage } from "@/src/features/catalogue/guest-whatsapp-message";
import { trackWhatsAppClick } from "@/src/lib/analytics";
import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";

/** `staysTargetId` is `villas`, or `stays` when the catalogue has no Villa group. */
export function GoaStaysHero({ staysTargetId }: { staysTargetId: "villas" | "stays" }) {
  const whatsappUrl = getPublicWhatsAppUrl(buildGuestHeaderWhatsAppMessage());

  function scrollToStays(event: MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById(staysTargetId);
    if (!target) return;

    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", `#${staysTargetId}`);
  }

  return (
    <section className="bg-public-cream px-4 py-10 text-public-ink sm:px-6 sm:py-14 md:px-8 lg:py-20">
      <div className="mx-auto grid max-w-[1180px] items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10">
        <div className="mx-auto w-full max-w-[790px] lg:mx-0">
          <h1 className="text-balance text-[36px] font-extrabold leading-[1.05] tracking-[-0.04em] text-public-ink sm:text-[44px] lg:text-[56px]">
            {goaStaysCopy.hero.heading}
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-lg leading-8 text-public-body">
            {goaStaysCopy.hero.intro}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {whatsappUrl ? (
              <a
                className="inline-flex h-[52px] w-full items-center justify-center rounded-xl bg-public-coral px-6 transition-colors hover:bg-public-coral-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2 sm:w-auto"
                href={whatsappUrl}
                onClick={() => trackWhatsAppClick("goa_stays_page")}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="inline-flex items-center gap-2 whitespace-nowrap text-[15px] font-bold text-white">
                  <FaWhatsapp aria-hidden="true" className="h-5 w-5" />
                  {goaStaysCopy.hero.primaryCta}
                </span>
              </a>
            ) : null}
            <a
              className="inline-flex h-[52px] w-full items-center justify-center rounded-xl border border-public-control bg-white px-6 transition-colors hover:bg-public-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2 sm:w-auto"
              href={`#${staysTargetId}`}
              onClick={scrollToStays}
            >
              <span className="text-[15px] font-semibold text-public-ink">{goaStaysCopy.hero.secondaryCta}</span>
            </a>
          </div>
          <p className="mt-5 flex items-center gap-2.5 text-[15px] font-medium text-public-body sm:text-[16px]">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-whatsapp">
              <Check aria-hidden="true" className="h-3.5 w-3.5 text-white" strokeWidth={3} />
            </span>
            {goaStaysCopy.hero.trustLine}
          </p>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl lg:rounded-3xl">
          <Image
            alt="Sunlit living room with a cream sofa and large windows"
            className="object-cover"
            fill
            preload
            quality={85}
            sizes="(min-width: 1024px) 50vw, 100vw"
            src="/homepage/goa-stays-hero.jpg"
          />
        </div>
      </div>
    </section>
  );
}


