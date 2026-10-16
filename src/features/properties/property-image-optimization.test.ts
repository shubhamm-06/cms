import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { optimizePropertyImage } from "./property-image-optimization.ts";

const KB = 1024;

function browser(t: TestContext, width = 1800, height = 1200, sizes = [600 * KB]) {
  const qualities: number[] = [];
  const draws: unknown[][] = [];
  let closed = 0;
  let failDecode = false;
  let outputType = "image/webp";
  class Bitmap {
    width = width;
    height = height;
    close() { closed++; }
  }
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage: (...args: unknown[]) => draws.push(args) }),
    toBlob(callback: (blob: Blob | null) => void, type: string, quality: number) {
      assert.equal(type, "image/webp");
      const size = sizes[Math.min(qualities.length, sizes.length - 1)];
      qualities.push(quality);
      callback(size === 0 ? null : new Blob([new Uint8Array(size)], { type: outputType }));
    },
  };
  const globals = {
    window: { createImageBitmap: true },
    createImageBitmap: async () => {
      if (failDecode) throw new Error("Cannot decode");
      return new Bitmap();
    },
    ImageBitmap: Bitmap,
    document: { createElement: () => canvas },
  };
  for (const [key, value] of Object.entries(globals)) {
    const old = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => old ? Object.defineProperty(globalThis, key, old) : Reflect.deleteProperty(globalThis, key));
  }
  return { canvas, qualities, draws, closed: () => closed, failDecode: () => { failDecode = true; }, outputType: (type: string) => { outputType = type; } };
}

function photo(kb: number, type = "image/jpeg") {
  return new File([new Uint8Array(kb * KB)], "villa.jpg", { type, lastModified: 123456 });
}

for (const kb of [300, 900, 950 - 1 / KB]) {
  test(`${kb} KB within the dimension limit is unchanged without encoding`, async (t) => {
    const environment = browser(t);
    const file = photo(kb);
    assert.deepEqual(await optimizePropertyImage(file), { file, optimizationFailed: false, optimized: false });
    assert.equal(environment.qualities.length, 0);
    assert.equal(environment.draws.length, 0);
    assert.equal(environment.closed(), 1);
  });
}

for (const kb of [950, 2 * 1024, 5 * 1024]) {
  test(`${kb} KB is compressed before upload without upscaling`, async (t) => {
    const environment = browser(t);
    const file = photo(kb);
    const result = await optimizePropertyImage(file);
    assert.equal(result.optimized, true);
    assert.equal(result.file.size, 600 * KB);
    assert.equal(result.file.type, "image/webp");
    assert.equal(result.file.name, "villa.webp");
    assert.equal(result.file.lastModified, file.lastModified);
    assert.deepEqual(environment.qualities, [0.85]);
    assert.deepEqual([environment.canvas.width, environment.canvas.height], [1800, 1200]);
  });
}

for (const [width, height, expected] of [[4800, 3200, [2400, 1600]], [1600, 3200, [1200, 2400]]] as const) {
  test(`oversized ${width}x${height} image is resized even below 950 KB`, async (t) => {
    const environment = browser(t, width, height, [200 * KB]);
    const result = await optimizePropertyImage(photo(900));
    assert.equal(result.optimized, true);
    assert.deepEqual([environment.canvas.width, environment.canvas.height], expected);
    assert.deepEqual(environment.qualities, [0.85]);
  });
}

test("quality steps stop as soon as the 700 KB target is reached", async (t) => {
  const environment = browser(t, 1800, 1200, [900 * KB, 800 * KB, 700 * KB, 600 * KB]);
  const result = await optimizePropertyImage(photo(2048));
  assert.equal(result.file.size, 700 * KB);
  assert.deepEqual(environment.qualities, [0.85, 0.8, 0.75]);
  assert.equal(environment.draws.length, 1);
});

test("unreachable target keeps the smallest result without dropping below 65%", async (t) => {
  const environment = browser(t, 1800, 1200, [1000 * KB, 900 * KB, 850 * KB, 800 * KB, 820 * KB]);
  const result = await optimizePropertyImage(photo(2048));
  assert.equal(result.file.size, 800 * KB);
  assert.deepEqual(environment.qualities, [0.85, 0.8, 0.75, 0.7, 0.65]);
});

test("already optimized WebP is never replaced by a larger or equal file", async (t) => {
  const environment = browser(t, 1800, 1200, [1100 * KB, 1050 * KB, 1000 * KB, 980 * KB, 950 * KB]);
  const file = photo(950, "image/webp");
  const result = await optimizePropertyImage(file);
  assert.equal(result.file, file);
  assert.equal(result.optimized, false);
  assert.equal(environment.qualities.length, 5);
});

test("a small result is kept at 85%, without trying to inflate it to 500 KB", async (t) => {
  const environment = browser(t, 1800, 1200, [100 * KB]);
  const result = await optimizePropertyImage(photo(950));
  assert.equal(result.file.size, 100 * KB);
  assert.deepEqual(environment.qualities, [0.85]);
});

for (const type of ["image/png", "image/webp"]) {
  test(`animated ${type} is preserved without decoding or flattening`, async (t) => {
    const environment = browser(t);
    environment.failDecode();
    const header = new Uint8Array(type === "image/png" ? 16 : 20);
    const marker = type === "image/png" ? "acTL" : "ANIM";
    header.set(new TextEncoder().encode(marker), 12);
    const file = new File([header, new Uint8Array(1024 * KB)], "animated", { type });
    assert.deepEqual(await optimizePropertyImage(file), { file, optimizationFailed: false, optimized: false });
    assert.equal(environment.qualities.length, 0);
  });
}

test("unsupported formats are left to existing upload validation", async (t) => {
  const environment = browser(t);
  environment.failDecode();
  const file = photo(2048, "image/gif");
  assert.deepEqual(await optimizePropertyImage(file), { file, optimizationFailed: false, optimized: false });
});

test("decode failure safely returns the original", async (t) => {
  const environment = browser(t);
  environment.failDecode();
  const file = photo(2048);
  assert.deepEqual(await optimizePropertyImage(file), { file, optimizationFailed: true, optimized: false });
});

test("canvas failure safely returns the original and releases the decoded image", async (t) => {
  const environment = browser(t);
  environment.canvas.getContext = () => { throw new Error("Canvas unavailable"); };
  const file = photo(2048);
  assert.deepEqual(await optimizePropertyImage(file), { file, optimizationFailed: true, optimized: false });
  assert.equal(environment.closed(), 1);
});

test("a resized image also keeps the original when every encoding is larger", async (t) => {
  const environment = browser(t, 3200, 1800, [1000 * KB]);
  const file = photo(900);
  const result = await optimizePropertyImage(file);
  assert.equal(result.file, file);
  assert.equal(result.optimized, false);
  assert.deepEqual([environment.canvas.width, environment.canvas.height], [2400, 1350]);
});

for (const output of ["null", "image/png"]) {
  test(`unavailable WebP encoder (${output}) keeps the original and its MIME type`, async (t) => {
    const environment = browser(t, 1800, 1200, output === "null" ? [0] : [600 * KB]);
    if (output !== "null") environment.outputType(output);
    const file = photo(2048);
    const result = await optimizePropertyImage(file);
    assert.equal(result.file, file);
    assert.equal(result.optimized, false);
  });
}

test("multiple gallery files are processed independently in their input order", async (t) => {
  const environment = browser(t);
  const files = [photo(300), photo(950), photo(900), photo(2048), photo(5120)];
  const results = [];
  for (const file of files) results.push(await optimizePropertyImage(file));
  assert.deepEqual(results.map((result) => result.optimized), [false, true, false, true, true]);
  assert.equal(results[0].file, files[0]);
  assert.equal(results[2].file, files[2]);
  assert.equal(environment.qualities.length, 3);
});
