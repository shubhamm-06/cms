import assert from "node:assert/strict";
import { test } from "node:test";
import {
  areaFallbackEmbedUrl,
  chooseMapEmbed,
  classifyMapInput,
  extractIframeSrc,
  extractMapCoordinates,
  isAllowedMapHost,
  resolveMapEmbedUrl,
  resolveMapUrlForSave,
  MAP_LOCATION_WARNING,
  safeHttpUrl,
  trimUrlForLog,
  type MapResolveLogEntry,
} from "./maps.ts";

const quiet = () => undefined;

/** A resolver log that keeps its entries, so a test can assert why a lookup failed. */
function capture() {
  const entries: MapResolveLogEntry[] = [];
  return { entries, log: (entry: MapResolveLogEntry) => void entries.push(entry) };
}

const embed = (ll: string) => `https://www.google.com/maps?ll=${ll}&z=15&output=embed`;

function coordsOf(url: string) {
  return extractMapCoordinates(new URL(url));
}

test("long place URL with @lat,lng", () => {
  const url = "https://www.google.com/maps/place/Varca+Beach/@15.2995,73.9442,15z/data=!4m6";
  assert.deepEqual(coordsOf(url), { lat: 15.2995, lng: 73.9442 });
  assert.deepEqual(classifyMapInput(url), { kind: "embed", url: embed("15.2995,73.9442") });
});

test("place data !3d!4d wins over the @ viewport centre", () => {
  const url = "https://www.google.com/maps/place/Villa/@15.5,73.5,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d15.2812!4d73.9201";
  assert.deepEqual(coordsOf(url), { lat: 15.2812, lng: 73.9201 });
});

test("?q=lat,lng, ?ll=, ?query= and a URL-encoded comma", () => {
  assert.deepEqual(coordsOf("https://www.google.com/maps?q=15.2995,73.9442"), { lat: 15.2995, lng: 73.9442 });
  assert.deepEqual(coordsOf("https://maps.google.com/maps?ll=15.3,73.94&z=12"), { lat: 15.3, lng: 73.94 });
  assert.deepEqual(coordsOf("https://www.google.com/maps/search/?api=1&query=15.29%2C73.94"), { lat: 15.29, lng: 73.94 });
  assert.deepEqual(coordsOf("https://www.google.com/maps?q=-33.86,151.21"), { lat: -33.86, lng: 151.21 });
});

test("a text query or a place link with no coordinates cannot be embedded", () => {
  assert.equal(classifyMapInput("https://www.google.com/maps?q=Varca+Beach+Goa"), null);
  assert.equal(classifyMapInput("https://www.google.com/maps/place/Varca+Beach"), null);
});

test("out-of-range and zero coordinates are rejected", () => {
  assert.equal(coordsOf("https://www.google.com/maps?q=95.0,73.0"), null);
  assert.equal(coordsOf("https://www.google.com/maps?q=15.0,200.0"), null);
  assert.equal(coordsOf("https://www.google.com/maps?q=0,0"), null);
});

test("the embed URL is pinless (ll, not q), zoom 15 and keeps full precision", () => {
  const result = classifyMapInput("https://www.google.com/maps?q=15.299512,73.944288");
  assert.deepEqual(result, { kind: "embed", url: embed("15.299512,73.944288") });
  assert.ok(result && result.kind === "embed" && !result.url.includes("q="));
});

test("a pasted iframe code: src is extracted and its coordinates read from pb", () => {
  const code = `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3846.7!2d73.9442!3d15.2995!2m3!1f0" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`;
  assert.equal(extractIframeSrc(code), "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3846.7!2d73.9442!3d15.2995!2m3!1f0");
  assert.deepEqual(classifyMapInput(code), { kind: "embed", url: embed("15.2995,73.9442") });
});

test("iframe code with single quotes and &amp; in the src", () => {
  const code = "<iframe src='https://maps.google.com/maps?q=15.2995,73.9442&amp;z=17&amp;output=embed'></iframe>";
  assert.equal(extractIframeSrc(code), "https://maps.google.com/maps?q=15.2995,73.9442&z=17&output=embed");
  assert.deepEqual(classifyMapInput(code), { kind: "embed", url: embed("15.2995,73.9442") });
});

test("an /maps/embed URL with no readable coordinates is used as given", () => {
  const url = "https://www.google.com/maps/embed?pb=!1m1!1sopaque";
  assert.deepEqual(classifyMapInput(url), { kind: "embed", url });
});

test("an iframe pointing at another host is rejected", () => {
  assert.equal(classifyMapInput('<iframe src="https://evil.example.com/maps/embed?pb=!2d73.9!3d15.2"></iframe>'), null);
});

test("only Google hosts are allowed", () => {
  assert.equal(isAllowedMapHost("www.google.com"), true);
  assert.equal(isAllowedMapHost("maps.google.com"), true);
  assert.equal(isAllowedMapHost("maps.app.goo.gl"), true);
  assert.equal(isAllowedMapHost("goo.gl"), true);
  assert.equal(isAllowedMapHost("google.com.evil.example"), false);
  assert.equal(isAllowedMapHost("notgoogle.com"), false);
  assert.equal(classifyMapInput("https://www.openstreetmap.org/#map=14/15.29/73.94"), null);
  assert.equal(classifyMapInput("https://evil.example.com/maps?q=15.29,73.94"), null);
});

test("empty, whitespace, non-URL and non-http values give null", () => {
  for (const value of [null, undefined, "", "   ", "not a url", "javascript:alert(1)", "ftp://maps.google.com/maps?q=15.2,73.9"]) {
    assert.equal(classifyMapInput(value), null, String(value));
  }
  assert.equal(safeHttpUrl("javascript:alert(1)"), null);
  assert.equal(safeHttpUrl(" https://maps.app.goo.gl/abc ")?.hostname, "maps.app.goo.gl");
});

test("short links are classified as needing a lookup", () => {
  assert.equal(classifyMapInput("https://maps.app.goo.gl/AbCd123")?.kind, "short");
  assert.equal(classifyMapInput("https://goo.gl/maps/AbCd123")?.kind, "short");
  assert.equal(classifyMapInput("https://goo.gl/something-else"), null);
});

// ---- short-link resolution, with a mocked fetch ---------------------------------------

type FakeResponse = { location?: string; status: number };

function fakeFetch(chain: Record<string, FakeResponse>, seen: string[] = []) {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    seen.push(url);
    assert.equal(init?.redirect, "manual", "redirects must be followed by hand so each host is checked");
    const step = chain[url];
    if (!step) throw new Error(`unexpected fetch ${url}`);
    const headers = new Headers(step.location ? { location: step.location } : {});
    return new Response(null, { headers, status: step.status });
  }) as typeof fetch;
}

test("a short link follows the redirect and reads the coordinates", async () => {
  const seen: string[] = [];
  const result = await resolveMapEmbedUrl("https://maps.app.goo.gl/AbCd123", {
    log: quiet, fetchImpl: fakeFetch({ "https://maps.app.goo.gl/AbCd123": { location: "https://www.google.com/maps/place/Villa/@15.2995,73.9442,17z/data=!3d15.2995!4d73.9442", status: 302 } }, seen),
  });
  assert.equal(result, embed("15.2995,73.9442"));
  assert.deepEqual(seen, ["https://maps.app.goo.gl/AbCd123"]);
});

test("a multi-hop redirect and Google's consent interstitial are followed", async () => {
  const consent = `https://consent.google.com/ml?continue=${encodeURIComponent("https://www.google.com/maps?q=15.29,73.94")}&gl=DE`;
  const result = await resolveMapEmbedUrl("https://goo.gl/maps/AbCd123", {
    log: quiet, fetchImpl: fakeFetch({
      "https://goo.gl/maps/AbCd123": { location: "https://maps.app.goo.gl/Xyz", status: 301 },
      "https://maps.app.goo.gl/Xyz": { location: consent, status: 302 },
    }),
  });
  assert.equal(result, embed("15.29,73.94"));
});

test("a redirect to a non-Google host is never followed", async () => {
  const seen: string[] = [];
  const result = await resolveMapEmbedUrl("https://maps.app.goo.gl/AbCd123", {
    log: quiet, fetchImpl: fakeFetch({ "https://maps.app.goo.gl/AbCd123": { location: "https://evil.example.com/steal", status: 302 } }, seen),
  });
  assert.equal(result, null);
  assert.deepEqual(seen, ["https://maps.app.goo.gl/AbCd123"]);
});

test("a short link that redirects forever, or to a place with no coordinates, gives null", async () => {
  const loop = await resolveMapEmbedUrl("https://maps.app.goo.gl/loop", {
    log: quiet, fetchImpl: fakeFetch({ "https://maps.app.goo.gl/loop": { location: "https://maps.app.goo.gl/loop", status: 302 } }),
  });
  assert.equal(loop, null);
  const noCoords = await resolveMapEmbedUrl("https://maps.app.goo.gl/none", {
    log: quiet, fetchImpl: fakeFetch({
      "https://maps.app.goo.gl/none": { location: "https://www.google.com/maps/place/Varca+Beach", status: 302 },
      "https://www.google.com/maps/place/Varca+Beach": { status: 200 },
    }),
  });
  assert.equal(noCoords, null);
});

test("a non-redirect answer, a network error and a hung request all give null without throwing", async () => {
  assert.equal(await resolveMapEmbedUrl("https://maps.app.goo.gl/a", { log: quiet, fetchImpl: fakeFetch({ "https://maps.app.goo.gl/a": { status: 404 } }) }), null);
  const failing = (async () => {
    throw new Error("network down");
  }) as typeof fetch;
  assert.equal(await resolveMapEmbedUrl("https://maps.app.goo.gl/a", { log: quiet, fetchImpl: failing }), null);

  const hung = ((_: string | URL | Request, init?: RequestInit) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
    })) as typeof fetch;
  const started = Date.now();
  assert.equal(await resolveMapEmbedUrl("https://maps.app.goo.gl/a", { log: quiet, fetchImpl: hung, timeoutMs: 80 }), null);
  assert.ok(Date.now() - started < 1000, "the timeout releases a hung lookup");
});

test("non-short inputs never touch the network", async () => {
  const neverCalled = (async () => {
    throw new Error("fetch must not be called");
  }) as typeof fetch;
  assert.equal(await resolveMapEmbedUrl("https://www.google.com/maps?q=15.29,73.94", { log: quiet, fetchImpl: neverCalled }), embed("15.29,73.94"));
  assert.equal(await resolveMapEmbedUrl("https://evil.example.com/x", { log: quiet, fetchImpl: neverCalled }), null);
  assert.equal(await resolveMapEmbedUrl("", { log: quiet, fetchImpl: neverCalled }), null);
});

// ---- logging: why a short link did or did not become coordinates ----------------------

test("a resolved short link logs its hops, trimmed final URL and outcome", async () => {
  const { entries, log } = capture();
  const long = "https://www.google.com/maps/place/Villa/@15.2995,73.9442,17z/data=" + "!4m6".repeat(60) + "?entry=ttu&g_ep=abc";
  await resolveMapEmbedUrl("https://maps.app.goo.gl/AbCd123?g_st=ic", {
    fetchImpl: fakeFetch({ "https://maps.app.goo.gl/AbCd123?g_st=ic": { location: long, status: 302 } }),
    log,
  });
  assert.equal(entries.length, 1);
  assert.equal(entries[0].outcome, "resolved");
  assert.deepEqual(entries[0].hops, ["302 maps.app.goo.gl", "-> www.google.com"]);
  assert.equal(entries[0].input, "https://maps.app.goo.gl/AbCd123?…");
  assert.ok(entries[0].final && !entries[0].final.includes("entry=ttu") && entries[0].final.length < 140, entries[0].final ?? "");
});

test("trimUrlForLog cuts the query string and long paths", () => {
  assert.equal(trimUrlForLog("https://www.google.com/maps?q=15.29,73.94&z=14"), "https://www.google.com/maps?…");
  assert.ok(trimUrlForLog("https://www.google.com/" + "a".repeat(300)).length < 130);
});

function networkError(code: string, message: string) {
  return (async () => {
    throw Object.assign(new TypeError("fetch failed"), { cause: Object.assign(new Error(message), { code }) });
  }) as typeof fetch;
}

test("a DNS error is logged as a dns-failure and never throws", async () => {
  const { entries, log } = capture();
  assert.equal(await resolveMapEmbedUrl("https://maps.app.goo.gl/AbCd123", { fetchImpl: networkError("ENOTFOUND", "getaddrinfo ENOTFOUND maps.app.goo.gl"), log }), null);
  assert.equal(entries[0].outcome, "dns-failure");
  assert.equal(entries[0].detail, "ENOTFOUND");
});

test("a refused connection is a network failure and a hung one is a timeout", async () => {
  const a = capture();
  assert.equal(await resolveMapEmbedUrl("https://maps.app.goo.gl/x", { fetchImpl: networkError("ECONNREFUSED", "connect ECONNREFUSED"), log: a.log }), null);
  assert.equal(a.entries[0].outcome, "network-error");
  assert.equal(a.entries[0].detail, "ECONNREFUSED");

  const hung = ((_: string | URL | Request, init?: RequestInit) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
    })) as typeof fetch;
  const b = capture();
  assert.equal(await resolveMapEmbedUrl("https://maps.app.goo.gl/x", { fetchImpl: hung, log: b.log, timeoutMs: 60 }), null);
  assert.equal(b.entries[0].outcome, "timeout");
});

test("non-google redirects, missing redirects and place pages without coordinates log their reason", async () => {
  const away = capture();
  await resolveMapEmbedUrl("https://maps.app.goo.gl/a", { fetchImpl: fakeFetch({ "https://maps.app.goo.gl/a": { location: "https://evil.example.com/x", status: 302 } }), log: away.log });
  assert.equal(away.entries[0].outcome, "non-google-host");
  assert.equal(away.entries[0].detail, "evil.example.com");

  const none = capture();
  await resolveMapEmbedUrl("https://maps.app.goo.gl/b", { fetchImpl: fakeFetch({ "https://maps.app.goo.gl/b": { status: 200 } }), log: none.log });
  assert.equal(none.entries[0].outcome, "no-redirect");

  const noCoords = capture();
  await resolveMapEmbedUrl("https://maps.app.goo.gl/c", {
    fetchImpl: fakeFetch({
      "https://maps.app.goo.gl/c": { location: "https://www.google.com/maps/place/Varca+Beach", status: 302 },
      "https://www.google.com/maps/place/Varca+Beach": { status: 200 },
    }),
    log: noCoords.log,
  });
  assert.equal(noCoords.entries[0].outcome, "no-coordinates");
  assert.deepEqual(noCoords.entries[0].hops, ["302 maps.app.goo.gl", "200 www.google.com"]);
});

// ---- the fallback order: coordinates, then area text, then placeholder -------------------

test("coordinates win over the area text", () => {
  const choice = chooseMapEmbed({ areaText: "Varca, South Goa", coordinateEmbedUrl: embed("15.30,73.94") });
  assert.deepEqual(choice, { source: "coordinates", url: embed("15.30,73.94") });
});

test("with no coordinates the area text builds the embed", () => {
  const choice = chooseMapEmbed({ areaText: "Varca, South Goa", coordinateEmbedUrl: null });
  assert.deepEqual(choice, { source: "area-text", url: "https://www.google.com/maps?q=Varca%2C%20South%20Goa&z=13&output=embed" });
});

test("with neither, the placeholder is chosen", () => {
  for (const areaText of [null, undefined, "", "   "]) {
    assert.deepEqual(chooseMapEmbed({ areaText, coordinateEmbedUrl: null }), { source: "placeholder", url: null });
  }
});

test("the area text is encoded and tidied, and is the only input to the fallback URL", () => {
  assert.equal(areaFallbackEmbedUrl("  Anjuna   &  Vagator, North Goa "), "https://www.google.com/maps?q=Anjuna%20%26%20Vagator%2C%20North%20Goa&z=13&output=embed");
  // The builder takes the area text alone, so a house name or street inside a saved link cannot leak into it.
  assert.equal(areaFallbackEmbedUrl.length, 1);
});

test("a failed short-link lookup (DNS) falls back to the area text", async () => {
  const coordinateEmbedUrl = await resolveMapEmbedUrl("https://maps.app.goo.gl/AbCd123", { fetchImpl: networkError("ENOTFOUND", "ENOTFOUND"), log: quiet });
  assert.equal(coordinateEmbedUrl, null);
  assert.equal(chooseMapEmbed({ areaText: "Varca, South Goa", coordinateEmbedUrl }).source, "area-text");
});

test("save-time resolution returns the long coordinate URL for storage", async () => {
  const short = "https://maps.app.goo.gl/AbCd123";
  const long = "https://www.google.com/maps/place/Villa/@15.299512,73.944288,17z";
  const saved = await resolveMapUrlForSave(short, { log: quiet, fetchImpl: fakeFetch({ [short]: { location: long, status: 302 } }) });
  assert.deepEqual(saved, { url: long, warning: null });
  assert.equal(await resolveMapEmbedUrl(saved.url), embed("15.299512,73.944288"));
});

test("save-time DNS failure preserves the short link and returns the admin warning", async () => {
  const short = "https://maps.app.goo.gl/AbCd123";
  const saved = await resolveMapUrlForSave(short, { log: quiet, fetchImpl: networkError("ENOTFOUND", "DNS failure") });
  assert.deepEqual(saved, { url: short, warning: MAP_LOCATION_WARNING });
});

test("save-time resolution without coordinates preserves the short link with a warning", async () => {
  const short = "https://goo.gl/maps/AbCd123";
  const saved = await resolveMapUrlForSave(short, { log: quiet, fetchImpl: fakeFetch({ [short]: { status: 200 } }) });
  assert.deepEqual(saved, { url: short, warning: MAP_LOCATION_WARNING });
});

test("saving a full URL never needs network resolution", async () => {
  const long = "https://www.google.com/maps/@15.299512,73.944288,17z";
  const fetchImpl = (async () => { throw new Error("Must not fetch"); }) as typeof fetch;
  assert.deepEqual(await resolveMapUrlForSave(long, { fetchImpl }), { url: long, warning: null });
});
