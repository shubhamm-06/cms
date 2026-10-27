"use client";

import {
  BadgePercent,
  ChevronDown,
  ConciergeBell,
  MessageCircle,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useId, useState } from "react";

/**
 * Direct-booking benefits shown on `/booking`.
 *
 * Every string below is the copy of the `Why book direct` section of the
 * `Curate My Stay` booking screen in `reference/booking.html`, kept in this one
 * typed module rather than inline across the four columns. There is no admin
 * content mechanism for public marketing copy yet, so editing it means editing
 * this file; making it admin-configurable is a separate, later decision.
 */

type DirectBookingBenefit = {
  description: string;
  icon: LucideIcon;
  title: string;
};

/** One `Airbnb` vs `CMS Direct` line of the reference comparison panel. */
type DirectBookingComparison = {
  airbnb: string;
  direct: string;
  label: string;
};

const directBookingBenefits: DirectBookingBenefit[] = [
  {
    description:
      "Skip the platform fee. Direct rates are typically 10–15% lower than Airbnb. The savings stay with you.",
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
      "In-villa chef, airport pickup, scooter rental, day trips — booked in one place.",
    icon: ConciergeBell,
    title: "Concierge add-ons",
  },
  {
    description:
      "The same team, same property, same 4.98 ★ experience. Just a different door in.",
    icon: ShieldCheck,
    title: "Same Superhost service",
  },
];

const directBookingComparison: DirectBookingComparison[] = [
  { airbnb: "~14% added to rate", direct: "₹0", label: "Service fee" },
  { airbnb: "Through the platform", direct: "Direct WhatsApp", label: "Communication" },
  { airbnb: "Limited", direct: "Full menu", label: "Concierge add-ons" },
  { airbnb: "None", direct: "5–10% off second+ stays", label: "Loyalty discounts" },
  { airbnb: "Per Airbnb policy", direct: "Free up to 31 days before", label: "Cancellation" },
  { airbnb: "Card only", direct: "Card · UPI · Bank · International", label: "Payment options" },
];

export function BookingWhyDirect() {
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const comparisonId = useId();

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1180px] px-4 py-[72px] sm:px-6 sm:py-[88px] md:px-8 md:py-[112px]">
        <div className="mx-auto max-w-[820px] text-center">
          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ff5a5f]">
            Why book direct
          </div>
          <h2 className="mt-3.5 text-[28px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#222222] sm:text-[34px] md:text-[42px]">
            Why book with us directly
          </h2>
          <p className="mx-auto mt-3.5 max-w-[760px] text-[17px] leading-[1.6] text-[#717171] sm:text-[18px] md:text-[19px]">
            You can find some of our properties on Airbnb. But here&rsquo;s what changes when you
            book here.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-11 sm:mt-14 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-x-7">
          {directBookingBenefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div className="min-w-0 text-center" key={benefit.title}>
                <span
                  aria-hidden="true"
                  className="mx-auto grid h-[72px] w-[72px] place-items-center rounded-[20px] bg-[#fff1f1] sm:h-[76px] sm:w-[76px]"
                >
                  <Icon className="h-[30px] w-[30px] text-[#ff5a5f]" />
                </span>
                <h3 className="mt-5 text-[20px] font-bold leading-[1.3] tracking-[-0.01em] text-[#222222] sm:text-[21px]">
                  {benefit.title}
                </h3>
                <p className="mx-auto mt-2.5 max-w-[300px] text-[16px] leading-[1.65] text-[#717171] sm:text-[16.5px]">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center sm:mt-14">
          <button
            aria-controls={comparisonId}
            aria-expanded={comparisonOpen}
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-[#dddddd] bg-white px-6 text-[15px] font-semibold text-[#222222] outline-none transition hover:border-[#b0b0b0] hover:bg-[#fbf7f1] focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2"
            onClick={() => setComparisonOpen((current) => !current)}
            type="button"
          >
            Compare side-by-side
            <ChevronDown
              aria-hidden="true"
              className={`h-[18px] w-[18px] shrink-0 transition-transform duration-200 ${comparisonOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {comparisonOpen ? (
          <div
            className="mx-auto mt-7 max-w-[760px] overflow-hidden rounded-[20px] border border-[#ebebeb] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            id={comparisonId}
          >
            <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-x-2 bg-[#f7f7f7] px-4 py-4 text-[13px] font-bold text-[#222222] sm:px-[22px] sm:text-sm">
              <span />
              <span className="text-center text-[#717171]">Airbnb</span>
              <span className="text-center text-[#ff5a5f]">CMS Direct</span>
            </div>
            {directBookingComparison.map((row) => (
              <div
                className="grid grid-cols-[1.1fr_1fr_1fr] items-center gap-x-2 border-t border-[#ebebeb] px-4 py-3.5 text-[13px] leading-[1.45] sm:px-[22px] sm:py-[15px] sm:text-[14.5px]"
                key={row.label}
              >
                <span className="font-semibold text-[#222222]">{row.label}</span>
                <span className="text-center text-[#717171]">{row.airbnb}</span>
                <span className="text-center font-semibold text-[#222222]">{row.direct}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
