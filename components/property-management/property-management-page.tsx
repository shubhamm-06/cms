import Link from "next/link";
import Image from "next/image";
import {
  BadgeCheck,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  HandCoins,
  House,
  MapPin,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { CalendlyPopupLoader } from "@/components/home/calendly-popup";
import { PricingCards } from "@/components/home/pricing-cards";
import { PublicFooter } from "@/components/home/public-footer";
import { PublicHeader } from "@/components/home/public-header";
import {
  ClosingCtas,
  HeroCtas,
} from "@/components/property-management/property-management-ctas";

const inclusions = [
  {
    heading: "Short-term rental operations",
    label: "Guest experience",
    icon: House,
    tint: "bg-[#edf5ee] text-[#4f7a58]",
    items: [
      "Guest coordination before, during and after every stay",
      "Check-in, check-out and self check-in options",
      "Housekeeping and deep cleans between guests",
      "Linen, toiletries and consumables restocking",
      "Minor repairs and on-call maintenance",
      "24/7 guest support handled by our team",
    ],
  },
  {
    heading: "Booking & revenue management",
    label: "Commercial performance",
    icon: ChartNoAxesCombined,
    tint: "bg-[#fff0ed] text-[#d85a4f]",
    items: [
      "Listings on OTA and Direct Bookings",
      "Dynamic pricing tuned to Goa’s seasons and demand",
      "Calendar sync across platforms : no double-bookings",
      "Guest screening and ID verification",
      "Professional photography, listing copy and review management",
      "Low-season marketing pushes to hold occupancy",
    ],
  },
  {
    heading: "Compliance & property care",
    label: "Protection & readiness",
    icon: ShieldCheck,
    tint: "bg-[#fff4dc] text-[#b87a22]",
    items: [
      "Tourism / homestay registration in your name",
      "Statistic Forma reporting filed for every guest",
      "Fire NOC, trade licence and GST registration support",
      "House rules drafted, enforced and documented",
      "Damage recovery via deposits and Airbnb AirCover",
      "Society and neighbour liaison",
    ],
  },
];

const propertyTypes = [
  [
    "Villa management",
    "Private and pool villas in South and North Goa, run as high-occupancy short-term rentals with hotel-grade upkeep between stays.",
    "IMG_1581.jpg",
    "Villa managed by CurateMyStay in Goa",
  ],
  [
    "Apartment & 2/3 BHK management",
    "City and beach-belt apartments : including society-pool and workcation-ready homes. Managed for year-round occupancy.",
    "IMG_1941.jpg",
    "Apartment managed by CurateMyStay in Goa",
  ],
  [
    "Holiday-home & homestay management",
    "Second homes you use occasionally: we keep them earning when you’re away and ready when you visit.",
    "IMG_2687.jpg",
    "Holiday home managed by CurateMyStay in Goa",
  ],
  [
    "Airbnb co-hosting",
    "Already listed and self-managing? We take over pricing, guests, cleaning and reviews so your listing performs without your time.",
    "varca-2.jpg",
    "Airbnb co-hosting property in Goa",
  ],
] as const;

const steps = [
  [
    "01 · Free property assessment",
    "We look at your property, location and goals, and give you an honest revenue forecast. If short-term rental isn’t the right move, we tell you.",
  ],
  [
    "02 · Setup, listing & launch",
    "Photography, listing copy, dynamic-pricing setup, compliance paperwork and a launch-ready calendar : scoped to your tier.",
  ],
  [
    "03 · Day-to-day operations",
    "Guests, pricing, housekeeping, restocking and 24/7 support, handled by our on-the-ground team.",
  ],
  [
    "04 · Monthly P&L & payout",
    "A line-item P&L by the 5th, your approval before any money moves, your share transferred within 3 working days, TDS handled.",
  ],
] as const;

const values = [
  {
    title: "Total financial transparency",
    body: "Every booking and every expense is itemised in a monthly P&L you approve before any payout. Audit access to receipts, any time.",
    Icon: ChartNoAxesCombined,
    accent: "bg-[#fff0ed] text-[#d85a4f] group-hover:bg-[#ffe0d9]",
    line: "bg-[#ff8f82]",
  },
  {
    title: "We only earn when you earn",
    body: "Our model is a share of net profit : not a flat fee charged whether you make money or not. Our incentive is your return.",
    Icon: HandCoins,
    accent: "bg-[#fff4dc] text-[#b87a22] group-hover:bg-[#ffebbf]",
    line: "bg-[#e9aa4b]",
  },
  {
    title: "Proof, not adjectives",
    body: "4.98★ across all listings, 200+ stays delivered, Airbnb Superhost, occupancy well above the Goa area average.",
    Icon: BadgeCheck,
    accent: "bg-[#edf5ee] text-[#4f7a58] group-hover:bg-[#dcecdf]",
    line: "bg-[#7fa489]",
  },
  {
    title: "Founder-overseen, family-run",
    body: "Every property is personally overseen by the founder. Two decades of facility-management experience meets investment-side thinking.",
    Icon: UserRoundCheck,
    accent: "bg-[#f9ede8] text-[#aa6655] group-hover:bg-[#f2dcd4]",
    line: "bg-[#d8927d]",
  },
] as const;

const faqs = [
  [
    "What does an Airbnb property management company do?",
    "A full-service manager runs your short-term rental end to end: listing and photography, dynamic pricing, guest communication and screening, check-in/out, housekeeping between stays, maintenance, reviews, and legal compliance. You earn rental income without handling the day-to-day. Curate My Stay also gives you a monthly P&L you approve before any payout.",
  ],
  [
    "How much does property management cost in Goa?",
    "Most Goa operators charge a flat commission : typically 10–15% for part management and 20–30% for full-service. Curate My Stay instead takes a share of net profit (from 20% on our Signature tier), so we only earn when you earn. Your exact model depends on how much setup your property needs.",
  ],
  [
    "Can you manage my property if I live outside Goa or abroad?",
    "Yes. Most of our owners live in Mumbai, Delhi, Bangalore or overseas. We handle everything on the ground and report remotely, with a monthly P&L, receipts and TDS documentation your accountant can use. NRIs receive Form 16A on request.",
  ],
  [
    "Do you manage apartments as well as villas?",
    "Both. We manage private villas, 2 and 3 BHK apartments, holiday homes and second homes across the mid-market segment. We’ll advise on the right positioning and pricing for your property type.",
  ],
  [
    "Is short-term rental legal in Goa? What licences do I need?",
    "Yes, with the right registrations. The tourism / homestay registration is taken in your name and we handle the paperwork, along with Statistic Forma reporting for every guest, and support for Fire NOC, trade licence and GST where applicable.",
  ],
  [
    "I already list on Airbnb myself. Can you just co-host?",
    "Yes. With Airbnb co-hosting we take over pricing, guest communication, cleaning and reviews on your existing listing, so it performs without your time. We’ll review the listing first and tell you where the upside is.",
  ],
  [
    "How do I know my earnings are accurate?",
    "Every OTA booking carries a full platform paper trail and is verifiable from the platform itself. Offline and direct bookings are backed by payment proofs and guest records. There is no scenario where one number is shown to you and another exists on the booking source.",
  ],
  [
    "Is there a lock-in? Can I use my own property?",
    "There’s an initial term (typically 6–8 months), after which either side can exit with 2 months’ written notice (no hidden exit fees). You also get personal-use days each year; just give us notice to block the dates.",
  ],
] as const;

function Section({
  children,
  cream = false,
  id,
}: {
  children: React.ReactNode;
  cream?: boolean;
  id?: string;
}) {
  return (
    <section className={cream ? "bg-[#fbf7f1]" : "bg-white"} id={id}>
      <div className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6 sm:py-20 md:px-8">
        {children}
      </div>
    </section>
  );
}

function SectionHeading({
  children,
  lead,
}: {
  children: string;
  lead?: string;
}) {
  return (
    <div className="max-w-3xl">
      <h2 className="text-[30px] font-extrabold leading-[1.1] tracking-[-0.025em] text-[#222222] sm:text-[38px]">
        {children}
      </h2>
      {lead ? (
        <p className="mt-4 text-[16px] leading-7 text-[#484848] sm:text-[17px]">
          {lead}
        </p>
      ) : null}
    </div>
  );
}

export function PropertyManagementPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-[#222222] antialiased">
      <CalendlyPopupLoader />
      <PublicHeader analyticsLocation="property_management_goa" />
      <section className="bg-[#fbf7f1]">
        <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm text-[#717171]"
          >
            <Link
              className="rounded-sm hover:text-[#222222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a5f]"
              href="/"
            >
              Home
            </Link>
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
            <span aria-current="page" className="font-medium text-[#484848]">
              Property Management in Goa
            </span>
          </nav>
          <div className="mt-7 max-w-4xl">
            <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ff5a5f]">
              GOA · FULL-SERVICE SHORT-TERM RENTAL MANAGEMENT
            </div>
            <h1 className="mt-4 text-[38px] font-extrabold leading-[1.06] tracking-[-0.03em] text-[#222222] sm:text-[50px] md:text-[60px]">
              Full-Service Property Management in Goa
            </h1>
            <p className="mt-5 max-w-3xl text-[17px] leading-7 text-[#484848] sm:text-xl sm:leading-8">
              Airbnb, villa, apartment and holiday-home management, handled end
              to end. Dynamic pricing, guest operations, housekeeping and legal
              compliance, with a transparent monthly P&amp;L you approve before
              any payout.
            </p>
            <HeroCtas />
            <p className="mt-8 max-w-4xl border-t border-[#e6d9d2] pt-5 text-sm font-semibold leading-6 text-[#484848]">
              4.98★ Airbnb Superhost · 200+ stays delivered · Owner-approved
              monthly P&amp;L · No lock-in beyond the initial term
            </p>
          </div>
        </div>
      </section>
      <Section>
        <p className="max-w-4xl text-[17px] leading-8 text-[#484848]">
          Curate My Stay is a Goa-based property management company specialising
          in short-term rentals and holiday homes. We manage Airbnb and vacation
          rental properties end to end : from listing and dynamic pricing to
          guest communication, housekeeping and legal compliance. Owners earn
          more without the day-to-day workload. Whether you own a villa in South
          Goa, an apartment in Panjim, or a holiday home up North, we run it as
          a managed asset with a clear, owner-approved P&amp;L every month.
        </p>
      </Section>
      <Section cream>
        <SectionHeading lead="One team, the whole operation. You stay informed; we handle execution.">
          What full-service property management includes
        </SectionHeading>
        <div className="mt-9 overflow-hidden rounded-[24px] border border-[#e6d9d2] bg-[#fffdf9] shadow-[0_8px_24px_rgba(70,45,31,0.07)]">
          <div className="grid lg:grid-cols-3">
          {inclusions.map((group) => (
            <article
              className="border-b border-[#e6d9d2] last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
              key={group.heading}
            >
              <div className={`border-b border-[#ebebeb] p-5 sm:p-6 ${group.tint}`}>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/75">
                    <group.icon aria-hidden="true" className="h-5 w-5 stroke-[1.8]" />
                  </span>
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] opacity-80">
                    {group.label}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-extrabold text-[#222222]">
                  {group.heading}
                </h3>
              </div>
              <div className="bg-white p-5 sm:p-6">
                <ul className="grid gap-3">
                  {group.items.map((item) => (
                    <li
                      className="flex gap-2 text-sm leading-6 text-[#484848]"
                      key={item}
                    >
                      <Check
                        aria-hidden="true"
                        className="mt-1 h-4 w-4 shrink-0 text-[#ff5a5f]"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
          </div>
          <div className="border-t border-[#2d2926] bg-[#2d2926] px-5 py-5 sm:px-6 sm:py-6">
            <p className="border-l-2 border-[#ff8f82] pl-4 text-[17px] font-semibold italic text-white">
              “You don’t need to lift a finger.”
            </p>
          </div>
        </div>
      </Section>
      <Section>
        <SectionHeading lead="Villa management, apartment management, holiday-home management and Airbnb co-hosting : across the mid-market segment most operators overlook.">
          Properties we manage
        </SectionHeading>
        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          {propertyTypes.map(([title, body, image, alt]) => (
            <article
              className="group overflow-hidden rounded-2xl border border-[#ebebeb] bg-[#fbf7f1]"
              key={title}
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-[#eadfd8]">
                <Image
                  alt={alt}
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  src={`/homepage/${image}`}
                />
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="text-xl font-extrabold text-[#222222]">
                  {title}
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-[#484848]">
                  {body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Section>
      <Section cream>
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start lg:gap-12">
          <div className="contents">
            <div className="order-1 lg:order-2">
              <h2 className="text-[30px] font-extrabold leading-[1.1] tracking-[-0.025em] text-[#222222] sm:text-[38px]">
                Areas we cover in Goa
              </h2>
            </div>
            <figure className="order-2 m-0 min-w-0 lg:order-1 lg:row-span-3">
              <div className="overflow-hidden rounded-[24px] border border-[#e6d9d2] bg-[#fffdf9] p-2.5 shadow-[0_8px_24px_rgba(70,45,31,0.08)] transition-shadow duration-200 hover:shadow-[0_10px_28px_rgba(70,45,31,0.11)] motion-reduce:transition-none sm:p-3">
                <Image
                  alt="Map showing Curate My Stay coverage locations across North and South Goa"
                  className="h-auto w-full"
                  height={1100}
                  src="/goaMap.svg"
                  width={1600}
                />
              </div>
              <figcaption className="mt-3 text-center text-xs leading-5 text-[#8a7770] sm:text-sm">
                Coverage across key short-term rental markets in North and South
                Goa.
              </figcaption>
            </figure>
            <div className="order-3 grid gap-5 lg:order-3">
              <div className="border-l-2 border-[#7fa489] pl-4">
                <div className="flex items-center gap-2 text-base font-extrabold text-[#315d3b]">
                  <MapPin
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 stroke-[1.8]"
                  />
                  North Goa
                </div>
                <p className="mt-2 text-[15px] leading-7 text-[#484848]">
                  Assagao, Anjuna, Vagator, Candolim, Calangute, Baga, Saligao,
                  Morjim, Ashvem, Mandrem, Arambol, Panjim.
                </p>
              </div>
              <div className="border-l-2 border-[#d8927d] pl-4">
                <div className="flex items-center gap-2 text-base font-extrabold text-[#aa6655]">
                  <MapPin
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 stroke-[1.8]"
                  />
                  South Goa
                </div>
                <p className="mt-2 text-[15px] leading-7 text-[#484848]">
                  Varca, Cavelossim, Colva, Benaulim, Majorda, Loutolim, Margao,
                  Palolem.
                </p>
              </div>
            </div>
            <p className="order-4 text-[16px] leading-7 text-[#484848]">
              Don’t see your area? If it’s a short-term rental market in Goa, we
              most likely cover it: ask us.
            </p>
          </div>
        </div>
      </Section>
      <Section>
        <SectionHeading>How our property management works</SectionHeading>
        <ol className="mt-9 grid gap-4 md:grid-cols-2">
          {steps.map(([title, body]) => (
            <li
              className="rounded-2xl border border-[#ebebeb] bg-white p-5 shadow-sm sm:p-6"
              key={title}
            >
              <h3 className="text-lg font-extrabold text-[#ff5a5f]">{title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-[#484848]">
                {body}
              </p>
            </li>
          ))}
        </ol>
      </Section>
      <Section cream>
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#d85a4f]">
            <span aria-hidden="true" className="h-px w-8 bg-[#ff8f82]" />
            WHY CURATE MY STAY
          </div>
          <h2 className="mt-4 text-[30px] font-extrabold leading-[1.1] tracking-[-0.025em] text-[#222222] sm:text-[38px]">
            Why owners choose Curate My Stay
          </h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-7 text-[#484848] sm:text-[17px]">
            We approach property management the way a wealth manager approaches
            a portfolio: every property is an asset with an ROI, an operating
            P&amp;L and a strategy attached to it.
          </p>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-2 md:gap-5">
          {values.map(({ title, body, Icon, accent, line }) => (
            <article
              className="group relative isolate overflow-hidden rounded-[20px] border border-[#e6d9d2] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-[#dfc3b8] hover:shadow-[0_10px_24px_rgba(70,45,31,0.10)] motion-reduce:transform-none motion-reduce:transition-none sm:p-6"
              key={title}
            >
              <span
                aria-hidden="true"
                className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#fbf1ec] opacity-70 blur-2xl"
              />
              <span
                aria-hidden="true"
                className={`absolute left-0 top-7 h-10 w-1 rounded-r-full ${line}`}
              />
              <div
                className={`relative grid h-12 w-12 place-items-center rounded-2xl transition-colors duration-200 motion-reduce:transition-none ${accent}`}
              >
                <Icon aria-hidden="true" className="h-6 w-6 stroke-[1.8]" />
              </div>
              <h3 className="relative mt-5 text-xl font-extrabold tracking-[-0.015em] text-[#222222]">
                {title}
              </h3>
              <p className="relative mt-3 text-[15px] leading-7 text-[#484848]">
                {body}
              </p>
            </article>
          ))}
        </div>
      </Section>
      <Section id="pricing">
        <SectionHeading lead="Most Goa managers charge a flat commission on booking revenue (typically 10–15% for part management and 20–30% for full management; taken whether the property performs or not). We work differently. We take a share of net profit under a simple, tiered model, so we only earn when you do.">
          What property management costs in Goa
        </SectionHeading>
        <div className="mt-9">
          <PricingCards />
        </div>
        <p className="mt-8 max-w-4xl text-[16px] leading-7 text-[#484848]">
          Short-term rental in Goa generally produces materially higher gross
          yields than a long-term lease, because you capture peak-season demand
          instead of a single fixed rent. We’ll show you a transparent,
          property-specific forecast before you commit to anything : no
          guaranteed numbers, just the real market math for your home.
        </p>
      </Section>
      <Section cream>
        <SectionHeading>Property management in Goa : FAQs</SectionHeading>
        <div className="mt-8 grid gap-3">
          {faqs.map(([question, answer]) => (
            <details
              className="group rounded-2xl border border-[#ebebeb] bg-white p-5 open:border-[#ff9295]"
              key={question}
            >
              <summary className="cursor-pointer list-none pr-8 text-[16px] font-extrabold leading-6 text-[#222222] marker:hidden">
                {question}
              </summary>
              <p className="mt-4 text-[15px] leading-7 text-[#484848]">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </Section>
      <section className="bg-[#1b1714] text-white">
        <div className="mx-auto max-w-[1180px] px-4 py-14 text-center sm:px-6 sm:py-20 md:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-[31px] font-extrabold leading-[1.1] tracking-[-0.025em] sm:text-[42px]">
              Find out what your Goa property could earn.
            </h2>
            <p className="mt-5 text-[17px] leading-7 text-white/75 sm:text-lg sm:leading-8">
              Book a free 30-minute discovery call. We’ll look at your property
              together, talk real numbers, and tell you honestly whether
              short-term rental management is the right move. If it isn’t, we’ll
              say so.
            </p>
            <ClosingCtas />
          </div>
        </div>
      </section>
      <PublicFooter
        analyticsLocation="property_management_goa"
        homeAnchorPrefix="/"
      />
    </main>
  );
}

export { faqs };
