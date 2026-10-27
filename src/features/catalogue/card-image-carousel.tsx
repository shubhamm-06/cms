"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import type { CatalogueImage } from "@/src/features/catalogue/public-catalogue-data";
import { getPropertyImageUrl } from "@/src/lib/utils/property-image-url";

/**
 * Photos for one catalogue card: a native scroll-snap strip, so phones swipe with no
 * gesture code. From `md` hover or keyboard focus reveals previous/next buttons; the strip
 * stops at the first and last photo and never autoplays.
 *
 * The card's own link sits behind this strip (the strip has to be above it to receive
 * swipes), so each slide repeats that link for the tap, hidden from assistive technology and
 * out of the tab order. Keyboard users still reach exactly one link, and a swipe never
 * navigates because browsers do not fire a click after a scroll gesture. The buttons are
 * siblings of the links, never inside them, so they cannot trigger navigation.
 */
export function CardImageCarousel({
  href,
  images,
  name,
  sizes,
}: {
  href: string;
  images: CatalogueImage[];
  name: string;
  sizes: string;
}) {
  const strip = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const last = images.length - 1;

  function goTo(next: number) {
    const element = strip.current;
    if (!element) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollTo({ behavior: reduceMotion ? "instant" : "smooth", left: next * element.clientWidth });
  }

  const arrow =
    "absolute top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-public-ink shadow-[0_1px_6px_rgba(0,0,0,0.3)] outline-none transition-opacity focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-public-coral disabled:invisible md:inline-flex md:opacity-0 md:group-hover:opacity-100";

  return (
    <>
      <div
        className="relative z-10 flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(event) => {
          const { clientWidth, scrollLeft } = event.currentTarget;
          setIndex(Math.round(scrollLeft / clientWidth));
        }}
        ref={strip}
      >
        {images.map((image, position) => {
          const url = getPropertyImageUrl(image.storage_path);
          if (!url) return null;

          return (
            <Link aria-hidden="true" className="relative h-full w-full shrink-0 snap-center" href={href} key={image.storage_path} tabIndex={-1}>
              <Image
                alt={position === index ? image.alt_text || name : ""}
                className="object-cover"
                fill
                sizes={sizes}
                src={url}
              />
            </Link>
          );
        })}
      </div>

      <button aria-label="Previous photo" className={`${arrow} left-3`} disabled={index === 0} onClick={() => goTo(index - 1)} type="button">
        <ChevronLeft aria-hidden="true" className="h-5 w-5" />
      </button>
      <button aria-label="Next photo" className={`${arrow} right-3`} disabled={index === last} onClick={() => goTo(index + 1)} type="button">
        <ChevronRight aria-hidden="true" className="h-5 w-5" />
      </button>
      <span className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold leading-4 text-white">
        {`${index + 1} / ${images.length}`}
      </span>
    </>
  );
}
