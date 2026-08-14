import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bath, BedDouble, Footprints, House, Users, Waves } from "lucide-react";
import type { CatalogueProperty } from "@/src/features/catalogue/public-catalogue-data";
import { formatMoney } from "@/src/lib/utils/money";
import { getPropertyImageUrl } from "@/src/lib/utils/property-image-url";

function locationLine(property: CatalogueProperty) {
  if (property.short_location_line) return property.short_location_line;

  return [property.area, property.region].filter(Boolean).join(", ");
}

/**
 * Admins store either "Private" or "Private pool", so only append the noun when
 * it is missing. "None" is a real stored value that is not worth showing.
 */
function poolLabel(poolType: string | null) {
  const value = poolType?.trim();
  if (!value || /^none$/i.test(value)) return null;

  return /pool/i.test(value) ? value : `${value} pool`;
}

function plural(count: number, singular: string) {
  return `${count} ${count === 1 ? singular : `${singular}s`}`;
}

export function CataloguePropertyCard({ property }: { property: CatalogueProperty }) {
  const coverUrl = getPropertyImageUrl(property.cover_storage_path);
  const location = locationLine(property);
  const pool = poolLabel(property.pool_type);
  const name = property.public_name || "Curated stay";
  const showPrice = property.show_price && property.starting_price != null;

  const facts = [
    property.max_guests != null
      ? { icon: Users, label: plural(property.max_guests, "guest") }
      : null,
    property.bedrooms != null
      ? { icon: BedDouble, label: plural(property.bedrooms, "bedroom") }
      : null,
    property.bathrooms != null
      ? { icon: Bath, label: plural(property.bathrooms, "bath") }
      : null,
  ].filter((fact) => fact !== null);

  return (
    /*
      The whole card navigates to the property, so the only link is the overlay
      at the end of this article. Nothing inside it may become a link as well:
      the covering anchor would nest, and the reachable-by-keyboard order would
      duplicate. `View stay` is therefore presentational text that reacts to the
      card's own hover state.
    */
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#ebebeb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition duration-200 hover:-translate-y-[3px] hover:border-[#e4d9d1] hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-[#ff5a5f] has-[a:focus-visible]:ring-offset-2">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#fbf1ec]">
        {coverUrl ? (
          <Image
            alt={property.cover_alt_text || name}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            fill
            sizes="(min-width: 1024px) 370px, (min-width: 640px) 45vw, 92vw"
            src={coverUrl}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#fbf7f1] to-[#f1e0d7]">
            <House aria-hidden="true" className="h-8 w-8 text-[#c9a79a]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9a7770]">
              Photos coming soon
            </span>
          </div>
        )}
        {property.promotional_badge ? (
          <span className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-[#ff5a5f] px-2.5 py-1 text-xs font-semibold leading-5 text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
            {property.promotional_badge}
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-[18px]">
        <h3 className="line-clamp-2 text-[17px] font-bold leading-[1.3] tracking-[-0.01em] text-[#222222] [overflow-wrap:anywhere]">
          {name}
        </h3>

        {location ? (
          <p className="mt-1 line-clamp-1 text-[13.5px] leading-5 text-[#717171]">{location}</p>
        ) : null}

        {property.public_property_type || pool ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {property.public_property_type ? (
              <span className="max-w-full truncate rounded-full bg-[#fff1f1] px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-[0.08em] text-[#9e4347]">
                {property.public_property_type}
              </span>
            ) : null}
            {pool ? (
              <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#eaf3f5] px-2.5 py-1 text-[11.5px] font-semibold text-[#2c6478]">
                <Waves aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{pool}</span>
              </span>
            ) : null}
          </div>
        ) : null}

        {facts.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[13px] font-medium text-[#484848]">
            {facts.map((fact) => {
              const Icon = fact.icon;

              return (
                <span className="inline-flex items-center gap-1.5" key={fact.label}>
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-[#9a7770]" />
                  {fact.label}
                </span>
              );
            })}
          </div>
        ) : null}

        {property.distance_from_beach ? (
          <p className="mt-2 inline-flex items-start gap-1.5 text-[12.5px] leading-5 text-[#717171]">
            <Footprints aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0">{property.distance_from_beach}</span>
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-3 border-t border-[#f2ede9] pt-3.5">
          <div className="min-w-0">
            {showPrice ? (
              <>
                <div className="text-[17px] font-extrabold leading-tight tracking-[-0.01em] text-[#222222]">
                  {`From ${formatMoney(property.starting_price)}`}
                </div>
                <div className="text-[12.5px] leading-5 text-[#717171]">per night</div>
              </>
            ) : null}
            {property.price_note ? (
              <div className="mt-0.5 text-[11.5px] leading-4 text-[#717171]">
                {property.price_note}
              </div>
            ) : null}
          </div>
          <span
            aria-hidden="true"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#e54b50] transition-colors group-hover:text-[#c63f44]"
          >
            <span className="border-b border-transparent pb-px transition-colors group-hover:border-current">
              View stay
            </span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>

      <Link className="absolute inset-0 rounded-2xl outline-none" href={`/property/${property.slug}`}>
        <span className="sr-only">{`View stay at ${name}`}</span>
      </Link>
    </article>
  );
}
