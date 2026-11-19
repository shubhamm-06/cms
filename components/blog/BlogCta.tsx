"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";
import { trackDataLayerEvent, trackWhatsAppClick } from "@/src/lib/analytics";

const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

export function BlogCta({ heading, text }: { heading: string; text: string }) {
  const whatsappUrl = getPublicWhatsAppUrl("Hi, I’m looking for a villa in Goa for New Year. Dates: ___, guests: ___.");
  return <aside className="relative mt-14 overflow-hidden rounded-3xl bg-neutral-950 px-6 py-10 text-white sm:px-10 sm:py-12">
    <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-public-coral/20 blur-3xl" />
    <div className="relative z-10">
      <h2 className="max-w-md text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{heading}</h2>
      <p className="mt-3 max-w-lg text-lg leading-relaxed text-neutral-300">{text}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-public-coral px-7 text-base font-semibold text-neutral-950 transition hover:opacity-90 active:scale-[0.98] sm:w-auto ${focus}`} href="/booking" onClick={() => trackDataLayerEvent("catalogue_click", { page_path: "/blog/last-minute-villa-goa-new-year-2027", cta_location: "blog_article_end" })}><span>Browse villas</span></Link>
        {whatsappUrl ? <a className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/25 px-7 text-base font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] sm:w-auto ${focus}`} href={whatsappUrl} onClick={() => trackWhatsAppClick("blog_article_end")} rel="noreferrer" target="_blank"><MessageCircle aria-hidden="true" className="h-4 w-4" />WhatsApp us</a> : null}
      </div>
      <p className="mt-5 text-sm text-neutral-400">Pay by UPI · Confirmed on WhatsApp</p>
    </div>
  </aside>;
}
