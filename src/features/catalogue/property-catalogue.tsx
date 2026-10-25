"use client";

import { useMemo, useState } from "react";
import { BookingHero } from "@/components/home/booking-hero";
import { ShowMoreDialog } from "@/components/ui/show-more-dialog";
import { CataloguePropertyCard } from "@/src/features/catalogue/catalogue-property-card";
import type { CatalogueProperty } from "@/src/features/catalogue/public-catalogue-data";
import { buildGuestHeaderWhatsAppMessage } from "@/src/features/catalogue/guest-whatsapp-message";
import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";
import { trackWhatsAppClick } from "@/src/lib/analytics";

type Filters = { bedrooms: string; date: string; guests: string; poolType: string; region: string };
type Option = { label: string; value: string };
const noFilters: Filters = { bedrooms: "", date: "", guests: "", poolType: "", region: "" };

function textOptions(properties: CatalogueProperty[], read: (p: CatalogueProperty) => string | null) {
  const values = properties.map(read).filter((value): value is string => Boolean(value?.trim()));
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function numberOptions(properties: CatalogueProperty[], read: (p: CatalogueProperty) => number | null) {
  const values = properties.map(read).filter((value): value is number => value != null && value > 0);
  return [...new Set(values)].sort((a, b) => a - b);
}

function matchesFilters(property: CatalogueProperty, filters: Filters) {
  if (filters.region && property.region !== filters.region) return false;
  if (filters.poolType && property.pool_type !== filters.poolType) return false;
  if (filters.guests && (property.max_guests ?? 0) < Number(filters.guests)) return false;
  if (filters.bedrooms && (property.bedrooms ?? 0) < Number(filters.bedrooms)) return false;
  return true;
}

function PanelField({ anyLabel, label, onChange, options, value }: {
  anyLabel: string; label: string; onChange: (value: string) => void; options: Option[]; value: string;
}) {
  return (
    <label className="relative block min-w-0 border-b border-[#e3e0d8] px-4 lg:border-b-0 lg:border-r">
      <span className="pointer-events-none absolute top-2 text-[13px] text-[#5c5c57]">{label}</span>
      <select className="min-h-16 w-full min-w-0 truncate bg-white pt-4 text-sm text-[#1f1f1d] focus-visible:outline-2 focus-visible:outline-[#1f1f1d]" onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="">{anyLabel}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function PillField({ anyLabel, label, onChange, options, value }: {
  anyLabel: string; label: string; onChange: (value: string) => void; options: Option[]; value: string;
}) {
  return (
    <span className="relative inline-block min-w-0">
      <select aria-label={label} className="min-h-11 w-full max-w-[220px] appearance-none truncate rounded-full border border-[#e3e0d8] bg-white py-2.5 pl-4 pr-9 text-sm text-[#1f1f1d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f1f1d]" onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="">{anyLabel}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <svg aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-[#5c5c57]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

export function PropertyCatalogue({ failed = false, heroImageAlt, heroImageUrl, properties }: {
  failed?: boolean;
  heroImageAlt?: string | null;
  heroImageUrl?: string | null;
  properties: CatalogueProperty[];
}) {
  const [filters, setFilters] = useState<Filters>(noFilters);
  const [searchOpen, setSearchOpen] = useState(false);
  const regions = useMemo(() => textOptions(properties, (p) => p.region), [properties]);
  const poolTypes = useMemo(() => textOptions(properties, (p) => p.pool_type), [properties]);
  const guestCounts = useMemo(() => numberOptions(properties, (p) => p.max_guests), [properties]);
  const bedroomCounts = useMemo(() => numberOptions(properties, (p) => p.bedrooms), [properties]);
  const results = useMemo(() => properties.filter((property) => matchesFilters(property, filters)), [filters, properties]);
  const hasActiveFilters = Object.values(filters).some(Boolean);
  const whatsappUrl = getPublicWhatsAppUrl(buildGuestHeaderWhatsAppMessage());

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  // Keep the same live filter state, date input, options and #stays search action.
  const searchFields = (
    <div className="grid rounded-xl bg-white p-1 text-[#1f1f1d] lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-center">
      <PanelField anyLabel="Select region" label="Region" onChange={(value) => updateFilter("region", value)} options={regions.map((region) => ({ label: region, value: region }))} value={filters.region} />
      <PanelField anyLabel="Select guests" label="Guests" onChange={(value) => updateFilter("guests", value)} options={guestCounts.map((count) => ({ label: `${count}+ ${count === 1 ? "guest" : "guests"}`, value: String(count) }))} value={filters.guests} />
      <label className="relative block min-w-0 px-4">
        <span className="pointer-events-none absolute top-2 text-[13px] text-[#5c5c57]">Dates</span>
        <input aria-label="Dates" className="min-h-16 w-full min-w-0 bg-white pt-4 text-sm text-[#1f1f1d] focus-visible:outline-2 focus-visible:outline-[#1f1f1d]" onChange={(event) => updateFilter("date", event.target.value)} type="date" value={filters.date} />
      </label>
      <a className="m-2 inline-flex min-h-12 items-center justify-center rounded-xl bg-public-coral-ink px-6 text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f1f1d]" href="#stays" onClick={() => setSearchOpen(false)}><span className="text-white">Search stays</span></a>
    </div>
  );

  return (
    <div className="[font-family:var(--font-homepage)]">
      <BookingHero imageAlt={heroImageAlt} imageUrl={heroImageUrl}>
        <div className="hidden lg:block">{searchFields}</div>
        <div className="lg:hidden">
          <ShowMoreDialog open={searchOpen} onOpenChange={setSearchOpen} title="Search stays" trigger={
            <button className="flex min-h-16 w-full items-center gap-3 rounded-xl bg-white p-2 text-left text-[#1f1f1d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" type="button">
              <svg aria-hidden="true" className="ml-2 size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" strokeLinecap="round" /></svg>
              <span className="flex-1"><span className="block text-[15px] font-semibold">Search stays</span><span className="block text-[13px] text-[#5c5c57]">Region, guests, dates</span></span>
              <span className="inline-flex min-h-11 items-center justify-center rounded-lg bg-public-coral-ink px-4 text-sm font-semibold text-white">Go</span>
            </button>
          }>{searchFields}</ShowMoreDialog>
        </div>
        {whatsappUrl ? <a className="mt-2 inline-flex min-h-11 items-center text-[13px] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" href={whatsappUrl} onClick={() => trackWhatsAppClick("booking_hero")} rel="noopener noreferrer" target="_blank"><span className="text-white">Or message us on WhatsApp</span></a> : null}
      </BookingHero>

      <section aria-labelledby="stays-title" className="mx-auto max-w-[1280px] scroll-mt-24 px-5 py-14 sm:px-8 lg:px-16 lg:py-24" id="stays">
        <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h2 id="stays-title" className="text-3xl font-bold tracking-tight text-[#1f1f1d] lg:text-[38px]">Our stays</h2>
            <p aria-live="polite" className="mt-2 text-sm text-[#5c5c57]">{failed ? "Personally managed homes in Goa" : `${results.length} ${results.length === 1 ? "stay" : "stays"} in Goa, each personally managed`}</p>
          </div>
          {properties.length > 0 ? <div className="flex max-w-full flex-wrap gap-3">
            <PillField anyLabel="Any bedrooms" label="Bedrooms" onChange={(value) => updateFilter("bedrooms", value)} options={bedroomCounts.map((count) => ({ label: `${count}+ ${count === 1 ? "bedroom" : "bedrooms"}`, value: String(count) }))} value={filters.bedrooms} />
            <PillField anyLabel="Any pool" label="Pool" onChange={(value) => updateFilter("poolType", value)} options={poolTypes.map((pool) => ({ label: pool, value: pool }))} value={filters.poolType} />
            {hasActiveFilters ? <button className="min-h-11 rounded-full px-3 text-sm font-semibold text-[#1f1f1d] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2" onClick={() => setFilters(noFilters)} type="button">Clear filters</button> : null}
          </div> : null}
        </div>
        {failed || properties.length === 0 || results.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#e7e5df] p-6 text-[#3b3b37]">
            <h3 className="text-xl font-semibold text-[#1f1f1d]">{failed ? "We could not load our stays just now" : properties.length === 0 ? "Our Goa stays are being prepared" : "No stays match these filters."}</h3>
            <p className="mt-3 max-w-prose text-base leading-relaxed">{failed ? "Please refresh the page in a moment. If it keeps happening, message us and we will share the homes that suit you." : properties.length === 0 ? "We are finishing the first property listings. Please check back shortly." : "Our Goa portfolio is deliberately small. Try widening a filter to see more homes."}</p>
            {hasActiveFilters ? <button className="mt-4 min-h-11 rounded-xl border border-[#e3e0d8] px-5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2" onClick={() => setFilters(noFilters)} type="button">Clear filters</button> : null}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 items-stretch gap-x-6 gap-y-10 md:grid-cols-2">
            {results.map((property) => <CataloguePropertyCard key={property.id} property={property} />)}
          </div>
        )}
      </section>
    </div>
  );
}
