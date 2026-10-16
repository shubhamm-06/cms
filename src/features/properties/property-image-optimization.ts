export type PreparedPropertyImage = {
  file: File;
  optimizationFailed: boolean;
  optimized: boolean;
};

const MAX_LONGEST_SIDE = 2400;
const COMPRESSION_THRESHOLD = 950 * 1024;
const TARGET_MAX_SIZE = 700 * 1024;
const WEBP_QUALITIES = [0.85, 0.8, 0.75, 0.7, 0.65];

function canvasToWebp(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
}

async function isAnimated(file: File) {
  if (file.type !== "image/png" && file.type !== "image/webp") return false;

  // Canvas would flatten APNG/animated WebP to one frame. Read container chunks,
  // rather than searching pixel data that might happen to contain these names.
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  const isPng = file.type === "image/png";
  let offset = isPng ? 8 : 12;
  while (offset + 8 <= buffer.byteLength) {
    const typeOffset = isPng ? offset + 4 : offset;
    const type = String.fromCharCode(...new Uint8Array(buffer, typeOffset, 4));
    if (type === "acTL" || type === "ANIM" || type === "ANMF") return true;
    const length = view.getUint32(isPng ? offset : offset + 4, !isPng);
    offset += isPng ? 12 + length : 8 + length + (length % 2);
  }
  return false;
}

async function loadImage(file: File) {
  if ("createImageBitmap" in window) {
    return createImageBitmap(file, { imageOrientation: "from-image" });
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image could not be decoded."));
    };
    image.src = url;
  });
}

export async function optimizePropertyImage(file: File): Promise<PreparedPropertyImage> {
  let image: ImageBitmap | HTMLImageElement | undefined;
  try {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || await isAnimated(file)) {
      return { file, optimizationFailed: false, optimized: false };
    }

    image = await loadImage(file);
    const sourceWidth = "naturalWidth" in image ? image.naturalWidth : image.width;
    const sourceHeight = "naturalHeight" in image ? image.naturalHeight : image.height;
    if (!sourceWidth || !sourceHeight) throw new Error("Image dimensions are not valid.");
    const scale = Math.min(1, MAX_LONGEST_SIDE / Math.max(sourceWidth, sourceHeight));
    if (scale === 1 && file.size < COMPRESSION_THRESHOLD) {
      return { file, optimizationFailed: false, optimized: false };
    }
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable.");
    // Keep the canvas transparent; WebP supports the original alpha channel.
    context.drawImage(image, 0, 0, width, height);

    let smallest: Blob | null = null;
    for (const quality of WEBP_QUALITIES) {
      // Every attempt uses the same original pixels, never a previous encoding.
      const blob = await canvasToWebp(canvas, quality);
      if (!blob || blob.type !== "image/webp" || !blob.size) break;
      if (blob.size < file.size && (!smallest || blob.size < smallest.size)) smallest = blob;
      // 500–700 KB is a soft target: keep smaller results without more encoding.
      if (blob.size <= TARGET_MAX_SIZE) break;
    }
    if (!smallest) return { file, optimizationFailed: false, optimized: false };

    return {
      file: new File([smallest], `${file.name.replace(/\.[^.]+$/, "") || "property-image"}.webp`, {
        lastModified: file.lastModified,
        type: "image/webp",
      }),
      optimizationFailed: false,
      optimized: true,
    };
  } catch {
    return { file, optimizationFailed: true, optimized: false };
  } finally {
    if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) image.close();
  }
}
