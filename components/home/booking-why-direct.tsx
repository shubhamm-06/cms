"use client";

import {
  BadgePercent,
  ConciergeBell,
  MessageCircle,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useId, useState } from "react";
import { portfolioProof } from "@/components/home/case-studies-data";

type DirectBookingBenefit = {
  description: string;
  icon: LucideIcon;
  title: string;
};

type DirectBookingComparison = {
  airbnb: string;
  direct: string;
  label: string;
};

const portfolioRating = portfolioProof[0].value.split(" / ")[0];

// Preserve the existing data shape; the editorial layout does not render icons.
const directBookingBenefits: DirectBookingBenefit[] = [
  {
    description:
      "Skip the platform fee. Direct rates are typically 10 to 15% lower than Airbnb. The savings stay with you.",
    icon: BadgePercent,
    title: "Better prices",
  },
  {
    description:
      "Talk to us, not a chatbot. WhatsApp is open before, during and after your stay.",
    icon: MessageCircle,
    title: "Direct WhatsApp",
  },
  {
    description:
      "In-villa chef, airport pickup, scooter rental and day trips, all booked in one place.",
    icon: ConciergeBell,
    title: "Concierge add-ons",
  },
  {
    description:
      `The same team, same property, same ${portfolioRating} rated experience. Just a different door in.`,
    icon: ShieldCheck,
    title: "Same Superhost service",
  },
];

const directBookingComparison: DirectBookingComparison[] = [
  { airbnb: "~14% added to rate", direct: "\u20b90", label: "Service fee" },
  { airbnb: "Through the platform", direct: "Direct WhatsApp", label: "Communication" },
  { airbnb: "Limited", direct: "Full menu", label: "Concierge add-ons" },
  { airbnb: "None", direct: "5\u201310% off second+ stays", label: "Loyalty discounts" },
  { airbnb: "Per Airbnb policy", direct: "Free up to 31 days before", label: "Cancellation" },
  { airbnb: "Card only", direct: "Card \u00b7 UPI \u00b7 Bank \u00b7 International", label: "Payment options" },
];

export function BookingWhyDirect() {
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const comparisonId = useId();

  return (
    <section aria-labelledby="why-direct-title" className="bg-white text-[#1f1f1d] [font-family:var(--font-homepage)]">
      <div className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8 lg:px-16 lg:py-24">
        <div className="grid items-start gap-y-8 lg:grid-cols-[5fr_7fr] lg:gap-x-20 lg:gap-y-6">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <h2 id="why-direct-title" className="text-[34px] font-bold leading-[1.08] tracking-tight lg:text-[44px]">
              Why book with us directly
            </h2>
            <p className="mt-6 max-w-[400px] text-base leading-relaxed text-[#4a4a45] lg:text-[17px]">
              You can find some of our properties on Airbnb. Here is what changes when you book with us instead.
            </p>

            <div className="mt-8 rounded-xl border border-[#e3e0d8] bg-white p-5">
              <p className="text-[13px] leading-5 text-[#5c5c57]">Same property, same night</p>
              <div className="mt-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[13px] leading-5">
                  <span>Airbnb</span>
                  <span className="text-[#5c5c57]">Platform fee included</span>
                </div>
                <div aria-hidden="true" className="mt-2 h-3 w-full bg-[#d6d2c8]" />
              </div>
              <div className="mt-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[13px] leading-5">
                  <span>Book direct</span>
                  <span className="font-semibold text-[#a8321c]">10 to 15% lower</span>
                </div>
                <div aria-hidden="true" className="mt-2 h-3 w-[87%] bg-public-coral-ink" />
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-[#5c5c57]">Illustrative. Exact savings vary by property and dates.</p>
            </div>
          </div>

          <ol className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            {directBookingBenefits.map((benefit, index) => (
              <li className="grid grid-cols-[36px_minmax(0,1fr)] border-t border-[#e3e0d8] py-5 last:border-b lg:grid-cols-[56px_minmax(0,1fr)] lg:py-7" key={benefit.title}>
                {/* Slightly darker than the reference gray to maintain 4.5:1 contrast. */}
                <span aria-hidden="true" className="pt-1 text-sm font-medium text-[#73736c]">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-xl font-semibold leading-snug lg:text-[22px]">{benefit.title}</h3>
                  <p className="mt-2 max-w-[520px] text-base leading-relaxed text-[#3b3b37]">{benefit.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="lg:col-start-1 lg:row-start-2">
            <button
              aria-controls={comparisonId}
              aria-expanded={comparisonOpen}
              className="inline-flex min-h-11 items-center gap-2 rounded-sm text-left text-[15px] font-semibold underline decoration-1 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f1f1d]"
              onClick={() => setComparisonOpen((current) => !current)}
              type="button"
            >
              Compare side-by-side
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`size-4 shrink-0 transition-transform duration-200 ${comparisonOpen ? "rotate-180" : ""}`}>
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {comparisonOpen ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-[#e3e0d8] bg-white" id={comparisonId}>
            <table className="w-full table-fixed text-left text-[13px] leading-relaxed sm:text-sm">
              <caption className="sr-only">Airbnb and CMS Direct booking comparison</caption>
              <thead className="bg-[#f1efe9]">
                <tr>
                  <th scope="col" className="p-3 font-semibold sm:p-5">Booking feature</th>
                  <th scope="col" className="p-3 font-semibold text-[#5c5c57] sm:p-5">Airbnb</th>
                  <th scope="col" className="p-3 font-semibold sm:p-5">CMS Direct</th>
                </tr>
              </thead>
              <tbody>
                {directBookingComparison.map((row) => (
                  <tr className="border-t border-[#e3e0d8]" key={row.label}>
                    <th scope="row" className="p-3 align-top font-semibold sm:p-5">{row.label}</th>
                    <td className="p-3 align-top text-[#5c5c57] sm:p-5">{row.airbnb}</td>
                    <td className="p-3 align-top sm:p-5">{row.direct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}
