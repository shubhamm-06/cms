import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { getPublicShareUrl, sharePublicPage } from "./share-public-page.ts";

const data = { title: "Goa villa", text: "Goa villa", url: "https://www.curatemystay.net/property/villa" };

function browser(t: TestContext, secure = false, copy = false) {
  let legacyCopies = 0;
  let removed = false;
  const textarea = { value: "", readOnly: false, style: { cssText: "" }, setAttribute() {}, focus() {}, select() {}, setSelectionRange() {}, remove() { removed = true; } };
  const navigator: { share?: (value: ShareData) => Promise<void>; canShare?: (value: ShareData) => boolean; clipboard?: { writeText: (text: string) => Promise<void> } } = {};
  const globals = {
    window: { isSecureContext: secure, location: { href: "http://192.168.31.5:3000/property/villa?photos=1" } },
    navigator,
    HTMLElement: class {},
    document: { activeElement: null, body: { appendChild() {} }, createElement() { return textarea; }, execCommand(command: string) { assert.equal(command, "copy"); legacyCopies++; return copy; } },
  };
  for (const [key, value] of Object.entries(globals)) {
    const old = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => old ? Object.defineProperty(globalThis, key, old) : Reflect.deleteProperty(globalThis, key));
  }
  return { navigator, legacyCopies: () => legacyCopies, removed: () => removed };
}

test("native share is called synchronously within the click, before the promise is awaited", async (t) => {
  const environment = browser(t, true);
  let called = false;
  environment.navigator.canShare = () => true;
  environment.navigator.share = async (value) => { assert.deepEqual(value, data); called = true; };
  const result = sharePublicPage(data);
  assert.equal(called, true);
  assert.equal(await result, "shared");
});

test("cancelling native share does not copy or report a failure", async (t) => {
  const environment = browser(t, true);
  environment.navigator.share = async () => { throw new DOMException("cancelled", "AbortError"); };
  assert.equal(await sharePublicPage(data), "cancelled");
  assert.equal(environment.legacyCopies(), 0);
});

test("secure clipboard fallback copies the canonical URL", async (t) => {
  const environment = browser(t, true);
  let copied = "";
  environment.navigator.clipboard = { writeText: async (url) => { copied = url; } };
  assert.equal(await sharePublicPage(data), "copied");
  assert.equal(copied, data.url);
});

test("an insecure LAN context uses legacy copying even if clipboard is present", async (t) => {
  const environment = browser(t, false, true);
  environment.navigator.clipboard = { writeText: async () => { assert.fail("Insecure clipboard must not be used"); } };
  assert.equal(await sharePublicPage(data), "copied");
  assert.equal(environment.legacyCopies(), 1);
  assert.equal(environment.removed(), true);
});

test("failed copy exposes manual sharing instead of failing silently", async (t) => {
  const environment = browser(t);
  assert.equal(await sharePublicPage(data), "manual");
  assert.equal(environment.removed(), true);
});

test("canShare rejection falls through to copying", async (t) => {
  const environment = browser(t, false, true);
  environment.navigator.canShare = () => false;
  environment.navigator.share = async () => { assert.fail("Unsupported share must not be called"); };
  assert.equal(await sharePublicPage(data), "copied");
});

test("configured site origin wins over a LAN origin and tour parameters are removed", (t) => {
  browser(t);
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  t.after(() => { if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL; else process.env.NEXT_PUBLIC_SITE_URL = previous; });
  process.env.NEXT_PUBLIC_SITE_URL = "https://www.curatemystay.net";
  assert.equal(getPublicShareUrl("http://192.168.31.5:3000/property/villa?photos=1&photo=2#room"), data.url);
  delete process.env.NEXT_PUBLIC_SITE_URL;
  assert.equal(getPublicShareUrl(data.url), data.url);
});
