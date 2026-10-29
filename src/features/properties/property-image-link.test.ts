import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { isPublicImageAddress, validateImageLink } from "./property-image-link.ts";

const requirePackage = createRequire(import.meta.url);
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
type Reply = { status?: number; headers?: Record<string, string>; chunks?: Buffer[]; addresses?: string[]; fail?: boolean };

// Exercise the real downloader offline, including its socket lookup callback.
function downloader(replies: Reply[]) {
  const requested: string[] = [];
  const pinned: string[] = [];
  const exports: Record<string, (url: string) => Promise<{ bytes: Buffer }>> = {};
  let current: Reply;
  const source = ts.transpileModule(readFileSync(new URL("./property-image-link.ts", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  runInNewContext(source, {
    exports, Buffer, URL, AbortSignal,
    require(name: string) {
      if (name === "node:dns") return { lookup: (_host: string, _options: unknown, callback: (error: null, addresses: { address: string; family: number }[]) => void) => callback(null, (current.addresses ?? ["93.184.216.34"]).map((address) => ({ address, family: 4 }))) };
      if (name === "node:https") return {
        request(url: URL, options: { signal: AbortSignal; lookup: (host: string, options: object, callback: (error: Error | null, address: string) => void) => void }, onResponse: (response: EventEmitter) => void) {
          requested.push(url.href);
          current = replies.shift() ?? {};
          const reply = current;
          const req = new EventEmitter() as EventEmitter & { end: () => void };
          req.end = () => queueMicrotask(() => {
            assert.ok(options.signal instanceof AbortSignal);
            options.lookup(url.hostname, { all: false }, (error, address) => {
              if (error || reply.fail) { req.emit("error", error ?? new Error("timeout")); return; }
              pinned.push(address);
              let destroyed = false;
              const response = Object.assign(new EventEmitter(), {
                statusCode: reply.status ?? 200,
                headers: reply.headers ?? { "content-type": "image/jpeg" },
                destroy() { destroyed = true; },
              });
              onResponse(response);
              if (destroyed) return;
              for (const chunk of reply.chunks ?? [jpeg]) {
                response.emit("data", chunk);
                if (destroyed) return;
              }
              response.emit("end");
            });
          });
          return req;
        },
      };
      return requirePackage(name);
    },
  });
  return { fetch: exports.fetchPropertyImageLink, requested, pinned };
}

test("URL and IP checks reject local, encoded, private and transition addresses", () => {
  for (const address of ["0.0.0.0", "10.0.1.2", "127.0.0.1", "100.100.100.200", "169.254.169.254", "172.31.1.1", "192.168.1.1", "198.18.0.1", "224.1.1.1", "::", "::1", "fc00::1", "fe80::1", "::ffff:127.0.0.1", "2002:7f00:1::1", "2001:db8::1"]) {
    assert.equal(isPublicImageAddress(address), false, address);
  }
  for (const url of ["not a URL", "http://example.com/photo.jpg", "https://localhost/a", "https://app.internal/a", "https://2130706433/a", "https://0x7f000001/a", "https://[::ffff:127.0.0.1]/a", "https://user:pass@example.com/a", "https://example.com:8443/a"]) {
    assert.throws(() => validateImageLink(url), /Invalid link/);
  }
  assert.equal(isPublicImageAddress("8.8.8.8"), true);
  assert.equal(isPublicImageAddress("2606:4700:4700::1111"), true);
});

test("valid image fetch pins a checked public DNS result and returns original bytes", async () => {
  const h = downloader([{}]);
  const result = await h.fetch("https://images.example.com/a.jpg");
  assert.deepEqual(result.bytes, jpeg);
  assert.deepEqual(h.pinned, ["93.184.216.34"]);
});

test("mixed public/private DNS answers are rejected before a connection", async () => {
  const h = downloader([{ addresses: ["93.184.216.34", "10.0.0.1"] }]);
  await assert.rejects(h.fetch("https://images.example.com/a.jpg"), /private network/);
  assert.equal(h.pinned.length, 0);
});

test("redirects recheck URL and DNS, including private destinations and HTTPS downgrade", async () => {
  for (const location of ["https://127.0.0.1/a", "http://example.com/a"]) {
    const h = downloader([{ status: 302, headers: { location } }]);
    await assert.rejects(h.fetch("https://images.example.com/a.jpg"), /Invalid link/);
    assert.equal(h.requested.length, 1);
  }
  const h = downloader([{ status: 302, headers: { location: "https://other.example.com/a" } }, { addresses: ["192.168.1.2"] }]);
  await assert.rejects(h.fetch("https://images.example.com/a.jpg"), /private network/);
  assert.equal(h.pinned.length, 1);
});

test("rejects non-image content, spoofed MIME, and oversized declared or streamed bodies", async () => {
  for (const [reply, expected] of [
    [{ headers: { "content-type": "text/html" } }, /Not an image/],
    [{ chunks: [Buffer.from("<html>not an image</html>")] }, /Not an image/],
    [{ headers: { "content-type": "image/jpeg", "content-length": String(10 * 1024 * 1024 + 1) } }, /too large/],
    [{ chunks: [Buffer.alloc(6 * 1024 * 1024), Buffer.alloc(5 * 1024 * 1024)] }, /too large/],
    [{ fail: true }, /Fetch failed/],
  ] as [Reply, RegExp][]) {
    await assert.rejects(downloader([reply]).fetch("https://images.example.com/a.jpg"), expected);
  }
});
