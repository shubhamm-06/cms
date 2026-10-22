"use client";

import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { BookingHero } from "@/components/home/booking-hero";
import { CataloguePropertyCard } from "@/src/features/catalogue/catalogue-property-card";
import type { CatalogueProperty } from "@/src/features/catalogue/public-catalogue-data";

type Filters = {
  bedrooms: string;
  date: string;
  guests: string;
  poolType: string;
  region: string;
};

type Option = { label: string; value: string };

const noFilters: Filters = {
  bedrooms: "",
  date: "",
  guests: "",
  poolType: "",
  region: "",
};

/** Distinct, sorted, non-empty values for one text column. */
function textOptions(properties: CatalogueProperty[], read: (p: CatalogueProperty) => string | null) {
  const values = properties.map(read).filter((value): value is string => Boolean(value?.trim()));

  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

/** Ascending whole-number thresholds present in the catalogue, for "N+" filters. */
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

/** One row in the glass hero search panel. */
function PanelField({
  anyLabel,
  label,
  onChange,
  options,
  value,
}: {
  anyLabel: string;
  label: string;
  onChange: (value: string) => void;
  options: Option[];
  value: string;
}) {
  return (
    <label className="relative block min-w-0 cursor-pointer rounded-2xl border border-white/15 bg-white/[0.09] px-4 py-3 transition-colors hover:bg-white/[0.14] focus-within:border-white/40 focus-within:ring-2 focus-within:ring-white/20">
      <span className="block truncate text-[11px] font-bold uppercase tracking-[0.08em] text-white/65">
        {label}
      </span>
      <select
        className={`mt-1 min-h-6 w-full min-w-0 appearance-none truncate bg-transparent pr-7 text-[15px] leading-6 outline-none ${
          value ? "font-semibold text-white" : "font-normal text-white/75"
        }`}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option style={{ backgroundColor: "#ffffff", color: "#222222" }} value="">
          {anyLabel}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            style={{ backgroundColor: "#ffffff", color: "#222222" }}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute bottom-4 right-4 h-4 w-4 text-white/70"
      />
    </label>
  );
}

/** Compact pill select used by the secondary filter row under the panel. */
function PillField({
  anyLabel,
  label,
  onChange,
  options,
  value,
}: {
  anyLabel: string;
  label: string;
  onChange: (value: string) => void;
  options: Option[];
  value: string;
}) {
  return (
    <span className="relative inline-block">
      <select
        aria-label={label}
        className={`min-h-11 w-full appearance-none truncate rounded-full border py-2.5 pl-4 pr-10 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2 ${
          value
            ? "border-[#222222] bg-[#222222] text-white"
            : "border-[#dddddd] bg-white text-[#222222] hover:border-[#b0b0b0]"
        }`}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">{anyLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className={`pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${value ? "text-white" : "text-[#717171]"}`}
      />
    </span>
  );
}

export function PropertyCatalogue({
  failed = false,
  heroImageAlt,
  heroImageUrl,
  properties,
}: {
  failed?: boolean;
  heroImageAlt?: string | null;
  heroImageUrl?: string | null;
  properties: CatalogueProperty[];
}) {
  const [filters, setFilters] = useState<Filters>(noFilters);

  const regions = useMemo(() => textOptions(properties, (p) => p.region), [properties]);
  const poolTypes = useMemo(() => textOptions(properties, (p) => p.pool_type), [properties]);
  const guestCounts = useMemo(() => numberOptions(properties, (p) => p.max_guests), [properties]);
  const bedroomCounts = useMemo(() => numberOptions(properties, (p) => p.bedrooms), [properties]);

  const results = useMemo(
    () => properties.filter((property) => matchesFilters(property, filters)),
    [filters, properties],
  );

  const hasActiveFilters = Object.values(filters).some(Boolean);
  const hasProperties = properties.length > 0;

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  const searchPanel = (
    <div className="rounded-[24px] border border-white/20 bg-[#1b1715]/[0.86] p-4 shadow-[0_20px_55px_rgba(0,0,0,0.24)] backdrop-blur-md sm:p-5">
      <div className="flex items-center gap-2 text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
          <Search aria-hidden="true" className="h-4 w-4 text-white/85" />
        </span>
        <h2 className="text-[21px] font-semibold tracking-[-0.02em]">Find your stay</h2>
      </div>
      <div className="mt-5 grid gap-2.5">
        <PanelField
          anyLabel="Select region"
          label="Region"
          onChange={(value) => updateFilter("region", value)}
          options={regions.map((region) => ({ label: region, value: region }))}
          value={filters.region}
        />
        <PanelField
          anyLabel="Select guests"
          label="Guests"
          onChange={(value) => updateFilter("guests", value)}
          options={guestCounts.map((count) => ({
            label: `${count}+ ${count === 1 ? "guest" : "guests"}`,
            value: String(count),
          }))}
          value={filters.guests}
        />
        <label className="relative block min-w-0 rounded-2xl border border-white/15 bg-white/[0.09] px-4 py-3 transition-colors hover:bg-white/[0.14] focus-within:border-white/40 focus-within:ring-2 focus-within:ring-white/20">
          <span className="block truncate text-[11px] font-bold uppercase tracking-[0.08em] text-white/65">
            Date
          </span>
          <input
            aria-label="Date"
            className={`mt-1 min-h-6 w-full min-w-0 bg-transparent text-[15px] leading-6 outline-none ${
              filters.date ? "font-semibold text-white" : "font-normal text-white/75"
            }`}
            onChange={(event) => updateFilter("date", event.target.value)}
            style={{ colorScheme: "dark" }}
            type="date"
            value={filters.date}
          />
        </label>
      </div>
      <a
        className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-public-coral px-5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(255,90,95,0.2)] outline-none transition hover:bg-public-coral-hover active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b1715]"
        href="#stays"
      >
        <span className="inline-flex items-center gap-2 text-white">
          <Search aria-hidden="true" className="h-[18px] w-[18px]" />
          Search Stays
        </span>
      </a>
    </div>
  );

  return (
    <div>
      <BookingHero imageAlt={heroImageAlt} imageUrl={heroImageUrl}>{searchPanel}</BookingHero>

      {failed ? (
        <section className="bg-white">
          <div className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6 sm:py-16 md:px-8">
            <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-[#e2d5cd] bg-[#fbf7f1] px-6 py-12 text-center">
              <h2 className="text-[19px] font-bold tracking-[-0.01em] text-[#222222]">
                We could not load our stays just now
              </h2>
              <p className="mx-auto mt-2.5 max-w-md text-[15px] leading-7 text-[#484848]">
                Please refresh the page in a moment. If it keeps happening, message us and we will
                share the homes that suit you.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div
          className="mx-auto max-w-[1180px] px-4 pb-2 pt-12 sm:px-6 sm:pb-4 sm:pt-14 md:px-8 lg:pt-16"
          id="stays"
        >
          {hasProperties ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <PillField
                  anyLabel="Any bedrooms"
                  label="Bedrooms"
                  onChange={(value) => updateFilter("bedrooms", value)}
                  options={bedroomCounts.map((count) => ({
                    label: `${count}+ ${count === 1 ? "bedroom" : "bedrooms"}`,
                    value: String(count),
                  }))}
                  value={filters.bedrooms}
                />
                <PillField
                  anyLabel="Any pool"
                  label="Pool"
                  onChange={(value) => updateFilter("poolType", value)}
                  options={poolTypes.map((pool) => ({ label: pool, value: pool }))}
                  value={filters.poolType}
                />
                {hasActiveFilters ? (
                  <button
                    className="inline-flex min-h-11 items-center justify-center rounded-full px-3.5 text-sm font-semibold text-[#9e4347] underline underline-offset-4 outline-none transition hover:text-[#d63e43] focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2"
                    onClick={() => setFilters(noFilters)}
                    type="button"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
              <p aria-live="polite" className="text-[15px] font-semibold text-[#484848]">
                {`${results.length} ${results.length === 1 ? "stay" : "stays"}`}
              </p>
            </div>

            {results.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-[#e2d5cd] bg-[#fbf7f1] px-6 py-12 text-center">
                <h2 className="text-[19px] font-bold tracking-[-0.01em] text-[#222222]">
                  No stays match these filters.
                </h2>
                <p className="mx-auto mt-2.5 max-w-md text-[15px] leading-7 text-[#484848]">
                  Our Goa portfolio is deliberately small. Try widening a filter to see more homes.
                </p>
                <button
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#ff5a5f] px-5 text-[15px] font-semibold text-white outline-none transition hover:bg-[#e54b50] focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2"
                  onClick={() => setFilters(noFilters)}
                  type="button"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="mt-7 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2">
                {results.map((property) => (
                  <CataloguePropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
            </>
          ) : (
            <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-[#e2d5cd] bg-[#fbf7f1] px-6 py-12 text-center">
              <h2 className="text-[19px] font-bold tracking-[-0.01em] text-[#222222]">
                Our Goa stays are being prepared
              </h2>
              <p className="mx-auto mt-2.5 max-w-md text-[15px] leading-7 text-[#484848]">
                We are finishing the first property listings. Please check back shortly.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
