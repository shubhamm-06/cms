import { createSeoImageResponse, seoImageContentType, seoImageSize } from "@/app/seo-image";

export const size = seoImageSize;
export const contentType = seoImageContentType;

export default function TwitterImage() {
  return createSeoImageResponse();
}
