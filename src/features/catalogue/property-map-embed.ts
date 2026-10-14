import "server-only";

import { unstable_cache } from "next/cache";
import { chooseMapEmbed, classifyMapInput, resolveMapEmbedUrl, trimUrlForLog } from "@/src/lib/maps";

/**
 * Server-side choice of the map embed for a property's saved Google Maps value.
 *
 * Long links, embed codes and embed URLs are read with no network at all. Only a short
 * link (`maps.app.goo.gl`, `goo.gl/maps`) is followed, on the server and never in the
 * browser, with a 5 second cap (see `src/lib/maps.ts`). A successful lookup is stored in
 * the Next.js data cache for a week, so a short link is not re-resolved per request. A
 * failed lookup (DNS, network, timeout, no coordinates) throws inside the cached function,
 * which Next.js does not cache, and is remembered for one minute only: a dead link cannot
 * make every visit wait, and the map recovers by itself once Google can be reached.
 *
 * When no coordinates are found the map falls back to the area text, then to the
 * placeholder card (see `chooseMapEmbed`). This never throws.
 */

const CACHE_SECONDS = 60 * 60 * 24 * 7;
const FAILURE_MEMORY_MS = 60 * 1000;

const resolveAndCache = unstable_cache(
  async (value: string) => {
    const embedUrl = await resolveMapEmbedUrl(value);
    if (!embedUrl) throw new Error("map-embed-unresolved");
    return embedUrl;
  },
  ["property-map-embed-v2"],
  { revalidate: CACHE_SECONDS },
);

const recentFailures = new Map<string, number>();
const inFlight = new Map<string, Promise<string>>();

/** Coordinates from the saved value, or null. Long links need no network; short links are followed. */
async function getCoordinateEmbedUrl(savedValue: string | null | undefined) {
  const value = savedValue?.trim();
  const classified = classifyMapInput(value);
  if (value && !classified) {
    console.warn("[property map] saved value is not an embeddable Google Maps link", { input: trimUrlForLog(value) });
  }
  if (!value || !classified) return null;
  if (classified.kind === "embed") return classified.url;

  const failedAt = recentFailures.get(value);
  if (failedAt && Date.now() - failedAt < FAILURE_MEMORY_MS) return null;

  // Visitors arriving while a lookup is running share it instead of each waiting out their own.
  let lookup = inFlight.get(value);
  if (!lookup) {
    lookup = resolveAndCache(value).finally(() => inFlight.delete(value));
    inFlight.set(value, lookup);
  }

  try {
    return await lookup;
  } catch {
    // The resolver has already logged why (DNS, timeout, no coordinates...).
    recentFailures.set(value, Date.now());
    return null;
  }
}

export async function getPropertyMapEmbed(savedValue: string | null | undefined, areaText: string | null | undefined) {
  const choice = chooseMapEmbed({ areaText, coordinateEmbedUrl: await getCoordinateEmbedUrl(savedValue) });
  if (choice.source !== "coordinates") {
    console.warn("[property map] no coordinates for the saved value, using:", choice.source);
  }
  return choice;
}
