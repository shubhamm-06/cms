"use client";

import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { CataloguePropertyCard } from "@/src/features/catalogue/catalogue-property-card";
import type { CatalogueProperty } from "@/src/features/catalogue/public-catalogue-data";

type Filters = {
  area: string;
  bedrooms: string;
  guests: string;
  poolType: string;
  propertyType: string;
  region: string;
};

type Option = { label: string; value: string };

const noFilters: Filters = {
  area: "",
  bedrooms: "",
  guests: "",
  poolType: "",
  propertyType: "",
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
  if (filters.area && property.area !== filters.area) return false;
  if (filters.propertyType && property.public_property_type !== filters.propertyType) return false;
  if (filters.poolType && property.pool_type !== filters.poolType) return false;
  if (filters.guests && (property.max_guests ?? 0) < Number(filters.guests)) return false;
  if (filters.bedrooms && (property.bedrooms ?? 0) < Number(filters.bedrooms)) return false;

  return true;
}

/** One segment of the floating hero panel: small caps label above a bare select. */
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
    <label className="relative block min-w-0 flex-1 cursor-pointer rounded-2xl px-4 py-2.5 transition hover:bg-[#f7f7f7] lg:rounded-full lg:px-[22px] lg:py-3.5">
      <span className="block text-[11px] font-bold uppercase tracking-[0.06em] text-[#222222]">
        {label}
      </span>
      <select
        className={`mt-0.5 w-full appearance-none truncate rounded-sm bg-transparent pr-6 text-[15px] leading-6 outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a5f] ${
          value ? "font-semibold text-[#222222]" : "font-normal text-[#b0b0b0]"
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
        className="pointer-events-none absolute bottom-3 right-4 h-4 w-4 text-[#717171] lg:bottom-4 lg:right-[22px]"
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

export function PropertyCatalogue({ properties }: { properties: CatalogueProperty[] }) {
  const [filters, setFilters] = useState<Filters>(noFilters);

  const regions = useMemo(() => textOptions(properties, (p) => p.region), [properties]);
  const propertyTypes = useMemo(
    () => textOptions(properties, (p) => p.public_property_type),
    [properties],
  );
  const poolTypes = useMemo(() => textOptions(properties, (p) => p.pool_type), [properties]);
  const guestCounts = useMemo(() => numberOptions(properties, (p) => p.max_guests), [properties]);
  const bedroomCounts = useMemo(() => numberOptions(properties, (p) => p.bedrooms), [properties]);

  // Areas follow the chosen region so the two location filters cannot contradict.
  const areas = useMemo(
    () =>
      textOptions(
        properties.filter((p) => !filters.region || p.region === filters.region),
        (p) => p.area,
      ),
    [filters.region, properties],
  );

  const results = useMemo(
    () => properties.filter((property) => matchesFilters(property, filters)),
    [filters, properties],
  );

  const hasActiveFilters = Object.values(filters).some(Boolean);
  const hasProperties = properties.length > 0;

  function updateFilter(key: keyof Filters, value: string) {
    // Changing region invalidates a previously chosen area.
    setFilters((current) =>
      key === "region" ? { ...current, area: "", region: value } : { ...current, [key]: value },
    );
  }

  return (
    <div>
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 md:px-8">
        <div className="mx-auto max-w-[980px] rounded-3xl border border-[#dddddd] bg-white p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.14)] lg:rounded-full lg:p-1.5">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:flex lg:items-center lg:gap-0">
            <PanelField
              anyLabel="Anywhere in Goa"
              label="Region"
              onChange={(value) => updateFilter("region", value)}
              options={regions.map((region) => ({ label: region, value: region }))}
              value={filters.region}
            />
            <span aria-hidden="true" className="hidden h-8 w-px shrink-0 bg-[#ebebeb] lg:block" />
            <PanelField
              anyLabel="Any area"
              label="Area"
              onChange={(value) => updateFilter("area", value)}
              options={areas.map((area) => ({ label: area, value: area }))}
              value={filters.area}
            />
            <span aria-hidden="true" className="hidden h-8 w-px shrink-0 bg-[#ebebeb] lg:block" />
            <PanelField
              anyLabel="Any type"
              label="Property type"
              onChange={(value) => updateFilter("propertyType", value)}
              options={propertyTypes.map((type) => ({ label: type, value: type }))}
              value={filters.propertyType}
            />
            <span aria-hidden="true" className="hidden h-8 w-px shrink-0 bg-[#ebebeb] lg:block" />
            <PanelField
              anyLabel="Any number"
              label="Guests"
              onChange={(value) => updateFilter("guests", value)}
              options={guestCounts.map((count) => ({
                label: `${count}+ ${count === 1 ? "guest" : "guests"}`,
                value: String(count),
              }))}
              value={filters.guests}
            />
            {/*
              `app/globals.css` sets an unlayered `a { color: inherit }`, which
              outranks Tailwind's layered `text-*` utilities and was rendering
              this CTA's label and icon in the panel's dark body colour. Nothing
              targets the inner span, so the white lives there and the icon
              follows it through `currentColor`.
            */}
            <a
              className="mt-1 inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[#ff5a5f] px-7 text-[15px] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.06)] outline-none transition hover:bg-[#e54b50] focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2 sm:col-span-2 lg:mt-0 lg:ml-2"
              href="#stays"
            >
              <span className="inline-flex items-center gap-2 text-white">
                <Search aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
                Search
              </span>
            </a>
          </div>
        </div>
      </div>

      {/*
        The catalogue is followed by `BookingWhyDirect`, whose own generous top
        padding carries the separation, so the grid keeps only a small trailing
        gap of its own rather than stacking two full section paddings.
      */}
      <div
        className="mx-auto max-w-[1180px] px-4 pb-2 pt-10 sm:px-6 sm:pb-4 sm:pt-12 md:px-8 lg:pt-14"
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
              <div className="mt-7 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}
