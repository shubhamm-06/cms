import Image from "next/image";
import { House } from "lucide-react";
import type { PropertyGalleryImage } from "@/src/features/catalogue/public-property-detail-data";
import { getPropertyImageUrl } from "@/src/lib/utils/property-image-url";

/**
 * Hero-plus-grid gallery from `reference/booking.html`: one large cover on the
 * left and up to four smaller images in a 2x2 grid on the right. Images arrive
 * already ordered (cover, then sort order, then creation time), so this only
 * lays them out. Deliberately static — no carousel, no lightbox.
 */

const maxSideImages = 4;

/**
 * Keeps the right-hand grid balanced for every real gallery size rather than
 * padding it with repeats of the cover image.
 */
function sideGridClasses(count: number) {
  if (count <= 1) return "grid-cols-1 grid-rows-1";
  if (count === 2) return "grid-cols-1 grid-rows-2";

  return "grid-cols-2 grid-rows-2";
}

function GalleryImage({
  alt,
  className,
  priority,
  sizes,
  storagePath,
}: {
  alt: string;
  className?: string;
  priority?: boolean;
  sizes: string;
  storagePath: string;
}) {
  const url = getPropertyImageUrl(storagePath);
  if (!url) return null;

  return (
    <div className={`relative min-h-0 overflow-hidden bg-[#f1e0d7] ${className || ""}`}>
      <Image alt={alt} className="object-cover" fill priority={priority} sizes={sizes} src={url} />
    </div>
  );
}

export function PropertyGallery({
  images,
  propertyName,
}: {
  images: PropertyGalleryImage[];
  propertyName: string;
}) {
  const cover = images[0];

  if (!cover) {
    return (
      <div className="flex h-[240px] w-full flex-col items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-br from-[#fbf7f1] to-[#f1e0d7] sm:h-[320px] lg:h-[440px] lg:rounded-[20px]">
        <House aria-hidden="true" className="h-9 w-9 text-[#c9a79a]" />
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9a7770]">
          Photos coming soon
        </span>
      </div>
    );
  }

  // Desktop has room for four beside the cover; the stacked mobile grid can show
  // every remaining photo, so nothing an admin uploaded is silently dropped.
  const remainingImages = images.slice(1);
  const sideImages = remainingImages.slice(0, maxSideImages);
  const coverAlt = cover.alt_text || propertyName;

  return (
    <>
      {/* Mobile and tablet: cover first, remaining images in a compact grid. */}
      <div className="lg:hidden">
        <GalleryImage
          alt={coverAlt}
          className="aspect-[4/3] w-full rounded-2xl"
          priority
          sizes="100vw"
          storagePath={cover.storage_path}
        />
        {remainingImages.length > 0 ? (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {remainingImages.map((image) => (
              <GalleryImage
                alt={image.alt_text || propertyName}
                className="aspect-[4/3] w-full rounded-xl"
                key={image.storage_path}
                sizes="50vw"
                storagePath={image.storage_path}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Desktop: reference proportions — 1.4fr hero beside a 2x2 grid. */}
      <div
        className={`hidden h-[440px] gap-2 overflow-hidden rounded-[20px] lg:grid ${
          sideImages.length > 0 ? "grid-cols-[1.4fr_1fr]" : "grid-cols-1"
        }`}
      >
        <GalleryImage
          alt={coverAlt}
          priority
          sizes="690px"
          storagePath={cover.storage_path}
        />
        {sideImages.length > 0 ? (
          <div className={`grid min-h-0 gap-2 ${sideGridClasses(sideImages.length)}`}>
            {sideImages.map((image, index) => (
              <GalleryImage
                alt={image.alt_text || propertyName}
                // With exactly three, the first fills the left column so no cell
                // is left empty.
                className={sideImages.length === 3 && index === 0 ? "row-span-2" : undefined}
                key={image.storage_path}
                sizes="245px"
                storagePath={image.storage_path}
              />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
