"use client";

import { Check } from "lucide-react";
import { openCalendlyPopup } from "@/components/home/calendly-popup";
import { trackDataLayerEvent } from "@/src/lib/analytics";

const tiers = [
  {
    featured: false,
    forWhom: [
      "Existing Airbnb properties with a proven track record",
      "Fully furnished and guest-ready homes",
      "Recently renovated properties",
      "Homes requiring little to no setup work",
    ],
    gets: [
      "End-to-end property operations",
      "Multi-platform listing & revenue management",
      "Guest communication & support",
      "Monthly owner reporting & approvals",
      "Compliance assistance & recurring oversight",
    ],
    name: "Signature",
    split: "80 / 20",
    splitNote: "Owner / CMS on net profit",
    tag: "For market-ready homes that are ready to start hosting immediately.",
  },
  {
    featured: true,
    forWhom: [
      "First-time Airbnb owners",
      "Furnished homes entering the STR market",
      "Properties requiring repositioning or branding",
      "Homes needing compliance and operational readiness support",
    ],
    gets: [
      "Everything in Signature, plus:",
      "Professional photography & listing creation",
      "Property positioning & launch strategy",
      "Styling and presentation recommendations",
      "Assistance with licenses, registrations & NOCs",
      "Safety, compliance & operational readiness guidance",
      "Ongoing liaison support for approvals and renewals",
    ],
    name: "Curated",
    split: "70 / 30",
    splitNote: "Owner / CMS on net profit",
    tag: "For homes that need activation before they can perform as professional short-term rentals.",
  },
  {
    featured: false,
    forWhom: [
      "Newly purchased properties",
      "Empty or partially furnished homes",
      "Properties requiring fit-out or furnishing",
      "Owners building a hospitality asset from the ground up",
    ],
    gets: [
      "Everything in Curated, plus:",
      "Architect & design partner coordination",
      "Furniture, decor & procurement support",
      "End-to-end fit-out project management",
      "Property branding & positioning",
      "Launch strategy from concept to first booking",
    ],
    name: "Bespoke",
    split: "Custom",
    splitNote: "Structured around the scope of work",
    tag: "For properties that require complete transformation before launch.",
  },
] as const;

function trackTierClick() {
  trackDataLayerEvent("calendar_click", {
    cta_location: "tier_card",
    destination_type: "calendly",
  });
  openCalendlyPopup();
}

function PricingButton({ children, featured }: { children: React.ReactNode; featured: boolean }) {
  return (
    <button
      className={`inline-flex min-h-11 w-full max-w-full items-center justify-center gap-[9px] rounded-xl border px-4 py-3 text-[15px] font-semibold leading-[1.2] whitespace-normal transition-all duration-150 active:scale-[0.98] ${featured ? "border-transparent bg-[#ff5a5f] text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:bg-[#e54b50] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]" : "border-[#dddddd] bg-white text-[#222222] hover:bg-[#f7f7f7]"}`}
      onClick={trackTierClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function PricingCards() {
  return (
    <div className="grid items-start gap-6 sm:mt-2 lg:grid-cols-3">
      {tiers.map((tier) => (
        <div
          className={`relative min-w-0 rounded-[20px] bg-white px-5 py-7 sm:rounded-[24px] sm:px-7 sm:py-8 ${tier.featured ? "border-2 border-[#ff5a5f] shadow-[0_12px_28px_rgba(0,0,0,0.14)] lg:-translate-y-2" : "border border-[#dddddd] shadow-sm"}`}
          key={tier.name}
        >
          {tier.featured ? <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#ff5a5f] px-4 py-1.5 text-xs font-extrabold uppercase text-white">Most Chosen</div> : null}
          <h3 className="text-2xl font-extrabold text-[#222222]">{tier.name}</h3>
          <p className="mt-2 min-h-[44px] text-sm leading-6 text-[#717171]">{tier.tag}</p>
          <div className={`mt-5 text-[34px] font-extrabold leading-none tracking-[-0.02em] ${tier.featured ? "text-[#ff5a5f]" : "text-[#222222]"}`}>{tier.split}</div>
          <p className="mt-1 text-sm text-[#717171]">{tier.splitNote}</p>
          <div className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#b0b0b0]">Best suited for</div>
          <ul className="mt-4 grid gap-3">
            {tier.forWhom.map((item) => <li className="flex gap-2 text-sm leading-5 text-[#484848]" key={item}><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#b0b0b0]" /><span>{item}</span></li>)}
          </ul>
          <div className="my-6 h-px bg-[#ebebeb]" />
          <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#b0b0b0]">Includes</div>
          <ul className="mt-4 grid gap-3">
            {tier.gets.map((item) => <li className="flex gap-2 text-sm leading-5 text-[#484848]" key={item}><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ff5a5f]" /><span>{item}</span></li>)}
          </ul>
          <div className="mt-7"><PricingButton featured={tier.featured}>Choose {tier.name}</PricingButton></div>
        </div>
      ))}
    </div>
  );
}
