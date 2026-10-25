import Image from "next/image";
import Link from "next/link";
import type { CatalogueProperty } from "@/src/features/catalogue/public-catalogue-data";
import { CardImageCarousel } from "@/src/features/catalogue/card-image-carousel";
import { formatMoney } from "@/src/lib/utils/money";
import { getPropertyImageUrl } from "@/src/lib/utils/property-image-url";

function locationLine(property: CatalogueProperty) {
  return property.short_location_line || [property.area, property.region].filter(Boolean).join(", ");
}

function poolLabel(poolType: string | null) {
  const value = poolType?.trim();
  if (!value || /^none$/i.test(value)) return null;
  return /pool/i.test(value) ? value : `${value} pool`;
}

function plural(count: number, singular: string) {
  return `${count} ${count === 1 ? singular : `${singular}s`}`;
}

export function CataloguePropertyCard({ property }: { property: CatalogueProperty }) {
  const href = `/property/${property.slug}`;
  const photos = property.images.filter((image) => getPropertyImageUrl(image.storage_path));
  const singlePhotoUrl = photos.length === 1 ? getPropertyImageUrl(photos[0].storage_path) : null;
  const imageSizes = "(min-width: 1280px) 564px, (min-width: 1024px) calc((100vw - 152px) / 2), (min-width: 768px) 45vw, calc(100vw - 40px)";
  const name = property.public_name || "Curated stay";
  const showPrice = property.show_price && property.starting_price != null;
  const metadata = [locationLine(property), property.public_property_type, poolLabel(property.pool_type)].filter(Boolean).join(" \u00b7 ");
  const facts = [
    property.max_guests != null ? plural(property.max_guests, "guest") : null,
    property.bedrooms != null ? plural(property.bedrooms, "bedroom") : null,
    property.bathrooms != null ? plural(property.bathrooms, "bath") : null,
  ].filter(Boolean).join(" \u00b7 ");

  return (
    <article className="group relative flex h-full min-w-0 flex-col text-[#1f1f1d] has-[a:focus-visible]:rounded-2xl has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-[#1f1f1d]">
      <div className="relative h-[230px] w-full overflow-hidden rounded-2xl border border-[#e7e5df] bg-[#f1efe9] lg:h-[300px]">
        {photos.length > 1 ? <CardImageCarousel href={href} images={photos} name={name} sizes={imageSizes} /> : singlePhotoUrl ? (
          <Image alt={photos[0].alt_text || name} className="object-cover" fill sizes={imageSizes} src={singlePhotoUrl} />
        ) : <div className="flex h-full items-center justify-center text-sm text-[#5c5c57]">Photos coming soon</div>}
        {property.promotional_badge ? <span className="pointer-events-none absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-[#1f1f1d] px-3 py-1.5 text-[13px] font-semibold text-white">{property.promotional_badge}</span> : null}
      </div>
      <div className="flex flex-1 flex-col pt-4">
        {metadata ? <p className="text-[13px] leading-5 text-[#5c5c57]">{metadata}</p> : null}
        <h3 className="mt-1 text-xl font-semibold leading-snug tracking-tight [overflow-wrap:anywhere] lg:text-[21px]">{name}</h3>
        {facts ? <p className="mt-1 text-[15px] leading-relaxed text-[#5c5c57]">{facts}</p> : null}
        {property.distance_from_beach ? <p className="mt-1 text-sm leading-relaxed text-[#5c5c57]">{property.distance_from_beach}</p> : null}
        <div className="mt-auto pt-4">
          <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-[#e3e0d8] text-sm">
            {showPrice ? <p>{`From ${formatMoney(property.starting_price)} / night`}</p> : null}
            <span aria-hidden="true" className="ml-auto inline-flex min-h-11 items-center font-semibold underline decoration-1 underline-offset-4">View stay</span>
          </div>
          {property.price_note ? <p className="text-[13px] leading-5 text-[#5c5c57]">{property.price_note}</p> : null}
        </div>
      </div>
      {/* One keyboard link for the whole card; the carousel keeps its existing swipe links above it. */}
      <Link className="absolute inset-0 rounded-2xl outline-none" href={href}><span className="sr-only">{`View stay at ${name}`}</span></Link>
    </article>
  );
}
