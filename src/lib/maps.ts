/**
 * Turns the Google Maps value saved on a property into a keyless, pinless,
 * privacy-safe embed URL for the public "Where you'll be" map.
 *
 * Owners paste several kinds of value, all handled here:
 * - a long link with coordinates: `.../@15.29,73.94,17z`, `...!3d15.29!4d73.94`,
 *   `?q=lat,lng`, `?ll=lat,lng`, `?center=`, `?query=`;
 * - a short link (`maps.app.goo.gl/...`, `goo.gl/maps/...`), which has to be followed
 *   on the server to learn where it points (`resolveMapEmbedUrl`);
 * - an `<iframe>` embed code or an `/maps/embed` URL, from which the coordinates are
 *   read (the `pb` parameter carries them as `!2dLNG!3dLAT`).
 *
 * Share links cannot be framed (Google sends X-Frame-Options), so the output is always
 * `https://www.google.com/maps?ll=<lat>,<lng>&z=15&output=embed`. It deliberately uses
 * `ll=` rather than `q=`: `q=` drops a pin on the exact spot, `ll=` only centres the map.
 * Coordinates retain their source precision so the area circle is centred correctly.
 *
 * Nothing here imports Next.js, so it is unit tested directly.
 */

/** Hosts whose links are read or followed. Subdomains (www.google.com) are accepted. */
const ALLOWED_HOSTS = ["google.com", "maps.google.com", "goo.gl", "maps.app.goo.gl"];

const EMBED_ZOOM = 15;
const DEFAULT_TIMEOUT_MS = 5000;
const MAX_REDIRECT_HOPS = 5;

export type MapCoordinates = { lat: number; lng: number };

export function isAllowedMapHost(hostname: string) {
  const host = hostname.toLowerCase();
  return ALLOWED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

/** Only http(s) links are ever used as an `href` or fetched. */
export function safeHttpUrl(value: string | null | undefined) {
  const text = value?.trim();
  if (!text) return null;

  try {
    const url = new URL(text);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

/** The `src` of a pasted `<iframe ...>` snippet, or null when the text is not one. */
export function extractIframeSrc(text: string | null | undefined) {
  const match = /<iframe\b[^>]*?\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(text ?? "");
  const src = match?.[1] ?? match?.[2];
  return src ? src.replace(/&amp;/gi, "&").trim() : null;
}

function validCoordinates(lat: number, lng: number): MapCoordinates | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  if (lat === 0 && lng === 0) return null;
  return { lat, lng };
}

const decimal = "(-?\\d{1,3}(?:\\.\\d+)?)";
const coordinatePair = new RegExp(`^\\s*${decimal}\\s*,\\s*${decimal}\\s*$`);

/** Coordinates from any supported Google Maps URL shape, or null. */
export function extractMapCoordinates(url: URL): MapCoordinates | null {
  let full = url.pathname + url.search + url.hash;
  try {
    full = decodeURIComponent(full);
  } catch {
    // A malformed escape in an unrelated URL segment must not break property saves.
  }

  // Place data carries the place's own coordinates; the "@" viewport centre can differ.
  const place = new RegExp(`!3d${decimal}!4d${decimal}`).exec(full);
  if (place) return validCoordinates(Number(place[1]), Number(place[2]));

  // Embed `pb` data lists longitude first: !2dLNG!3dLAT.
  const embed = new RegExp(`!2d${decimal}!3d${decimal}`).exec(full);
  if (embed) return validCoordinates(Number(embed[2]), Number(embed[1]));

  const viewport = new RegExp(`/@${decimal},${decimal}`).exec(full);
  if (viewport) return validCoordinates(Number(viewport[1]), Number(viewport[2]));

  for (const key of ["q", "ll", "center", "query", "destination", "daddr"]) {
    const pair = coordinatePair.exec(url.searchParams.get(key) ?? "");
    if (pair) return validCoordinates(Number(pair[1]), Number(pair[2]));
  }

  return null;
}

/** The pinless embed URL for a point, without rounding the saved coordinates. */
export function buildMapEmbedUrl({ lat, lng }: MapCoordinates) {
  return `https://www.google.com/maps?ll=${lat},${lng}&z=${EMBED_ZOOM}&output=embed`;
}

function isShortLink(url: URL) {
  const host = url.hostname.toLowerCase();
  return host === "maps.app.goo.gl" || (host === "goo.gl" && url.pathname.toLowerCase().startsWith("/maps"));
}

export type MapInput = { kind: "embed"; url: string } | { kind: "short"; url: URL };

/**
 * Classifies a saved value without any network access: an embed URL ready to use, a
 * short link that still needs following, or null when it cannot be embedded (not a URL,
 * not an allowed host, or a Google link with no coordinates).
 */
export function classifyMapInput(input: string | null | undefined): MapInput | null {
  const raw = input?.trim();
  if (!raw) return null;

  const url = safeHttpUrl(extractIframeSrc(raw) ?? raw);
  if (!url || !isAllowedMapHost(url.hostname)) return null;

  if (isShortLink(url)) return { kind: "short", url };

  const coordinates = extractMapCoordinates(url);
  if (coordinates) return { kind: "embed", url: buildMapEmbedUrl(coordinates) };

  // An embed URL with no readable coordinates: use it as Google built it. It may show a
  // pin, but it is the owner's own embed and it cannot be altered.
  if (url.pathname.startsWith("/maps/embed") && url.hostname.toLowerCase().endsWith("google.com")) {
    return { kind: "embed", url: url.toString() };
  }

  return null;
}

/** The URL a redirect points to, unwrapping Google's consent interstitial. */
function nextRedirectUrl(current: URL, location: string) {
  let next: URL;
  try {
    next = new URL(location, current);
  } catch {
    return null;
  }

  if (next.hostname.toLowerCase().startsWith("consent.")) {
    const target = safeHttpUrl(next.searchParams.get("continue"));
    if (!target) return null;
    next = target;
  }

  return safeHttpUrl(next.toString()) && !next.username && !next.password && isAllowedMapHost(next.hostname) ? next : null;
}

/** Why a short link did not become coordinates. The first three are transient (network). */
export type MapResolveOutcome =
  | "resolved"
  | "dns-failure"
  | "timeout"
  | "network-error"
  | "non-google-host"
  | "no-redirect"
  | "too-many-hops"
  | "no-coordinates";

export type MapResolveLogEntry = {
  /** Host and status of each hop, for example "302 maps.app.goo.gl". */
  hops: string[];
  input: string;
  outcome: MapResolveOutcome;
  /** The last URL reached, with its query string cut. */
  final: string | null;
  /** Error code or message behind a network failure. */
  detail?: string;
};

export type MapResolveOptions = {
  fetchImpl?: typeof fetch;
  /** Receives one entry per short-link attempt. Defaults to `console.warn`. */
  log?: (entry: MapResolveLogEntry) => void;
  timeoutMs?: number;
};

/** A URL for logs: host and path only, long paths and the query string cut. */
export function trimUrlForLog(url: URL | string) {
  try {
    const parsed = typeof url === "string" ? new URL(url) : url;
    const path = parsed.pathname.length > 80 ? `${parsed.pathname.slice(0, 80)}…` : parsed.pathname;
    return `${parsed.protocol}//${parsed.hostname}${path}${parsed.search ? "?…" : ""}`;
  } catch {
    return String(url).slice(0, 80);
  }
}

function defaultLog(entry: MapResolveLogEntry) {
  // One string, not an object: some dev loggers print objects as {}.
  console.warn(`[property map] short link lookup ${JSON.stringify(entry)}`);
}

const DNS_CODES = new Set(["ENOTFOUND", "EAI_AGAIN", "ENODATA", "EAI_NODATA"]);

/** DNS and other network failures from `fetch`, which wraps the real error in `cause`. */
function classifyFetchError(error: unknown, aborted: boolean): { detail: string; outcome: MapResolveOutcome } {
  if (aborted) return { detail: "no answer within the timeout", outcome: "timeout" };

  const cause = (typeof error === "object" && error && "cause" in error ? error.cause : null) as { code?: string; message?: string } | null;
  const code = cause?.code ?? (typeof error === "object" && error && "code" in error ? String(error.code) : undefined);
  const detail = code ?? cause?.message ?? (error instanceof Error ? error.message : String(error));

  if (code && DNS_CODES.has(code)) return { detail, outcome: "dns-failure" };
  if (error instanceof Error && error.name === "AbortError") return { detail: "aborted", outcome: "timeout" };
  return { detail, outcome: "network-error" };
}

/**
 * Follows a short link on the server, one redirect at a time, to read the coordinates
 * from where it leads. Every hop must stay on an allowed host (so a link cannot send the
 * server elsewhere), the whole lookup is capped by a timeout, and failures yield no resolved URLs.
 * It never throws.
 */
async function followShortLink(
  start: URL,
  { fetchImpl = fetch, log = defaultLog, timeoutMs = DEFAULT_TIMEOUT_MS }: MapResolveOptions,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const hops: string[] = [];
  let final: URL | null = start;
  let outcome: MapResolveOutcome = "no-redirect";
  let detail: string | undefined;
  let embedUrl: string | null = null;
  let resolvedUrl: string | null = null;

  try {
    let current = start;
    outcome = "too-many-hops";
    for (let hop = 0; hop < MAX_REDIRECT_HOPS; hop += 1) {
      const response = await fetchImpl(current.toString(), {
        headers: { "accept-language": "en", "user-agent": "Mozilla/5.0 (compatible; CurateMyStay/1.0)" },
        redirect: "manual",
        signal: controller.signal,
      });
      await response.body?.cancel().catch(() => undefined);
      hops.push(`${response.status} ${current.hostname}`);

      const location = response.headers.get("location");
      if (response.status < 300 || response.status >= 400 || !location) {
        outcome = hops.length === 1 ? "no-redirect" : "no-coordinates";
        break;
      }

      const next = nextRedirectUrl(current, location);
      if (!next) {
        outcome = "non-google-host";
        detail = (() => {
          try {
            return new URL(location, current).hostname;
          } catch {
            return "unparseable redirect";
          }
        })();
        break;
      }

      final = next;
      const coordinates = extractMapCoordinates(next);
      if (coordinates) {
        hops.push(`-> ${next.hostname}`);
        embedUrl = buildMapEmbedUrl(coordinates);
        resolvedUrl = next.toString();
        outcome = "resolved";
        break;
      }
      current = next;
      outcome = "no-coordinates";
    }
  } catch (error) {
    ({ detail, outcome } = classifyFetchError(error, controller.signal.aborted));
    embedUrl = null;
  } finally {
    clearTimeout(timer);
  }

  log({ detail, final: final ? trimUrlForLog(final) : null, hops, input: trimUrlForLog(start), outcome });
  return { embedUrl, resolvedUrl };
}

export const MAP_LOCATION_WARNING = "Could not read the exact location from this short link. For an accurate map, open the link in your browser and paste the full URL from the address bar (it contains @latitude,longitude).";

/** Save a coordinate-bearing long URL when possible; a failed lookup never blocks saving. */
export async function resolveMapUrlForSave(input: string | null | undefined, options: MapResolveOptions = {}) {
  const url = input?.trim() || null;
  const classified = classifyMapInput(url);
  if (classified?.kind !== "short") return { url, warning: null };

  const { resolvedUrl } = await followShortLink(classified.url, options);
  return { url: resolvedUrl ?? url, warning: resolvedUrl ? null : MAP_LOCATION_WARNING };
}

/** Saved Google Maps value to an embed URL, or null when it cannot be embedded. Never throws. */
export async function resolveMapEmbedUrl(input: string | null | undefined, options: MapResolveOptions = {}) {
  const classified = classifyMapInput(input);
  if (!classified) return null;
  if (classified.kind === "embed") return classified.url;
  return (await followShortLink(classified.url, options)).embedUrl;
}

/** The area-text embed used when no coordinates can be found: the area only, never a house or street. */
export function areaFallbackEmbedUrl(areaText: string | null | undefined) {
  const text = areaText?.replace(/\s+/g, " ").trim();
  return text ? `https://www.google.com/maps?q=${encodeURIComponent(text)}&z=13&output=embed` : null;
}

export type MapEmbedChoice =
  | { source: "coordinates"; url: string }
  | { source: "area-text"; url: string }
  | { source: "placeholder"; url: null };

/**
 * The fallback order for the public map: coordinates from the saved value (a long link
 * read directly, or a short link followed on the server), else the area text, else the
 * placeholder card. The area text is the same text as the "Approximate area" pill; it is
 * never taken from the saved URL, so a house name or street in a link is not revealed.
 */
export function chooseMapEmbed({
  areaText,
  coordinateEmbedUrl,
}: {
  areaText: string | null | undefined;
  coordinateEmbedUrl: string | null;
}): MapEmbedChoice {
  if (coordinateEmbedUrl) return { source: "coordinates", url: coordinateEmbedUrl };

  const area = areaFallbackEmbedUrl(areaText);
  return area ? { source: "area-text", url: area } : { source: "placeholder", url: null };
}
