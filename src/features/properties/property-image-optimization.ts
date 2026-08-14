export type PreparedPropertyImage = {
  file: File;
  optimizationFailed: boolean;
  optimized: boolean;
};

const MAX_LONGEST_SIDE = 2400;
const WEBP_QUALITY = 0.85;

function canvasToWebp(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", WEBP_QUALITY));
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
  try {
    const image = await loadImage(file);
    const sourceWidth = "naturalWidth" in image ? image.naturalWidth : image.width;
    const sourceHeight = "naturalHeight" in image ? image.naturalHeight : image.height;
    if (!sourceWidth || !sourceHeight) throw new Error("Image dimensions are not valid.");
    const scale = Math.min(1, MAX_LONGEST_SIDE / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable.");
    context.drawImage(image, 0, 0, width, height);
    if (image instanceof ImageBitmap) image.close();

    const blob = await canvasToWebp(canvas);
    if (!blob || blob.size >= file.size) return { file, optimizationFailed: false, optimized: false };

    return {
      file: new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "property-image"}.webp`, {
        lastModified: file.lastModified,
        type: "image/webp",
      }),
      optimizationFailed: false,
      optimized: true,
    };
  } catch {
    return { file, optimizationFailed: true, optimized: false };
  }
}
