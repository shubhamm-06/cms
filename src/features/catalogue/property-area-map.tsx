import { Maximize2 } from "lucide-react";
import { getPropertyMapEmbed } from "@/src/features/catalogue/property-map-embed";

/**
 * Map for "Where you'll be" on `/property/[slug]`, built from the property's saved Google
 * Maps value (see `src/lib/maps.ts` for the accepted formats).
 *
 * The embed shows no pin, sits at zoom 15 and retains the saved coordinate precision.
 * The iframe is non-interactive (`pointer-events-none`), and the
 * pink circle on top reads as "somewhere around here". The iframe is lazy-loaded inside
 * a fixed-height box, so it causes no layout shift. When no coordinates can be found the
 * map falls back to the area text (the pill's text), then to the same box without a map,
 * as a placeholder card.
 */

/** "Varca, South Goa"; adds "Goa" when the stored region does not already say it. */
export function areaMapQuery({ area, region }: { area: string | null; region: string | null }) {
  const parts = [area?.trim(), region?.trim()].filter((part): part is string => Boolean(part));
  if (parts.length === 0) return null;
  if (!/\bgoa\b/i.test(parts.join(" "))) parts.push("Goa");
  return parts.join(", ");
}

/** The map box. Also the Suspense fallback while a short link is being resolved. */
export function PropertyMapFrame({
  areaLabel,
  embedUrl,
  expandUrl = null,
}: {
  areaLabel: string | null;
  embedUrl: string | null;
  /** Below md the separate "View on Google Maps" button is replaced by this corner link. */
  expandUrl?: string | null;
}) {
  const title = areaLabel ? `Map of the approximate area around ${areaLabel}` : "Map of the approximate area";

  return (
    <figure className="relative mb-4 h-56 overflow-hidden rounded-[20px] border border-public-hairline bg-public-cream md:h-[340px]">
      {embedUrl ? (
        <iframe
          className="pointer-events-none absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          tabIndex={-1}
          title={title}
        />
      ) : null}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-public-coral bg-public-coral/15 sm:h-44 sm:w-44"
      />
      {expandUrl ? (
        <a
          aria-label="Open in Google Maps"
          className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)] outline-none focus-visible:ring-2 focus-visible:ring-public-coral md:hidden"
          href={expandUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="text-public-ink">
            <Maximize2 aria-hidden="true" className="h-[18px] w-[18px]" />
          </span>
        </a>
      ) : null}
      {/* Below md the area is named in the line above the map, so the pill is not repeated. */}
      <figcaption className="absolute right-3 top-3 max-md:hidden max-w-[calc(100%-24px)] truncate rounded-full bg-white/95 px-3 py-1.5 text-[12.5px] font-semibold text-public-ink shadow-[0_1px_4px_rgba(0,0,0,0.15)]">
        {/* Short on phones so it clears Google's own "Open in Maps" chip. */}
        <span className="sm:hidden">Approximate area</span>
        <span className="hidden sm:inline">{areaLabel ? `Approximate area: ${areaLabel}` : "Approximate area"}</span>
      </figcaption>
    </figure>
  );
}

export async function PropertyAreaMap({
  areaLabel,
  expandUrl = null,
  savedValue,
}: {
  areaLabel: string | null;
  expandUrl?: string | null;
  savedValue: string;
}) {
  const { url } = await getPropertyMapEmbed(savedValue, areaLabel);
  return <PropertyMapFrame areaLabel={areaLabel} embedUrl={url} expandUrl={expandUrl} />;
}
