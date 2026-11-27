"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type FeaturePhoto = { alt: string; url: string };

export function CorporateOffsiteFeaturePhotoCarousel({
  eager = false,
  photos,
  rowTitle,
}: {
  eager?: boolean;
  photos: FeaturePhoto[];
  rowTitle: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState(0);

  function goToImage(index: number) {
    const track = trackRef.current;
    if (!track) return;

    const nextIndex = Math.max(0, Math.min(index, photos.length - 1));
    track.scrollTo({
      left: nextIndex * track.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
    setActiveImage(nextIndex);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      goToImage(activeImage + (event.key === "ArrowRight" ? 1 : -1));
    }
  }

  return (
    <div
      aria-label={`${rowTitle} photos`}
      aria-roledescription="carousel"
      className="group relative aspect-[5/4] max-h-[460px] w-full overflow-hidden rounded-2xl bg-public-sand outline-none focus-visible:ring-2 focus-visible:ring-public-ink focus-visible:ring-offset-4 md:rounded-[20px]"
      onKeyDown={onKeyDown}
      role="region"
      tabIndex={0}
    >
      <div
        className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(event) => {
          const track = event.currentTarget;
          if (track.clientWidth > 0) {
            const nextIndex = Math.max(0, Math.min(photos.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
            setActiveImage((current) => current === nextIndex ? current : nextIndex);
          }
        }}
        ref={trackRef}
      >
        {photos.map((photo, index) => {
          const preload = eager && index === 0;

          return (
            <div
              aria-label={`${index + 1} of ${photos.length}`}
              aria-roledescription="slide"
              className="relative h-full w-full shrink-0 snap-start"
              key={photo.url}
              role="group"
            >
              <Image
                alt={photo.alt || `${rowTitle} photo ${index + 1}`}
                className="object-cover"
                decoding="async"
                fill
                loading={preload ? undefined : "lazy"}
                preload={preload}
                sizes="(min-width: 1180px) 601px, (min-width: 768px) calc((100vw - 144px) * 0.58), calc(100vw - 40px)"
                src={photo.url}
              />
            </div>
          );
        })}
      </div>

      {photos.length > 1 ? (
        <>
          <button
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-black/10 bg-white/90 text-public-ink opacity-0 outline-none transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:ring-2 focus-visible:ring-public-ink focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-0 md:grid motion-reduce:transition-none"
            disabled={activeImage === 0}
            onClick={() => goToImage(activeImage - 1)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
          <button
            aria-label="Next photo"
            className="absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-black/10 bg-white/90 text-public-ink opacity-0 outline-none transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:ring-2 focus-visible:ring-public-ink focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-0 md:grid motion-reduce:transition-none"
            disabled={activeImage === photos.length - 1}
            onClick={() => goToImage(activeImage + 1)}
            type="button"
          >
            <ChevronRight aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
          <div aria-label="Choose a photo" className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-2 backdrop-blur-sm" role="group">
            {photos.map((photo, index) => (
              <button
                aria-label={`Go to photo ${index + 1}`}
                aria-pressed={activeImage === index}
                className={`h-[6px] rounded-full outline-none transition-[width,background-color] duration-200 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-public-ink motion-reduce:transition-none ${activeImage === index ? "w-[18px] bg-white" : "w-[6px] bg-white/70"}`}
                key={photo.url}
                onClick={() => goToImage(index)}
                type="button"
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
