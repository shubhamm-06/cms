/**
 * Area-only map for "Where you'll be" on `/property/[slug]`.
 *
 * A keyless Google Maps embed searched by area name ("Varca, South Goa"), never
 * by `google_maps_url`, which may point at the exact gate. The embed marks the
 * searched area's centre, not the property, and a soft circle over the middle
 * reads as "somewhere around here". The iframe is non-interactive so the circle
 * stays over the area it describes; it is lazy-loaded inside a fixed-height box
 * so it causes no layout shift.
 */

/** "Varca, South Goa"; adds "Goa" when the stored region does not already say it. */
export function areaMapQuery({ area, region }: { area: string | null; region: string | null }) {
  const parts = [area?.trim(), region?.trim()].filter((part): part is string => Boolean(part));
  if (parts.length === 0) return null;
  if (!/\bgoa\b/i.test(parts.join(" "))) parts.push("Goa");
  return parts.join(", ");
}

export function PropertyAreaMap({ query }: { query: string }) {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=13&output=embed`;

  return (
    <figure className="relative mb-4 h-[260px] overflow-hidden rounded-[20px] border border-public-hairline bg-public-cream sm:h-[340px]">
      <iframe
        aria-label={`Map of the approximate area around ${query}`}
        className="pointer-events-none absolute inset-0 h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={src}
        tabIndex={-1}
        title={`Map of the approximate area around ${query}`}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-public-coral bg-public-coral/15 sm:h-44 sm:w-44"
      />
      <figcaption className="absolute right-3 top-3 max-w-[calc(100%-24px)] truncate rounded-full bg-white/95 px-3 py-1.5 text-[12.5px] font-semibold text-public-ink shadow-[0_1px_4px_rgba(0,0,0,0.15)]">
        {/* Short on phones so it clears Google's own "Open in Maps" chip. */}
        <span className="sm:hidden">Approximate area</span>
        <span className="hidden sm:inline">Approximate area: {query}</span>
      </figcaption>
    </figure>
  );
}
