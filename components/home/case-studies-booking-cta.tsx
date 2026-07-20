"use client";

import { CalendarDays } from "lucide-react";
import { openCalendlyPopup } from "@/components/home/calendly-popup";
import { trackDataLayerEvent } from "@/src/lib/analytics";

export function CaseStudiesBookingCta() {
  return (
    <button
      className="inline-flex min-h-11 w-full items-center justify-center gap-[9px] rounded-xl border border-white/45 bg-transparent px-5 py-3.5 text-center text-base font-semibold leading-[1.2] text-white transition-all duration-150 hover:border-white/70 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b1714] active:scale-[0.98] sm:w-auto sm:px-7 sm:py-4 sm:text-[17px]"
      onClick={() => {
        trackDataLayerEvent("calendar_click", {
          cta_location: "case_studies_page",
          destination_type: "calendly",
        });
        openCalendlyPopup();
      }}
      type="button"
    >
      <CalendarDays aria-hidden="true" className="h-5 w-5 shrink-0" />
      Book a Call
    </button>
  );
}
