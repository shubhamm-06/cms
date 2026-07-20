import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, ExternalLink, Star } from "lucide-react";
import { CalendlyPopupLoader } from "@/components/home/calendly-popup";
import { CaseStudiesBookingCta } from "@/components/home/case-studies-booking-cta";
import {
  portfolioProof,
  propertyCaseStudies,
  type PropertyCaseStudy,
} from "@/components/home/case-studies-data";
import { PublicFooter } from "@/components/home/public-footer";
import { PublicHeader } from "@/components/home/public-header";

const photo = (name: string) => `/homepage/${name}`;

function RevenueProgressionChart({ study }: { study: PropertyCaseStudy }) {
  const width = 360;
  const height = 188;
  const padding = { bottom: 38, left: 10, right: 10, top: 18 };
  const max = Math.max(...study.revenueProgression.map((point) => point.value));
  const graphHeight = height - padding.top - padding.bottom;
  const graphWidth = width - padding.left - padding.right;
  const step = graphWidth / Math.max(1, study.revenueProgression.length - 1);
  const points = study.revenueProgression.map((point, index) => {
    const x = padding.left + index * step;
    const y = padding.top + graphHeight - (point.value / max) * graphHeight;
    return { ...point, x, y };
  });
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const area = `${line} L ${points.at(-1)?.x.toFixed(1)} ${(height - padding.bottom).toFixed(1)} L ${points[0]?.x.toFixed(1)} ${(height - padding.bottom).toFixed(1)} Z`;
  const gradientId = `${study.slug}-revenue-fill`;

  return (
    <figure aria-labelledby={`${study.slug}-chart-heading`} className="rounded-2xl border border-[#ebebeb] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:p-5">
      <figcaption id={`${study.slug}-chart-heading`}>
        <div className="text-sm font-bold text-[#222222]">Monthly revenue progression</div>
        <div className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#717171]">First operating month = 1.0x</div>
      </figcaption>
      <svg aria-hidden="true" className="mt-3 block w-full max-w-[460px]" role="img" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#e98363" stopOpacity="0.28" />
            <stop offset="1" stopColor="#e98363" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line stroke="#ebebeb" strokeWidth="1" x1={padding.left} x2={width - padding.right} y1={height - padding.bottom} y2={height - padding.bottom} />
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke="#ff5a5f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        {points.map((point) => (
          <g key={point.month}>
            <circle cx={point.x} cy={point.y} fill="#ffffff" r="4" stroke="#ff5a5f" strokeWidth="2.5" />
            <text fill="#484848" fontSize="14" fontWeight="700" textAnchor="middle" x={point.x} y={point.y - 11}>{point.value.toFixed(2)}x</text>
            <text fill="#717171" fontSize="13" fontWeight="600" textAnchor="middle" x={point.x} y={height - 12}>{point.month}</text>
          </g>
        ))}
      </svg>
      <ul className="sr-only">
        {study.revenueProgression.map((point) => <li key={point.month}>{point.month}: {point.value.toFixed(2)} times the first operating month.</li>)}
      </ul>
    </figure>
  );
}

function MetricCard({ emphasis, label, value }: PropertyCaseStudy["metrics"][number]) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#ebebeb] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:p-5">
      <div className="text-[11px] font-extrabold uppercase tracking-[0.11em] text-[#717171]">{label}</div>
      <div className={`mt-2 text-[28px] font-extrabold leading-none tracking-[-0.02em] ${emphasis === "coral" ? "text-[#ff5a5f]" : "text-[#222222]"}`}>{value}</div>
    </div>
  );
}

function ReviewCard({ date, excerpt, name }: PropertyCaseStudy["reviews"][number]) {
  return (
    <article className="flex h-full min-w-0 flex-col rounded-2xl border border-[#ebebeb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:p-6">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fbf1ec] text-sm font-extrabold text-[#c94c51]">{name.slice(0, 1)}</span>
        <div className="min-w-0">
          <div className="font-bold text-[#222222]">{name}</div>
          <div className="text-sm text-[#717171]">{date}</div>
        </div>
      </div>
      <div aria-label="5 out of 5 stars" className="mt-4 flex gap-0.5 text-[#ff5a5f]">
        {Array.from({ length: 5 }).map((_, index) => <Star aria-hidden="true" className="h-4 w-4 fill-current" key={index} />)}
      </div>
      <p className="mt-3 text-[15px] leading-6 text-[#484848]">&quot;{excerpt}&quot;</p>
    </article>
  );
}

function CaseStudySection({ study }: { study: PropertyCaseStudy }) {
  const reverse = study.slug === "varca";

  return (
    <section aria-labelledby={`${study.slug}-title`} className="scroll-mt-24 border-t border-[#ebebeb] py-14 first:border-t-0 sm:py-20" id={study.slug}>
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 md:px-8">
        <div className="max-w-3xl">
          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ff5a5f]">Case study · {study.managedSince.replace("Managed since ", "")}</div>
          <h2 className="mt-4 text-[30px] font-extrabold leading-[1.1] tracking-[-0.025em] text-[#222222] sm:text-[38px] md:text-[44px]" id={`${study.slug}-title`}>{study.title}</h2>
          <p className="mt-3 text-[17px] font-semibold text-[#717171] sm:text-lg">{study.propertyLabel}</p>
          <p className="mt-5 text-[16px] leading-7 text-[#484848] sm:text-[17px] sm:leading-8">{study.narrative}</p>
        </div>

        <div className="mt-8 grid gap-7 lg:mt-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className={`overflow-hidden rounded-[20px] bg-[#f7f7f7] shadow-[0_6px_16px_rgba(0,0,0,0.12)] ${reverse ? "lg:order-2" : "lg:order-1"}`}>
            <Image alt={`${study.propertyLabel} managed by CurateMyStay`} className="block h-auto w-full" height={3024} sizes="(min-width: 1024px) 540px, (min-width: 640px) 80vw, calc(100vw - 2rem)" src={photo(study.photos[0])} width={4032} />
          </div>
          <div className={`min-w-0 ${reverse ? "lg:order-1" : "lg:order-2"}`}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {study.metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
            </div>
            <div className="mt-5"><RevenueProgressionChart study={study} /></div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:gap-10">
          <aside className="rounded-2xl border border-[#f3d2d3] bg-[#fff8f8] p-6 sm:p-7">
            <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#c94c51]">Owner testimonial</div>
            <blockquote className="mt-4 text-[17px] font-medium leading-7 text-[#2f2a27]">&quot;{study.testimonial}&quot;</blockquote>
          </aside>
          <div>
            <h3 className="text-[23px] font-extrabold tracking-[-0.015em] text-[#222222]">What guests said</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {study.reviews.map((review) => <ReviewCard key={review.name} {...review} />)}
            </div>
            <a className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#dddddd] bg-white px-4 py-2.5 text-sm font-semibold text-[#222222] transition hover:bg-[#f7f7f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2" href={study.airbnbUrl} rel="noopener noreferrer" target="_blank">
              View the {study.slug === "panjim" ? "Panjim property" : "Varca property"} on Airbnb
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CaseStudiesPublicPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-[#222222] antialiased">
      <CalendlyPopupLoader />
      <PublicHeader analyticsLocation="case_studies_page" />

      <section className="bg-[#fbf7f1]">
        <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#717171]">
            <Link className="rounded-sm hover:text-[#222222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a5f]" href="/">Home</Link>
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
            <span aria-current="page" className="font-medium text-[#484848]">Case Studies</span>
          </nav>
          <div className="mt-7 max-w-3xl">
            <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ff5a5f]">Case studies</div>
            <h1 className="mt-4 text-[36px] font-extrabold leading-[1.06] tracking-[-0.03em] text-[#222222] sm:text-[48px] md:text-[56px]">Real Results from Airbnb Management in Goa</h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-7 text-[#484848] sm:text-xl sm:leading-8">See how CurateMyStay improved guest readiness, occupancy and revenue performance across two very different Goa properties. These case studies use real operating figures rather than projections.</p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6 sm:py-20 md:px-8">
          <div className="max-w-2xl">
            <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ff5a5f]">Portfolio proof</div>
            <h2 className="mt-4 text-[30px] font-extrabold leading-[1.1] tracking-[-0.025em] sm:text-[38px]">The numbers behind the promise.</h2>
            <p className="mt-4 text-[16px] leading-7 text-[#484848] sm:text-[17px]">We lead with real figures, not adjectives. Here is what the portfolio looks like today.</p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {portfolioProof.map((stat) => (
              <div className="min-w-0 rounded-2xl border border-[#ebebeb] bg-[#fbf7f1] px-4 py-5 sm:px-5 sm:py-6" key={stat.label}>
                <div className="text-[27px] font-extrabold leading-none tracking-[-0.02em] text-[#ff5a5f] sm:text-[34px]">{stat.value}</div>
                <div className="mt-3 text-sm leading-5 text-[#484848]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-[#fbf7f1]">
        {propertyCaseStudies.map((study) => <CaseStudySection key={study.slug} study={study} />)}
      </div>

      <section className="bg-white">
        <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 sm:py-12 md:px-8">
          <p className="border-l-2 border-[#ffb1b3] pl-4 text-sm italic leading-6 text-[#717171]">These figures reflect the performance of the properties and operating periods shown above. Occupancy, revenue and expenses vary based on property condition, location, seasonality, amenities and market demand. Past performance does not guarantee identical results for another property.</p>
        </div>
      </section>

      <section className="bg-[#1b1714] text-white">
        <div className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-20">
          <div className="max-w-3xl">
            <h2 className="text-[31px] font-extrabold leading-[1.1] tracking-[-0.025em] sm:text-[42px]">What could professional management change for your property?</h2>
            <p className="mt-5 text-[17px] leading-7 text-white/75 sm:text-lg sm:leading-8">Share a few details about your Goa property to receive an initial revenue forecast and discuss whether CurateMyStay is the right operational partner.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link className="inline-flex min-h-11 w-full items-center justify-center gap-[9px] rounded-xl border border-transparent bg-[#ff5a5f] px-5 py-3.5 text-center text-base font-semibold leading-[1.2] text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition hover:bg-[#e54b50] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b1714] sm:w-auto sm:px-7 sm:py-4 sm:text-[17px]" href="/property-management-proposal">
                Get Your Property Forecast
                <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0" />
              </Link>
              <CaseStudiesBookingCta />
            </div>
          </div>
        </div>
      </section>

      <PublicFooter analyticsLocation="case_studies_page" homeAnchorPrefix="/" />
    </main>
  );
}
