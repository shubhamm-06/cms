/**
 * An HTTPS Airbnb listing link, for example https://www.airbnb.co.in/rooms/12345678.
 * Any Airbnb country domain is accepted; the path must be a listing (`/rooms/...`).
 * Dependency-free so server validators, client components and node tests share it.
 */
export function isAirbnbListingUrl(value: string | null | undefined) {
  try {
    const url = new URL(value?.trim() ?? "");
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      /^(?:[a-z]+\.)?airbnb\.(?:[a-z]{2,3}|co\.[a-z]{2}|com\.[a-z]{2})$/i.test(url.hostname) &&
      /^\/rooms\/(plus\/)?\d+/.test(url.pathname)
    );
  } catch {
    return false;
  }
}
