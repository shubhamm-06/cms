import { lookup } from "node:dns";
import { request } from "node:https";
import { BlockList, isIP } from "node:net";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const blocked = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24],
  ["192.88.99.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
  ["224.0.0.0", 4], ["240.0.0.0", 4],
] as const) blocked.addSubnet(address, prefix, "ipv4");
blocked.addAddress("168.63.129.16", "ipv4"); // Azure platform/metadata endpoint.
// Only global-unicast IPv6 is accepted, excluding transition/documentation space.
const globalV6 = new BlockList();
globalV6.addSubnet("2000::", 3, "ipv6");
blocked.addSubnet("2001::", 23, "ipv6");
blocked.addSubnet("2001:db8::", 32, "ipv6");
blocked.addSubnet("2002::", 16, "ipv6");
blocked.addSubnet("3fff::", 20, "ipv6");

export function isPublicImageAddress(address: string) {
  const family = isIP(address);
  if (family === 4) return !blocked.check(address, "ipv4");
  return family === 6 && globalV6.check(address, "ipv6") && !blocked.check(address, "ipv6");
}

export function validateImageLink(value: string) {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("Invalid link. Enter an HTTPS image URL."); }
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase().replace(/\.$/, "");
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) {
    throw new Error("Invalid link. Use HTTPS without credentials or a custom port.");
  }
  if ((!host.includes(".") && !isIP(host)) || /(^|\.)(localhost|local|internal|lan|home|test|invalid)$/.test(host) || (isIP(host) && !isPublicImageAddress(host))) {
    throw new Error("Invalid link. Local and private network addresses are not allowed.");
  }
  url.hash = "";
  return url;
}

export function imageFileType(bytes: Buffer) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { contentType: "image/jpeg", extension: "jpg" };
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return { contentType: "image/png", extension: "png" };
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return { contentType: "image/webp", extension: "webp" };
  return null;
}

export async function fetchPropertyImageLink(value: string) {
  let url = validateImageLink(value);
  const signal = AbortSignal.timeout(15_000);
  for (let redirects = 0; redirects <= 3; redirects++) {
    const result = await new Promise<{ redirect: string } | { bytes: Buffer; contentType: string }>((resolve, reject) => {
      const req = request(url, {
        signal,
        agent: false,
        headers: { Accept: "image/jpeg, image/png, image/webp", "Accept-Encoding": "identity" },
        // Validate every DNS answer and use that same resolution for the socket.
        // A separate DNS check followed by fetch would allow DNS rebinding.
        lookup(host, options, callback) {
          lookup(host, { all: true, verbatim: true }, (error, addresses) => {
            if (error) { callback(error, "", 4); return; }
            if (!addresses.length || addresses.some(({ address }) => !isPublicImageAddress(address))) {
              callback(new Error("Invalid link. Local and private network addresses are not allowed."), "", 4);
              return;
            }
            if (options.all) callback(null, addresses);
            else callback(null, addresses[0].address, addresses[0].family);
          });
        },
      }, (response) => {
        const status = response.statusCode ?? 0;
        if ([301, 302, 303, 307, 308].includes(status) && response.headers.location) {
          response.destroy();
          resolve({ redirect: response.headers.location });
          return;
        }
        const contentType = (response.headers["content-type"] ?? "").split(";")[0].trim().toLowerCase();
        const fail = (message: string) => { reject(new Error(message)); response.destroy(); };
        if (status < 200 || status >= 300) { fail("Fetch failed. The image server could not return this image."); return; }
        if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) { fail("Not an image. Use a direct JPEG, PNG, or WebP link."); return; }
        if (Number(response.headers["content-length"]) > MAX_IMAGE_BYTES) { fail("Image is too large. The limit is 10 MB."); return; }
        const chunks: Buffer[] = [];
        let size = 0;
        response.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_IMAGE_BYTES) { fail("Image is too large. The limit is 10 MB."); return; }
          chunks.push(chunk);
        });
        response.on("error", reject);
        response.on("end", () => resolve({ bytes: Buffer.concat(chunks), contentType }));
      });
      req.on("error", (error) => reject(new Error(error.message.startsWith("Invalid link.") ? error.message : "Fetch failed. The image server is unavailable or timed out.")));
      req.end();
    });
    if ("redirect" in result) {
      url = validateImageLink(new URL(result.redirect, url).href);
      continue;
    }
    const type = imageFileType(result.bytes);
    if (!type || type.contentType !== result.contentType) throw new Error("Not an image. The file must be JPEG, PNG, or WebP.");
    return { bytes: result.bytes, ...type };
  }
  throw new Error("Fetch failed. The link redirects too many times.");
}
