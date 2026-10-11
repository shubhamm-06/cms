"use client";

import { House, LayoutGrid } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import {
  buildTourGroups,
  PropertyPhotoTour,
  toTourPhotos,
} from "@/src/features/catalogue/property-photo-tour";
import type { PropertyGalleryImage } from "@/src/features/catalogue/public-property-detail-data";
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

export function PropertyGallery({
  images,
  propertyName,
  propertyUrl,
}: {
  images: PropertyGalleryImage[];
  propertyName: string;
  propertyUrl: string;
}) {
  const photos = useMemo(() => toTourPhotos(images, propertyName), [images, propertyName]);
  const groups = useMemo(() => buildTourGroups(photos), [photos]);
  const tourIndexByPath = useMemo(
    () => new Map(groups.flatMap((group) => group.photos.map(({ index, photo }) => [photo.storage_path, index]))),
    [groups],
  );
  const tour = usePhotoTourUrl(photos.length);
  const [activeSlide, setActiveSlide] = useState(0);
  const [scrollToIndex, setScrollToIndex] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  if (photos.length === 0) {
    return (
      <div className="flex h-[240px] w-full flex-col items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-br from-public-cream to-public-sand sm:h-[320px] lg:h-[440px] lg:rounded-[20px]">
        <House aria-hidden="true" className="h-9 w-9 text-public-taupe-soft" />
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-public-taupe">
          Photos coming soon
        </span>
      </div>
    );
  }

  const side = Math.min(photos.length - 1, maxSideImages);

  function openTourAt(galleryIndex: number) {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setScrollToIndex(tourIndexByPath.get(photos[galleryIndex].storage_path) ?? 0);
    tour.openTour();
  }

  function handleScroll() {
    const element = scroller.current;
    if (!element || element.clientWidth === 0) return;
    setActiveSlide(Math.round(element.scrollLeft / element.clientWidth));
  }

  return (
    <>
      <div className="relative -mx-4 sm:mx-0">
        <div
          aria-label={`${propertyName} photos`}
          className={cn(
            // Mobile and tablet: full-width snap carousel.
            "flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain sm:rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
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
              aria-label={`Open photo ${index + 1} of ${photos.length}${photo.caption ? `: ${photo.caption}` : ""}`}
              className={cn(
                "relative aspect-[4/3] w-full shrink-0 snap-start snap-always overflow-hidden bg-public-sand outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-public-coral sm:aspect-[16/10] lg:aspect-auto lg:min-h-0",
                desktopTileClasses(index, side),
              )}
              key={photo.storage_path}
              onClick={() => openTourAt(index)}
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
              className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-public-ink/75 px-2.5 py-1 text-[12.5px] font-semibold tabular-nums text-white lg:hidden"
            >
              {Math.min(activeSlide + 1, photos.length)} / {photos.length}
            </span>
            <button
              className="absolute bottom-4 right-4 hidden min-h-10 items-center gap-2 rounded-xl border border-public-ink bg-white px-3.5 py-2 text-[14px] font-semibold text-public-ink shadow-[0_2px_8px_rgba(0,0,0,0.12)] outline-none transition-colors hover:bg-public-hover focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2 lg:inline-flex"
              onClick={() => openTourAt(0)}
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
        scrollToIndex={scrollToIndex}
      />
    </>
  );
}
