"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { bookingStaysSectionId } from "@/components/home/booking-hero";
import { CataloguePropertyCard } from "@/src/features/catalogue/catalogue-property-card";
import type { CatalogueProperty } from "@/src/features/catalogue/public-catalogue-data";

type Filters = {
  bedrooms: string;
  poolType: string;
};

type Option = { label: string; value: string };

const noFilters: Filters = {
  bedrooms: "",
  poolType: "",
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
  if (filters.poolType && property.pool_type !== filters.poolType) return false;
  if (filters.bedrooms && (property.bedrooms ?? 0) < Number(filters.bedrooms)) return false;

  return true;
}

/** Compact pill select used by the filter row above the listing. */
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
  properties,
}: {
  failed?: boolean;
  properties: CatalogueProperty[];
}) {
  const [filters, setFilters] = useState<Filters>(noFilters);

  const poolTypes = useMemo(() => textOptions(properties, (p) => p.pool_type), [properties]);
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

  return (
    <div>
      {failed ? (
        <section className="scroll-mt-20 bg-white lg:scroll-mt-24" id={bookingStaysSectionId}>
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
          className="mx-auto max-w-[1180px] scroll-mt-20 px-4 pb-2 pt-12 sm:px-6 sm:pb-4 sm:pt-14 md:px-8 lg:scroll-mt-24 lg:pt-16"
          id={bookingStaysSectionId}
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
