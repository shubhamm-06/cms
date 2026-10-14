export function getPublicShareUrl(url: string) {
  let property = new URL(url, window.location.href);
  // The server already passes the canonical property URL; configuration can override its origin.
  const configuredSite = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredSite) {
    try {
      const site = new URL(configuredSite);
      if (site.protocol === "https:" || site.protocol === "http:") property = new URL(property.pathname, site.origin);
    } catch {
      console.error("Public sharing site URL is invalid; using the property's canonical URL.");
    }
  }
  property.search = "";
  property.hash = "";
  return property.toString();
}

function copyWithTextarea(url: string) {
  const previousFocus = document.activeElement;
  const textarea = document.createElement("textarea");
  textarea.value = url;
  textarea.readOnly = true;
  textarea.setAttribute("aria-label", "Share link");
  textarea.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;";
  // Keep it inside the current Radix focus scope when sharing from the photo tour.
  const container = previousFocus?.closest('[role="dialog"]') ?? document.body;
  container.appendChild(textarea);
  try {
    textarea.focus({ preventScroll: true });
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    return document.execCommand("copy");
  } finally {
    textarea.remove();
    if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
  }
}

/** Invoke directly from the click: Web Share runs before any asynchronous work. */
export async function sharePublicPage(data: ShareData): Promise<"shared" | "copied" | "cancelled" | "manual"> {
  if (typeof navigator.share === "function") {
    try {
      if (!navigator.canShare || navigator.canShare(data)) {
        await navigator.share(data);
        return "shared";
      }
    } catch (error) {
      if (typeof error === "object" && error && "name" in error && error.name === "AbortError") return "cancelled";
      console.error("Public page sharing failed", error);
    }
  }

  if (window.isSecureContext && typeof navigator.clipboard?.writeText === "function") {
    try {
      await navigator.clipboard.writeText(data.url || "");
      return "copied";
    } catch (error) {
      console.error("Public share clipboard copy failed", error);
    }
  }
  try {
    if (copyWithTextarea(data.url || "")) return "copied";
  } catch (error) {
    console.error("Public share fallback copy failed", error);
  }
  return "manual";
}
