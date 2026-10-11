"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import type { PropertyGalleryImage } from "@/src/features/catalogue/public-property-detail-data";
import { ShareButton } from "@/src/features/catalogue/share-button";
import { getPropertyImageUrl } from "@/src/lib/utils/property-image-url";
import { cn } from "@/src/lib/utils/cn";

/**
 * Full photo tour and lightbox for `/property/[slug]`.
 *
 * Photos are grouped by `room_label` in the order each room first appears in the
 * admin sort order. Unlabelled photos go to a trailing "More photos" group, and a
 * gallery with no labels at all renders one ungrouped 2-column section. Both
 * overlays are Radix dialogs, so focus is trapped and Esc closes the topmost one;
 * their open state lives in the URL (see `usePhotoTourUrl`).
 */

export type TourPhoto = PropertyGalleryImage & { alt: string; caption: string | null; url: string };

export type TourGroup = { id: string; label: string | null; photos: Array<{ photo: TourPhoto; index: number }> };

/** Builds the tour order. `index` is the photo's position in that order. */
export function buildTourGroups(photos: TourPhoto[]): TourGroup[] {
  const labelled = photos.some((photo) => photo.room_label?.trim());
  if (!labelled) return [{ id: "all", label: null, photos: photos.map((photo, index) => ({ index, photo })) }];

  const groups = new Map<string, TourPhoto[]>();
  photos.forEach((photo) => {
    const label = photo.room_label?.trim() || "";
    groups.set(label, [...(groups.get(label) || []), photo]);
  });

  // Unlabelled photos always come last, under a neutral heading.
  const ordered = [...groups.entries()].sort(([a], [b]) => Number(a === "") - Number(b === ""));
  let index = 0;
  return ordered.map(([label, groupPhotos], groupIndex) => ({
    id: `room-${groupIndex}`,
    label: label || "More photos",
    photos: groupPhotos.map((photo) => ({ index: index++, photo })),
  }));
}

export function toTourPhotos(images: PropertyGalleryImage[], propertyName: string): TourPhoto[] {
  return images.flatMap((image, position) => {
    const url = getPropertyImageUrl(image.storage_path);
    if (!url) return [];
    const caption = image.alt_text?.trim() || null;
    return [{ ...image, alt: caption || `${propertyName} photo ${position + 1}`, caption, url }];
  });
}

const tourButton =
  "inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-[14.5px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2";

export function PropertyPhotoTour({
  groups,
  onClose,
  onClosePhoto,
  onOpenPhoto,
  onShowPhoto,
  open,
  photoIndex,
  propertyName,
  propertyUrl,
  returnFocusTo,
  scrollToIndex,
}: {
  groups: TourGroup[];
  onClose: () => void;
  onClosePhoto: () => void;
  onOpenPhoto: (index: number) => void;
  onShowPhoto: (index: number) => void;
  open: boolean;
  photoIndex: number | null;
  propertyName: string;
  propertyUrl: string;
  /** Tour photo to bring into view when the tour opens. */
  scrollToIndex: number | null;
  /** Element that opened the tour; focus returns there when the tour closes. */
  returnFocusTo: () => HTMLElement | null;
}) {
  const photos = groups.flatMap((group) => group.photos.map(({ photo }) => photo));
  const showJumpStrip = groups.length > 1;

  // Scroll to the tapped photo once per opening. Closing the lightbox must not
  // move the tour, so this never re-runs while the tour stays open.
  const scrolledThisOpening = useRef(false);
  useEffect(() => {
    if (!open) {
      scrolledThisOpening.current = false;
      return;
    }
    if (scrolledThisOpening.current || scrollToIndex === null) return;
    scrolledThisOpening.current = true;
    // Radix mounts the content on open, so wait a frame before scrolling.
    const frame = requestAnimationFrame(() => {
      document.getElementById(`tour-photo-${scrollToIndex}`)?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, scrollToIndex]);

  function jumpTo(groupId: string) {
    document.getElementById(groupId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <Dialog.Root onOpenChange={(next) => (next ? undefined : onClose())} open={open}>
      <Dialog.Portal>
        {/* The overlay is what carries Radix's scroll lock: it locks the page
            behind the tour and pads the page by the scrollbar width, so the tour
            content is the only scroll container. */}
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-white" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain bg-white text-public-ink outline-none"
          // The tour closes on a history change rather than a click, so Radix's own
          // focus return lands on <body>; send focus back to the opener explicitly.
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocusTo()?.focus({ preventScroll: true });
          }}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-public-hairline bg-white/95 px-2 py-2 backdrop-blur sm:px-4">
            <Dialog.Close className={cn(tourButton, "hover:bg-public-hover")}>
              <ChevronLeft aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span>Back</span>
            </Dialog.Close>
            <Dialog.Title className="min-w-0 truncate text-[15px] font-bold">
              {propertyName}
              <span className="sr-only"> photos</span>
            </Dialog.Title>
            <ShareButton title={propertyName} url={propertyUrl} />
          </div>

          <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6 sm:px-6">
            {showJumpStrip ? (
              <nav aria-label="Jump to a room" className="-mx-4 mb-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <ul className="flex gap-3 pb-1">
                  {groups.map((group) => {
                    const cover = group.photos[0]?.photo;
                    return (
                      <li className="shrink-0" key={group.id}>
                        <button
                          className="group w-[104px] rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2 sm:w-[128px]"
                          onClick={() => jumpTo(group.id)}
                          type="button"
                        >
                          <span className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-public-sand">
                            {cover ? (
                              <Image alt="" className="object-cover transition-[filter] duration-200 group-hover:brightness-90" fill sizes="128px" src={cover.url} />
                            ) : null}
                          </span>
                          <span className="mt-1.5 block truncate text-[13.5px] font-semibold">{group.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ) : null}

            <div className="grid gap-10 sm:gap-14">
              {groups.map((group) => (
                <section
                  aria-label={group.label || `${propertyName} photos`}
                  className="scroll-mt-20 md:grid md:grid-cols-[200px_minmax(0,1fr)] md:gap-8"
                  id={group.id}
                  key={group.id}
                >
                  {group.label ? (
                    <h2 className="mb-3 text-[19px] font-bold tracking-[-0.01em] md:mb-0 md:text-[21px]">
                      {group.label}
                    </h2>
                  ) : null}
                  <ul className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2", !group.label && "md:col-span-2")}>
                    {group.photos.map(({ index, photo }, position) => (
                      <li
                        className={cn(
                          // An odd count leads with one full-width photo so rows stay even.
                          group.photos.length % 2 === 1 && position === 0 && "sm:col-span-2",
                        )}
                        id={`tour-photo-${index}`}
                        key={photo.storage_path}
                      >
                        <button
                          aria-label={`Open photo ${index + 1} of ${photos.length}${photo.caption ? `: ${photo.caption}` : ""}`}
                          className="relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-public-sand outline-none focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2"
                          onClick={() => onOpenPhoto(index)}
                          type="button"
                        >
                          <Image
                            alt={photo.alt}
                            className="object-cover transition-[filter] duration-200 hover:brightness-90"
                            fill
                            sizes={
                              group.photos.length % 2 === 1 && position === 0
                                ? "(min-width: 1120px) 860px, 100vw"
                                : "(min-width: 1120px) 430px, (min-width: 640px) 50vw, 100vw"
                            }
                            src={photo.url}
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>

          <PhotoLightbox
            index={photoIndex}
            onClose={onClosePhoto}
            onShow={onShowPhoto}
            photos={photos}
            propertyName={propertyName}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const swipeThreshold = 50;

function PhotoLightbox({
  index,
  onClose,
  onShow,
  photos,
  propertyName,
}: {
  index: number | null;
  onClose: () => void;
  onShow: (index: number) => void;
  photos: TourPhoto[];
  propertyName: string;
}) {
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const lastIndex = useRef<number | null>(null);
  const photo = index === null ? null : photos[index];

  useEffect(() => {
    if (index !== null) lastIndex.current = index;
  }, [index]);
  const hasPrevious = index !== null && index > 0;
  const hasNext = index !== null && index < photos.length - 1;

  function step(direction: -1 | 1) {
    if (index === null) return;
    const next = index + direction;
    if (next >= 0 && next < photos.length) onShow(next);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    // Mostly-horizontal swipes only, so vertical scrolling never changes photo.
    if (Math.abs(dx) < swipeThreshold || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    step(dx < 0 ? 1 : -1);
  }

  // Neighbouring photos load eagerly so prev/next feel instant.
  const neighbours = index === null ? [] : [photos[index - 1], photos[index + 1]].filter(Boolean);

  return (
    <Dialog.Root onOpenChange={(next) => (next ? undefined : onClose())} open={photo !== null}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-public-ink" />
        <Dialog.Content
          aria-describedby={photo?.caption ? "lightbox-caption" : undefined}
          className="fixed inset-0 z-[90] flex flex-col bg-public-ink text-white outline-none"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (lastIndex.current === null) return;
            document.querySelector<HTMLElement>(`#tour-photo-${lastIndex.current} button`)?.focus({ preventScroll: true });
          }}
          // Keyboard arrows step photos; the prev/next buttons stay focusable at
          // either end (aria-disabled) so focus never falls out of the lightbox.
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center justify-between gap-3 px-2 py-2 sm:px-4">
            <Dialog.Close className={cn(tourButton, "hover:bg-white/10")}>
              <X aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span>Close</span>
            </Dialog.Close>
            <Dialog.Title className="text-[14.5px] font-semibold tabular-nums">
              <span className="sr-only">{propertyName} photo </span>
              {index === null ? null : `${index + 1} / ${photos.length}`}
            </Dialog.Title>
            <span aria-hidden="true" className="w-[88px]" />
          </div>

          <div
            className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center px-2 sm:px-20"
            onPointerCancel={() => (pointerStart.current = null)}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            {photo ? (
              <div className="relative h-full w-full max-w-[1200px]">
                <Image
                  alt={photo.alt}
                  className="object-contain"
                  fill
                  key={photo.storage_path}
                  loading="eager"
                  sizes="(min-width: 1360px) 1200px, 100vw"
                  src={photo.url}
                />
              </div>
            ) : null}
            {neighbours.map((neighbour) => (
              <Image
                alt=""
                aria-hidden="true"
                className="pointer-events-none invisible"
                fill
                key={neighbour.storage_path}
                loading="eager"
                sizes="(min-width: 1360px) 1200px, 100vw"
                src={neighbour.url}
              />
            ))}

            <button
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white text-public-ink outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-public-ink aria-disabled:cursor-default aria-disabled:opacity-30 sm:left-5 sm:flex"
              aria-disabled={!hasPrevious}
              onClick={() => step(-1)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </button>
            <button
              aria-label="Next photo"
              className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white text-public-ink outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-public-ink aria-disabled:cursor-default aria-disabled:opacity-30 sm:right-5 sm:flex"
              aria-disabled={!hasNext}
              onClick={() => step(1)}
              type="button"
            >
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:justify-center">
            {/* Touch: arrows sit below the photo so they never cover it. */}
            <button
              aria-label="Previous photo"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/40 outline-none focus-visible:ring-2 focus-visible:ring-white aria-disabled:opacity-30 sm:hidden"
              aria-disabled={!hasPrevious}
              onClick={() => step(-1)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </button>
            <p
              className="min-w-0 text-center text-[14.5px] leading-6 text-white/85 [overflow-wrap:anywhere]"
              id="lightbox-caption"
            >
              {photo?.caption || ""}
            </p>
            <button
              aria-label="Next photo"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/40 outline-none focus-visible:ring-2 focus-visible:ring-white aria-disabled:opacity-30 sm:hidden"
              aria-disabled={!hasNext}
              onClick={() => step(1)}
              type="button"
            >
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
