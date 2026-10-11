"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Keeps the photo tour and lightbox in the URL so the browser and phone back
 * buttons close them instead of leaving the page:
 *
 * - `?photos=1` opens the full photo tour;
 * - `?photos=1&photo=5` also opens the lightbox on the fifth tour photo (1-based).
 *
 * Opening pushes a history entry and records which entries it added in `history.state`,
 * so closing steps back through exactly the entries this page added. A deep link
 * that opened straight onto the tour has no such entry, so closing it replaces
 * the URL instead of navigating away. Lightbox prev/next replace the entry, so
 * one back press always closes the lightbox no matter how many photos were seen.
 *
 * Native `history.pushState` integrates with the Next.js router and
 * `useSearchParams` without a server request (see the Next.js linking guide).
 */

const tourParam = "photos";
const photoParam = "photo";
const stateKey = "cmsPhotoTour";

/** Which entries this page pushed: the tour entry and/or the lightbox entry. */
type PushedEntries = { photo: boolean; tour: boolean };

function readPushed(): PushedEntries {
  const state = window.history.state as Record<string, unknown> | null;
  const value = state?.[stateKey] as Partial<PushedEntries> | undefined;
  return { photo: value?.photo === true, tour: value?.tour === true };
}

function urlWith(update: (params: URLSearchParams) => void) {
  const params = new URLSearchParams(window.location.search);
  update(params);
  const query = params.toString();
  return `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
}

/**
 * Only this page's own key is passed. Next.js copies its internal router state
 * onto the entry itself; spreading `history.state` would copy its `__NA` marker,
 * which makes Next.js treat the call as internal and skip the `useSearchParams` sync.
 */
function stateWith(pushed: PushedEntries) {
  return { [stateKey]: pushed };
}

export function usePhotoTourUrl(photoCount: number) {
  const searchParams = useSearchParams();
  const rawPhoto = Number(searchParams.get(photoParam));
  const photoIndex =
    Number.isInteger(rawPhoto) && rawPhoto >= 1 && rawPhoto <= photoCount ? rawPhoto - 1 : null;
  const tourOpen = photoCount > 0 && (searchParams.get(tourParam) === "1" || photoIndex !== null);

  const openTour = useCallback(() => {
    window.history.pushState(
      stateWith({ photo: false, tour: true }),
      "",
      urlWith((params) => params.set(tourParam, "1")),
    );
  }, []);

  const openPhoto = useCallback((index: number) => {
    window.history.pushState(
      stateWith({ photo: true, tour: readPushed().tour }),
      "",
      urlWith((params) => {
        params.set(tourParam, "1");
        params.set(photoParam, String(index + 1));
      }),
    );
  }, []);

  const showPhoto = useCallback((index: number) => {
    window.history.replaceState(
      stateWith(readPushed()),
      "",
      urlWith((params) => params.set(photoParam, String(index + 1))),
    );
  }, []);

  const closePhoto = useCallback(() => {
    if (readPushed().photo) {
      window.history.back();
      return;
    }
    // Deep link straight onto a photo: drop the photo but keep the tour open.
    window.history.replaceState(
      stateWith(readPushed()),
      "",
      urlWith((params) => {
        params.set(tourParam, "1");
        params.delete(photoParam);
      }),
    );
  }, []);

  const closeTour = useCallback(() => {
    const pushed = readPushed();
    if (pushed.tour) {
      window.history.go(pushed.photo ? -2 : -1);
      return;
    }
    // The tour came from a deep link, so there is no page entry to step back to.
    window.history.replaceState(
      stateWith({ photo: false, tour: false }),
      "",
      urlWith((params) => {
        params.delete(tourParam);
        params.delete(photoParam);
      }),
    );
  }, []);

  return { closePhoto, closeTour, openPhoto, openTour, photoIndex, showPhoto, tourOpen };
}
