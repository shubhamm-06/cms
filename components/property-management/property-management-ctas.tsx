"use client";

import { ArrowRight, CalendarDays, MessageCircle } from "lucide-react";
import { openCalendlyPopup } from "@/components/home/calendly-popup";
import { trackDataLayerEvent, trackWhatsAppClick } from "@/src/lib/analytics";
import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";

function bookCall(location: string) {
  trackDataLayerEvent("calendar_click", {
    cta_location: location,
    destination_type: "calendly",
  });
  openCalendlyPopup();
}

function forecast(location: string) {
  trackDataLayerEvent("forecast_form_open", {
    cta_location: location,
    form_name: "owner_forecast",
  });
}

const primaryClass = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#ff5a5f] px-5 py-3 text-center text-[15px] font-semibold leading-6 text-white shadow-sm transition hover:bg-[#e54b50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2";
const secondaryClass = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#d9cbc4] bg-white px-5 py-3 text-center text-[15px] font-semibold leading-6 text-[#2f2a27] transition hover:bg-[#fff8f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2";

export function HeroCtas() {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <button className={primaryClass} onClick={() => bookCall("property_management_goa_hero")} type="button">
        Book a discovery call <CalendarDays aria-hidden="true" className="h-4 w-4" />
      </button>
      <a className={secondaryClass} href="/property-management-proposal#forecast" onClick={() => forecast("property_management_goa_hero")}>
        Get my property’s revenue forecast <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </a>
    </div>
  );
}

export function ClosingCtas() {
  const whatsappUrl = getPublicWhatsAppUrl();

  return (
    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
      <button className={primaryClass} onClick={() => bookCall("property_management_goa_closing")} type="button">
        Book a discovery call <CalendarDays aria-hidden="true" className="h-4 w-4" />
      </button>
      {whatsappUrl ? (
        <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-transparent px-5 py-3 text-center text-[15px] font-semibold leading-6 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b1714]" href={whatsappUrl} onClick={() => trackWhatsAppClick("property_management_goa_closing")} rel="noopener noreferrer" target="_blank">
          WhatsApp us directly <MessageCircle aria-hidden="true" className="h-4 w-4" />
        </a>
      ) : null}
    </div>
  );
}
