"use client";

import { ArrowLeft, House, LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import {
  buildTourGroups,
  photoLabel,
  PropertyPhotoTour,
  toTourPhotos,
} from "@/src/features/catalogue/property-photo-tour";
import type { PropertyGalleryImage } from "@/src/features/catalogue/public-property-detail-data";
import { ShareButton } from "@/src/features/catalogue/share-button";
import { usePhotoTourUrl } from "@/src/features/catalogue/use-photo-tour-url";
import { cn } from "@/src/lib/utils/cn";

/**
 * Property gallery for `/property/[slug]`.
 *
 * One list of photo buttons serves both layouts, so the cover is preloaded once:
 * below `lg` it is a full-width, snap-scrolling carousel with a "1 / N" counter;
 * from `lg` the same elements become the reference's 1.4fr cover beside up to
 * four smaller photos, and the rest are `display: none` (so their lazy images are
 * never fetched there). Only real photos render: there are no padding tiles.
 * Any photo, and "Show all photos", opens the full photo tour.
 */

const maxSideImages = 4;

/** Desktop grid tracks for the cover plus `side` smaller photos. */
function desktopGridClasses(side: number) {
  if (side === 0) return "lg:grid-cols-1 lg:grid-rows-1";
  if (side === 1) return "lg:grid-cols-[1.4fr_1fr] lg:grid-rows-1";
  if (side === 2) return "lg:grid-cols-[1.4fr_1fr] lg:grid-rows-2";

  return "lg:grid-cols-[1.4fr_0.5fr_0.5fr] lg:grid-rows-2";
}

/** Desktop placement for the photo at `index`; every real gallery size fills evenly. */
function desktopTileClasses(index: number, side: number) {
  if (index > maxSideImages) return "lg:hidden";
  if (index === 0) return side >= 2 ? "lg:row-span-2" : "";
  // With exactly three, the first small photo fills the middle column.
  if (side === 3 && index === 1) return "lg:row-span-2";

  return "";
}

function desktopSizes(index: number, side: number) {
  if (index === 0) return side === 0 ? "(min-width: 1024px) 1120px, 100vw" : "(min-width: 1024px) 690px, 100vw";
  if (side <= 2) return "(min-width: 1024px) 490px, 100vw";

  return "(min-width: 1024px) 245px, 100vw";
}

/** Round white buttons over the hero photo below md, where the site header is hidden. */
const heroButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-public-ink shadow-[0_2px_8px_rgba(0,0,0,0.18)] outline-none focus-visible:ring-2 focus-visible:ring-public-coral";

function HeroOverlayButtons({ propertyName, propertyUrl }: { propertyName: string; propertyUrl: string }) {
  const router = useRouter();

  // Back to where the visitor came from when that was this site, otherwise to all stays.
  function goBack() {
    const cameFromSite = document.referrer.startsWith(window.location.origin) && window.history.length > 1;
    if (cameFromSite) router.back();
    else router.push("/booking");
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3 pt-[calc(12px+env(safe-area-inset-top))] md:hidden">
      <button aria-label="Back to all stays" className={cn(heroButton, "pointer-events-auto")} onClick={goBack} type="button">
        <ArrowLeft aria-hidden="true" className="h-[18px] w-[18px]" />
      </button>
      <div className="pointer-events-auto">
        <ShareButton className={cn(heroButton, "min-h-10 gap-0 px-0 hover:bg-white")} iconOnly title={propertyName} url={propertyUrl} />
      </div>
    </div>
  );
}

export function PropertyGallery({
  altBase,
  images,
  propertyName,
  propertyUrl,
}: {
  altBase?: string;
  images: PropertyGalleryImage[];
  propertyName: string;
  propertyUrl: string;
}) {
  const photos = useMemo(() => toTourPhotos(images, propertyName, altBase), [images, propertyName, altBase]);
  const groups = useMemo(() => buildTourGroups(photos), [photos]);
  const tour = usePhotoTourUrl(photos.length);
  const [activeSlide, setActiveSlide] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  if (photos.length === 0) {
    return (
      <div className="relative flex h-[240px] w-full flex-col items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-br from-public-cream to-public-sand sm:h-[320px] lg:h-[440px] lg:rounded-[20px]">
        <HeroOverlayButtons propertyName={propertyName} propertyUrl={propertyUrl} />
        <House aria-hidden="true" className="h-9 w-9 text-public-taupe-soft" />
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-public-taupe">
          Photos coming soon
        </span>
      </div>
    );
  }

  const side = Math.min(photos.length - 1, maxSideImages);

  // Any page photo or "Show all photos" opens the tour at its top; the lightbox only
  // opens from a photo inside the tour.
  function openTour() {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    tour.openTour();
  }

  function handleScroll() {
    const element = scroller.current;
    if (!element || element.clientWidth === 0) return;
    setActiveSlide(Math.round(element.scrollLeft / element.clientWidth));
  }

  return (
    <>
      {/* Below md the hero runs edge to edge; from md it is the existing carousel/grid. */}
      <div className="relative -mx-4 sm:-mx-6 md:mx-0">
        <HeroOverlayButtons propertyName={propertyName} propertyUrl={propertyUrl} />
        <div
          aria-label={`${propertyName} photos`}
          className={cn(
            // Mobile and tablet: full-width snap carousel.
            "flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain md:rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            // Desktop: cover beside the smaller photos.
            "lg:grid lg:h-[440px] lg:snap-none lg:gap-2 lg:overflow-hidden lg:rounded-[20px]",
            desktopGridClasses(side),
          )}
          onScroll={handleScroll}
          ref={scroller}
          role="region"
        >
          {photos.map((photo, index) => (
            <button
              aria-label={photoLabel(photo, index, photos.length)}
              className={cn(
                "relative aspect-[4/3] w-full shrink-0 snap-center snap-always overflow-hidden bg-public-sand outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-public-coral md:snap-start md:aspect-[16/10] lg:aspect-auto lg:min-h-0",
                desktopTileClasses(index, side),
              )}
              key={photo.storage_path}
              onClick={() => openTour()}
              type="button"
            >
              <Image
                alt={photo.alt}
                className="object-cover transition-[filter] duration-200 hover:brightness-90"
                fill
                preload={index === 0}
                sizes={desktopSizes(index, side)}
                src={photo.url}
              />
            </button>
          ))}
        </div>

        {photos.length > 1 ? (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-9 right-3 rounded-md bg-public-ink/75 md:bottom-3 px-2.5 py-1 text-[12.5px] font-semibold tabular-nums text-white lg:hidden"
            >
              {Math.min(activeSlide + 1, photos.length)} / {photos.length}
            </span>
            <button
              className="absolute bottom-4 right-4 hidden min-h-10 items-center gap-2 rounded-xl border border-public-ink bg-white px-3.5 py-2 text-[14px] font-semibold text-public-ink shadow-[0_2px_8px_rgba(0,0,0,0.12)] outline-none transition-colors hover:bg-public-hover focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2 lg:inline-flex"
              onClick={() => openTour()}
              type="button"
            >
              <LayoutGrid aria-hidden="true" className="h-4 w-4 shrink-0" />
              Show all photos
            </button>
          </>
        ) : null}
      </div>

      <PropertyPhotoTour
        groups={groups}
        onClose={tour.closeTour}
        onClosePhoto={tour.closePhoto}
        onOpenPhoto={tour.openPhoto}
        onShowPhoto={tour.showPhoto}
        open={tour.tourOpen}
        photoIndex={tour.photoIndex}
        propertyName={propertyName}
        propertyUrl={propertyUrl}
        // A deep-linked tour has no opener, so focus the first photo instead.
        returnFocusTo={() => opener.current ?? scroller.current?.querySelector("button") ?? null}
      />
    </>
  );
}
