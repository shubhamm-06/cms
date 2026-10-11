"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/src/features/auth/auth-guards";
import { createClient } from "@/src/lib/supabase/server";

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
  direction: z.enum(["up", "down"]),
});

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

  const existing = await getPropertyImages(supabase, parsed.data.propertyId);
  if (existing.error) {
    safeImageFailure("load-before-create", existing.error, { propertyId: parsed.data.propertyId });
    return { message: "Image metadata could not be saved.", ok: false };
  }

  const nextSortOrder = Math.max(-1, ...(existing.data ?? []).map((image) => image.sort_order)) + 1;
  const hasCover = (existing.data ?? []).some((image) => image.is_cover);
  const inserted = await supabase
    .from("property_images")
    .insert({
      is_cover: !hasCover,
      property_id: parsed.data.propertyId,
      sort_order: nextSortOrder,
      storage_path: parsed.data.storagePath,
    })
    .select("*")
    .single();

  if (inserted.error || !inserted.data) {
    safeImageFailure("create-metadata", inserted.error, { propertyId: parsed.data.propertyId });
    return { message: "Image metadata could not be saved.", ok: false };
  }

  revalidatePath("/dashboard/properties");
  return { image: inserted.data, ok: true };
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

  revalidatePath("/dashboard/properties");
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

  revalidatePath("/dashboard/properties");
  return { images: images.data ?? [], ok: true };
}

export async function movePropertyImageAction(input: { direction: "up" | "down"; imageId: string; propertyId: string }) {
  await requireRole("admin");
  const parsed = movePropertyImageSchema.safeParse(input);
  if (!parsed.success) return { message: "Image details are not valid.", ok: false };

  const supabase = await createClient();
  const images = await getPropertyImages(supabase, parsed.data.propertyId);
  if (images.error) {
    safeImageFailure("load-before-move", images.error, parsed.data);
    return { message: "Image order could not be updated.", ok: false };
  }

  const ordered = images.data ?? [];
  const currentIndex = ordered.findIndex((image) => image.id === parsed.data.imageId);
  const nextIndex = currentIndex + (parsed.data.direction === "up" ? -1 : 1);
  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= ordered.length) {
    return { images: ordered, ok: true };
  }

  const reordered = [...ordered];
  [reordered[currentIndex], reordered[nextIndex]] = [reordered[nextIndex], reordered[currentIndex]];
  const updates = await Promise.all(
    reordered.map((image, index) => supabase.from("property_images").update({ sort_order: index }).eq("id", image.id).eq("property_id", parsed.data.propertyId)),
  );
  const failed = updates.find((result) => result.error);
  if (failed?.error) {
    safeImageFailure("move", failed.error, parsed.data);
    return { message: "Image order could not be updated.", ok: false };
  }

  const refreshed = await getPropertyImages(supabase, parsed.data.propertyId);
  if (refreshed.error) {
    safeImageFailure("reload-after-move", refreshed.error, parsed.data);
    return { message: "Image order was updated, but the gallery could not refresh.", ok: false };
  }

  revalidatePath("/dashboard/properties");
  return { images: refreshed.data ?? [], ok: true };
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

  revalidatePath("/dashboard/properties");
  if (storageDelete.error) {
    safeImageFailure("delete-storage", storageDelete.error, parsed.data);
    return { images: refreshed.data ?? [], message: "Image metadata was removed, but Storage cleanup needs attention.", ok: true, warning: true };
  }
  if (coverWarning) {
    return { images: refreshed.data ?? [], message: "Image was deleted, but a new cover could not be selected.", ok: true, warning: true };
  }

  return { images: refreshed.data ?? [], ok: true };
}
