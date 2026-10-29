"use server";

import { invalidateBusinessData } from "@/src/features/shared/cache-invalidation";
import { z } from "zod";
import { requireRole } from "@/src/features/auth/auth-guards";
import { createClient } from "@/src/lib/supabase/server";
import { fetchPropertyImageLink } from "@/src/features/properties/property-image-link";

const propertyImageTargetSchema = z.object({
  imageId: z.string().uuid(),
  propertyId: z.string().uuid(),
});

const createPropertyImageSchema = z.object({
  propertyId: z.string().uuid(),
  storagePath: z.string().min(1).max(255),
});

const updateAltTextSchema = propertyImageTargetSchema.extend({
  altText: z.string().max(500),
});

const movePropertyImageSchema = propertyImageTargetSchema.extend({
  direction: z.enum(["up", "down"]).optional(),
  toIndex: z.number().int().nonnegative().optional(),
}).refine((value) => (value.direction !== undefined) !== (value.toIndex !== undefined));

function isValidStoragePath(propertyId: string, storagePath: string) {
  const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
  return new RegExp(`^${propertyId}/${uuid}\\.(jpg|jpeg|png|webp)$`, "i").test(storagePath);
}

function safeImageFailure(action: string, error: unknown, ids: Record<string, string>) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code || "unknown") : "unknown";
  console.error("Property image action failed", { action, code, ...ids });
}

async function getPropertyImages(supabase: Awaited<ReturnType<typeof createClient>>, propertyId: string) {
  const images = await supabase
    .from("property_images")
    .select("*")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return images;
}

async function verifyProperty(supabase: Awaited<ReturnType<typeof createClient>>, propertyId: string) {
  const property = await supabase.from("properties").select("id").eq("id", propertyId).maybeSingle();
  return Boolean(property.data && !property.error);
}

export async function createPropertyImageMetadataAction(input: { propertyId: string; storagePath: string }) {
  await requireRole("admin");
  const parsed = createPropertyImageSchema.safeParse(input);
  if (!parsed.success || !isValidStoragePath(input.propertyId, input.storagePath)) {
    return { message: "The uploaded image path is not valid.", ok: false };
  }

  const supabase = await createClient();
  if (!(await verifyProperty(supabase, parsed.data.propertyId))) {
    return { message: "Property was not found.", ok: false };
  }

  const result = await appendPropertyImages(supabase, parsed.data.propertyId, [{ storage_path: parsed.data.storagePath }]);
  return result.ok && result.images ? { image: result.images[0], ok: true } : { message: result.message, ok: false };
}

async function appendPropertyImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  propertyId: string,
  additions: { storage_path: string; alt_text?: string | null }[],
  coverOnlyWhenEmpty = false,
) {
  const existing = await getPropertyImages(supabase, propertyId);
  if (existing.error) {
    safeImageFailure("load-before-create", existing.error, { propertyId });
    return { message: "Image metadata could not be saved.", ok: false };
  }

  const nextSortOrder = Math.max(-1, ...(existing.data ?? []).map((image) => image.sort_order)) + 1;
  const hasCover = (existing.data ?? []).some((image) => image.is_cover);
  const inserted = await supabase
    .from("property_images")
    .insert(additions.map((image, index) => ({
      ...image,
      is_cover: !hasCover && (!coverOnlyWhenEmpty || !existing.data?.length) && index === 0,
      property_id: propertyId,
      sort_order: nextSortOrder + index,
    })))
    .select("*");

  if (inserted.error || !inserted.data) {
    safeImageFailure("create-metadata", inserted.error, { propertyId });
    return { message: "Image metadata could not be saved.", ok: false };
  }

  invalidateBusinessData("property_images");
  return { images: inserted.data, ok: true };
}

export async function listPropertyImageLibraryAction(input: { propertyId: string; search: string; offset: number }) {
  await requireRole("admin");
  const parsed = z.object({ propertyId: z.string().uuid(), search: z.string().max(100), offset: z.number().int().min(0).max(100000) }).safeParse(input);
  if (!parsed.success) return { ok: false, message: "Library search is not valid." };
  const supabase = await createClient();
  // Escape PostgREST filter syntax and wildcard characters before building OR.
  const search = parsed.data.search.replace(/[^\p{L}\p{N}\s-]/gu, " ").trim();
  let query = supabase.from("property_images").select("id,storage_path,alt_text,properties!inner(name)").neq("property_id", parsed.data.propertyId);
  if (search) {
    const properties = await supabase.from("properties").select("id").ilike("name", `%${search}%`).limit(1000);
    if (properties.error) return { ok: false, message: "Image library could not be loaded." };
    const ids = (properties.data ?? []).map((property) => property.id);
    query = ids.length
      ? query.or(`alt_text.ilike.%${search}%,property_id.in.(${ids.join(",")})`)
      : query.ilike("alt_text", `%${search}%`);
  }
  const result = await query.order("created_at", { ascending: false }).order("id").range(parsed.data.offset, parsed.data.offset + 24);
  if (result.error) return { ok: false, message: "Image library could not be loaded." };
  return {
    ok: true,
    hasMore: result.data.length > 24,
    images: result.data.slice(0, 24).map(({ properties, ...image }) => ({ ...image, propertyName: properties.name })),
  };
}

export async function reusePropertyImagesAction(input: { propertyId: string; imageIds: string[] }) {
  await requireRole("admin");
  const parsed = z.object({ propertyId: z.string().uuid(), imageIds: z.array(z.string().uuid()).min(1).max(24) }).safeParse(input);
  if (!parsed.success) return { ok: false, message: "Select between 1 and 24 images." };
  const supabase = await createClient();
  if (!(await verifyProperty(supabase, parsed.data.propertyId))) return { ok: false, message: "Property was not found." };
  const ids = [...new Set(parsed.data.imageIds)];
  const sources = await supabase.from("property_images").select("id,storage_path,alt_text").in("id", ids).neq("property_id", parsed.data.propertyId);
  if (sources.error || sources.data.length !== ids.length) return { ok: false, message: "Some selected images are no longer available. Search again." };
  const additions = ids.map((id) => {
    const image = sources.data.find((image) => image.id === id)!;
    const extension = image.storage_path.match(/\.(jpg|jpeg|png|webp)$/i)?.[1].toLowerCase();
    return { sourcePath: image.storage_path, storage_path: `${parsed.data.propertyId}/${crypto.randomUUID()}.${extension}`, alt_text: image.alt_text, extension };
  });
  if (additions.some((image) => !image.extension)) return { ok: false, message: "Some selected images have an unsupported file type. Use JPEG, PNG, or WebP." };

  const copiedPaths: string[] = [];
  let message = "Selected images could not be copied. No images were added.";
  try {
    for (const image of additions) {
      const copied = await supabase.storage.from("property-images").copy(image.sourcePath, image.storage_path);
      if (copied.error) {
        safeImageFailure("copy-library-image", copied.error, { propertyId: parsed.data.propertyId });
        throw new Error(message);
      }
      copiedPaths.push(image.storage_path);
    }
    message = "Copied image details could not be saved. No images were added.";
    const result = await appendPropertyImages(supabase, parsed.data.propertyId, additions.map(({ storage_path, alt_text }) => ({ storage_path, alt_text })), true);
    if (result.ok) return result;
  } catch (error) {
    safeImageFailure("add-library-images", error, { propertyId: parsed.data.propertyId });
  }
  const cleaned = await cleanupNewImageFiles(supabase, copiedPaths);
  return { ok: false, message: `${message}${cleaned ? "" : " Copied file cleanup needs attention."}` };
}

async function cleanupNewImageFiles(supabase: Awaited<ReturnType<typeof createClient>>, paths: string[]) {
  if (!paths.length) return true;
  try {
    const removed = await supabase.storage.from("property-images").remove(paths);
    if (!removed.error) return true;
    safeImageFailure("cleanup-new-images", removed.error, {});
  } catch (error) { safeImageFailure("cleanup-new-images", error, {}); }
  return false;
}

export async function addPropertyImageLinkAction(input: { propertyId: string; url: string }) {
  await requireRole("admin");
  const parsed = z.object({ propertyId: z.string().uuid(), url: z.string().trim().min(1).max(4096) }).safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid link. Enter an HTTPS image URL." };
  const supabase = await createClient();
  if (!(await verifyProperty(supabase, parsed.data.propertyId))) return { ok: false, message: "Property was not found." };
  let image;
  try { image = await fetchPropertyImageLink(parsed.data.url); }
  catch (error) {
    const message = error instanceof Error && /^(Invalid link\.|Not an image\.|Image is too large\.|Fetch failed\.)/.test(error.message)
      ? error.message : "Fetch failed. Check the link and try again.";
    return { ok: false, message };
  }
  const storagePath = `${parsed.data.propertyId}/${crypto.randomUUID()}.${image.extension}`;
  const upload = await supabase.storage.from("property-images").upload(storagePath, image.bytes, { contentType: image.contentType, upsert: false });
  if (upload.error) return { ok: false, message: "Image could not be uploaded to Storage." };
  const metadata = await createPropertyImageMetadataAction({ propertyId: parsed.data.propertyId, storagePath });
  if (!metadata.ok) {
    const cleaned = await cleanupNewImageFiles(supabase, [storagePath]);
    if (!cleaned) return { ok: false, message: `${metadata.message} Uploaded file cleanup needs attention.` };
  }
  return metadata;
}

export async function updatePropertyImageAltTextAction(input: { altText: string; imageId: string; propertyId: string }) {
  await requireRole("admin");
  const parsed = updateAltTextSchema.safeParse(input);
  if (!parsed.success) return { message: "Image details are not valid.", ok: false };

  const supabase = await createClient();
  const image = await supabase
    .from("property_images")
    .select("id")
    .eq("id", parsed.data.imageId)
    .eq("property_id", parsed.data.propertyId)
    .maybeSingle();
  if (image.error || !image.data) return { message: "Image was not found for this property.", ok: false };

  const updated = await supabase
    .from("property_images")
    .update({ alt_text: parsed.data.altText.trim() || null })
    .eq("id", parsed.data.imageId)
    .eq("property_id", parsed.data.propertyId)
    .select("*")
    .single();
  if (updated.error || !updated.data) {
    safeImageFailure("update-alt-text", updated.error, parsed.data);
    return { message: "Alt text could not be saved.", ok: false };
  }

  invalidateBusinessData("property_images");
  return { image: updated.data, ok: true };
}

export async function setPropertyImageCoverAction(input: { imageId: string; propertyId: string }) {
  await requireRole("admin");
  const parsed = propertyImageTargetSchema.safeParse(input);
  if (!parsed.success) return { message: "Image details are not valid.", ok: false };

  const supabase = await createClient();
  const target = await supabase
    .from("property_images")
    .select("id,is_cover")
    .eq("id", parsed.data.imageId)
    .eq("property_id", parsed.data.propertyId)
    .maybeSingle();
  if (target.error || !target.data) return { message: "Image was not found for this property.", ok: false };

  if (!target.data.is_cover) {
    const currentCover = await supabase
      .from("property_images")
      .select("id")
      .eq("property_id", parsed.data.propertyId)
      .eq("is_cover", true)
      .maybeSingle();
    if (currentCover.error) {
      safeImageFailure("load-cover", currentCover.error, parsed.data);
      return { message: "Cover image could not be updated.", ok: false };
    }

    const cleared = await supabase
      .from("property_images")
      .update({ is_cover: false })
      .eq("property_id", parsed.data.propertyId)
      .eq("is_cover", true);
    if (cleared.error) {
      safeImageFailure("clear-cover", cleared.error, parsed.data);
      return { message: "Cover image could not be updated.", ok: false };
    }
    invalidateBusinessData("property_images");

    const selected = await supabase
      .from("property_images")
      .update({ is_cover: true })
      .eq("id", parsed.data.imageId)
      .eq("property_id", parsed.data.propertyId);
    if (selected.error) {
      if (currentCover.data) {
        await supabase.from("property_images").update({ is_cover: true }).eq("id", currentCover.data.id);
      }
      safeImageFailure("set-cover", selected.error, parsed.data);
      return { message: "Cover image could not be updated.", ok: false };
    }
  }

  const images = await getPropertyImages(supabase, parsed.data.propertyId);
  if (images.error) {
    safeImageFailure("reload-after-cover", images.error, parsed.data);
    return { message: "Cover image was updated, but the gallery could not refresh.", ok: false };
  }

  invalidateBusinessData("property_images");
  return { images: images.data ?? [], ok: true };
}

export async function movePropertyImageAction(input: { direction?: "up" | "down"; toIndex?: number; imageId: string; propertyId: string }) {
  await requireRole("admin");
  const parsed = movePropertyImageSchema.safeParse(input);
  if (!parsed.success) return { message: "Image details are not valid.", ok: false };

  const supabase = await createClient();
  const images = await getPropertyImages(supabase, parsed.data.propertyId);
  if (images.error) {
    safeImageFailure("load-before-move", images.error, { propertyId: parsed.data.propertyId });
    return { message: "Image order could not be updated.", ok: false };
  }

  const ordered = images.data ?? [];
  const currentIndex = ordered.findIndex((image) => image.id === parsed.data.imageId);
  const nextIndex = parsed.data.toIndex ?? currentIndex + (parsed.data.direction === "up" ? -1 : 1);
  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= ordered.length) {
    return { images: ordered, ok: true };
  }

  const reordered = [...ordered];
  reordered.splice(nextIndex, 0, reordered.splice(currentIndex, 1)[0]);
  const updates = await Promise.allSettled(
    reordered.map((image, index) => supabase.from("property_images").update({ sort_order: index }).eq("id", image.id).eq("property_id", parsed.data.propertyId)),
  );
  const failed = updates.find((result) => result.status === "rejected" || result.value.error);
  if (updates.some((result) => result.status === "fulfilled" && !result.value.error)) invalidateBusinessData("property_images");
  if (failed) {
    // The existing table has no reorder RPC/transaction. Restore the original
    // order if one of the individual updates fails.
    await Promise.allSettled(ordered.map((image) => supabase.from("property_images").update({ sort_order: image.sort_order }).eq("id", image.id).eq("property_id", parsed.data.propertyId)));
    safeImageFailure("move", failed.status === "rejected" ? failed.reason : failed.value.error, { propertyId: parsed.data.propertyId });
    return { message: "Image order could not be updated.", ok: false };
  }
  return { images: reordered.map((image, index) => ({ ...image, sort_order: index })), ok: true };
}

export async function deletePropertyImageAction(input: { imageId: string; propertyId: string }) {
  await requireRole("admin");
  const parsed = propertyImageTargetSchema.safeParse(input);
  if (!parsed.success) return { message: "Image details are not valid.", ok: false };

  const supabase = await createClient();
  const image = await supabase
    .from("property_images")
    .select("id,is_cover,storage_path")
    .eq("id", parsed.data.imageId)
    .eq("property_id", parsed.data.propertyId)
    .maybeSingle();
  if (image.error || !image.data) return { message: "Image was not found for this property.", ok: false };

  const deleted = await supabase
    .from("property_images")
    .delete()
    .eq("id", parsed.data.imageId)
    .eq("property_id", parsed.data.propertyId);
  if (deleted.error) {
    safeImageFailure("delete-metadata", deleted.error, parsed.data);
    return { message: "Image could not be deleted.", ok: false };
  }
  invalidateBusinessData("property_images");

  const storageDelete = await supabase.storage.from("property-images").remove([image.data.storage_path]);
  const remaining = await getPropertyImages(supabase, parsed.data.propertyId);
  if (remaining.error) {
    safeImageFailure("load-after-delete", remaining.error, parsed.data);
    if (storageDelete.error) safeImageFailure("delete-storage", storageDelete.error, parsed.data);
    return { message: "Image metadata was removed, but the gallery could not refresh.", ok: true, warning: true };
  }

  let coverWarning = false;
  if (image.data.is_cover && remaining.data?.length) {
    const nextCover = remaining.data[0];
    const coverUpdate = await supabase.from("property_images").update({ is_cover: true }).eq("id", nextCover.id).eq("property_id", parsed.data.propertyId);
    if (coverUpdate.error) {
      safeImageFailure("replace-cover-after-delete", coverUpdate.error, parsed.data);
      coverWarning = true;
    }
  }

  const refreshed = await getPropertyImages(supabase, parsed.data.propertyId);
  if (refreshed.error) {
    safeImageFailure("reload-after-storage-delete", refreshed.error, parsed.data);
    if (storageDelete.error) safeImageFailure("delete-storage", storageDelete.error, parsed.data);
    return { message: "Image metadata was removed, but the gallery could not refresh.", ok: true, warning: true };
  }

  invalidateBusinessData("property_images");
  if (storageDelete.error) {
    safeImageFailure("delete-storage", storageDelete.error, parsed.data);
    return { images: refreshed.data ?? [], message: "Image metadata was removed, but Storage cleanup needs attention.", ok: true, warning: true };
  }
  if (coverWarning) {
    return { images: refreshed.data ?? [], message: "Image was deleted, but a new cover could not be selected.", ok: true, warning: true };
  }

  return { images: refreshed.data ?? [], ok: true };
}
