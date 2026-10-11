"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import type { PropertyGalleryImage } from "@/src/features/catalogue/public-property-detail-data";
import { ShareButton } from "@/src/features/catalogue/share-button";
import { cn } from "@/src/lib/utils/cn";
import { getPropertyImageUrl } from "@/src/lib/utils/property-image-url";
import { ADDITIONAL_PHOTOS_LABEL, parsePhotoRoom } from "@/src/lib/utils/photo-rooms";

/**
 * Photo tour and lightbox for `/property/[slug]`.
 *
 * The tour is laid out like a "photo tour": an index of one thumbnail per room,
 * then one section per room. Each photo's room comes from its `alt_text` (see
 * `photo-rooms.ts`: an explicit `Room | description` prefix, else keywords). Rooms
 * are ordered by where their first photo appears in the admin order, and photos
 * with no detected room go last under "Additional photos". With fewer than two
 * detected rooms the index and headings are skipped and the photos show in one
 * plain 2-column grid.
 *
 * Both overlays are Radix dialogs, so focus is trapped and Esc closes the
 * topmost one; their open state lives in the URL (see `usePhotoTourUrl`).
 */

export type TourPhoto = PropertyGalleryImage & {
  alt: string;
  /** Text shown after the room name in captions, without any room prefix. */
  description: string | null;
  /** Detected room name, or null for "Additional photos". */
  room: string | null;
  roomKey: string | null;
  url: string;
};

export type TourGroup = {
  id: string;
  /** Null for the single ungrouped fallback section. */
  label: string | null;
  photos: Array<{ photo: TourPhoto; index: number }>;
};

/** Builds the tour order. `index` is the photo's position in that order. */
export function buildTourGroups(photos: TourPhoto[]): TourGroup[] {
  const rooms = new Map<string, { label: string; photos: TourPhoto[] }>();
  const additional: TourPhoto[] = [];

  photos.forEach((photo) => {
    if (!photo.roomKey || !photo.room) {
      additional.push(photo);
      return;
    }
    const entry = rooms.get(photo.roomKey) || { label: photo.room, photos: [] };
    entry.photos.push(photo);
    rooms.set(photo.roomKey, entry);
  });

  if (rooms.size < 2) {
    return [{ id: "all", label: null, photos: photos.map((photo, index) => ({ index, photo })) }];
  }

  // Map insertion order is each room's first appearance, i.e. its lowest sort position.
  const sections = [...rooms.entries()].map(([key, room], position) => ({
    id: `room-${position}-${key.replace(/[^a-z0-9]+/g, "-")}`,
    label: room.label,
    photos: room.photos,
  }));
  if (additional.length > 0) {
    sections.push({ id: "room-additional", label: ADDITIONAL_PHOTOS_LABEL, photos: additional });
  }

  let index = 0;
  return sections.map((section) => ({
    id: section.id,
    label: section.label,
    photos: section.photos.map((photo) => ({ index: index++, photo })),
  }));
}

export function toTourPhotos(images: PropertyGalleryImage[], propertyName: string): TourPhoto[] {
  return images.flatMap((image, position) => {
    const url = getPropertyImageUrl(image.storage_path);
    if (!url) return [];
    const { description, room, roomKey } = parsePhotoRoom(image.alt_text);
    // The room prefix is stripped so screen readers hear the description only.
    const alt = description || (room ? `${room}, ${propertyName}` : `${propertyName} photo ${position + 1}`);
    return [{ ...image, alt, description, room, roomKey, url }];
  });
}

/** Accessible label for opening a photo: its room, then its description. */
export function photoLabel(photo: TourPhoto, index: number, total: number) {
  const detail = [photo.room, photo.description].filter(Boolean).join(": ");
  return `Open photo ${index + 1} of ${total}${detail ? `: ${detail}` : ""}`;
}

const tourButton =
  "inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-[14.5px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2";

const photoButton =
  "relative block h-full w-full overflow-hidden rounded-xl bg-public-sand outline-none focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2";

/**
 * One room's photos: the first photo full width (3:2), the rest in side-by-side
 * pairs (4:3), and a single leftover photo at the end full width. Fixed aspect
 * ratios with object-cover keep portrait photos from breaking the grid.
 */
function RoomPhotos({
  group,
  onOpenPhoto,
  total,
}: {
  group: TourGroup;
  onOpenPhoto: (index: number) => void;
  total: number;
}) {
  const count = group.photos.length;
  const grouped = group.label !== null;

  return (
    <ul className="grid grid-cols-2 gap-2 sm:gap-3">
      {group.photos.map(({ index, photo }, position) => {
        // The ungrouped fallback is a plain 2-column grid of equal tiles.
        const full = grouped && (position === 0 || (position === count - 1 && (count - 1) % 2 === 1));
        return (
          <li
            className={cn(full ? "col-span-2 aspect-[3/2]" : "aspect-[4/3]")}
            id={`tour-photo-${index}`}
            key={photo.storage_path}
          >
            <button
              aria-label={photoLabel(photo, index, total)}
              className={photoButton}
              onClick={() => onOpenPhoto(index)}
              type="button"
            >
              <Image
                alt={photo.alt}
                className="object-cover transition-[filter] duration-200 hover:brightness-90"
                fill
                sizes={
                  full
                    ? "(min-width: 1120px) 700px, (min-width: 768px) 60vw, 100vw"
                    : "(min-width: 1120px) 345px, (min-width: 768px) 30vw, 50vw"
                }
                src={photo.url}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

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
  const showIndex = groups.length > 1;

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

          <div className="mx-auto w-full max-w-[1120px] px-4 pb-20 pt-8 sm:px-6">
            {showIndex ? (
              <nav aria-label="Photo tour" className="mb-12 sm:mb-14">
                <h2 className="mb-4 text-[26px] font-bold leading-tight tracking-[-0.01em] sm:text-[30px]">
                  Photo tour
                </h2>
                <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
                  {groups.map((group) => {
                    const cover = group.photos[0]?.photo;
                    return (
                      <li className="w-[104px] shrink-0 sm:w-[132px]" key={group.id}>
                        <button
                          className="group block w-full rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2"
                          onClick={() => jumpTo(group.id)}
                          type="button"
                        >
                          <span className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-public-sand">
                            {cover ? (
                              <Image
                                alt=""
                                className="object-cover transition-[filter] duration-200 group-hover:brightness-90"
                                fill
                                sizes="132px"
                                src={cover.url}
                              />
                            ) : null}
                          </span>
                          <span className="mt-1.5 block truncate text-[13px] font-semibold">{group.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ) : null}

            <div className="grid gap-12 sm:gap-16">
              {groups.map((group) => (
                <section
                  aria-label={group.label || `${propertyName} photos`}
                  className="scroll-mt-20 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-8"
                  id={group.id}
                  key={group.id}
                >
                  {group.label ? (
                    <h3 className="mb-3 text-[17px] font-bold tracking-[-0.005em] md:mb-0 md:pt-1 md:text-[18px]">
                      {group.label}
                    </h3>
                  ) : null}
                  <div className={cn(!group.label && "md:col-span-2")}>
                    <RoomPhotos group={group} onOpenPhoto={onOpenPhoto} total={photos.length} />
                  </div>
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
          aria-describedby={photo?.room || photo?.description ? "lightbox-caption" : undefined}
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
              {photo?.room ? <span className="font-semibold text-white">{photo.room}</span> : null}
              {photo?.room && photo.description ? <span aria-hidden="true"> · </span> : null}
              {photo?.description || ""}
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
