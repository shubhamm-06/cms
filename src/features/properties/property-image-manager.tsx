"use client";

/* eslint-disable @next/next/no-img-element */

import { ImagePlus, Loader2, MoveDown, MoveUp, Save, Star, Tag, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  createPropertyImageMetadataAction,
  deletePropertyImageAction,
  movePropertyImageAction,
  setPropertyImageCoverAction,
  updatePropertyImageAltTextAction,
} from "@/src/features/properties/property-image-actions";
import { optimizePropertyImage } from "@/src/features/properties/property-image-optimization";
import { createClient } from "@/src/lib/supabase/client";
import { applyRoomPrefix, parsePhotoRoom, ROOM_SUGGESTIONS } from "@/src/lib/utils/photo-rooms";
import type { Database } from "@/types/database.types";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type PropertyImage = Database["public"]["Tables"]["property_images"]["Row"];

const SUPPORTED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sortImages(images: PropertyImage[]) {
  return [...images].sort((left, right) => left.sort_order - right.sort_order || left.created_at.localeCompare(right.created_at));
}

function displayImages(images: PropertyImage[]) {
  return [...images].sort((left, right) => Number(right.is_cover) - Number(left.is_cover) || left.sort_order - right.sort_order || left.created_at.localeCompare(right.created_at));
}

function getPublicImageUrl(storagePath: string) {
  return createClient().storage.from("property-images").getPublicUrl(storagePath).data.publicUrl;
}

function DeleteImageDialog({
  image,
  onDeleted,
  propertyId,
}: {
  image: PropertyImage;
  onDeleted: (images: PropertyImage[]) => void;
  propertyId: string;
}) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    const result = await deletePropertyImageAction({ imageId: image.id, propertyId });
    setPending(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    if (result.images) onDeleted(result.images);
    if (result.warning) toast.warning(result.message || "Storage cleanup needs attention.");
    else toast.success("Image deleted.");
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button aria-label="Delete image" size="icon" type="button" variant="danger">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this image?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the image from the property gallery and attempts to remove its matching Storage file.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button disabled={pending} onClick={handleDelete} type="button" variant="danger">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {pending ? "Deleting..." : "Delete image"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function PropertyImageManager({ images: initialImages, propertyId }: { images: PropertyImage[]; propertyId?: string }) {
  const [images, setImages] = useState(() => sortImages(initialImages));
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ completed: number; stage: "optimizing" | "uploading"; total: number } | null>(null);
  const [savingAltId, setSavingAltId] = useState<string | null>(null);
  const [movingImageId, setMovingImageId] = useState<string | null>(null);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);
  const [altValues, setAltValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialImages.map((image) => [image.id, image.alt_text || ""])),
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRoom, setBulkRoom] = useState("");
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!propertyId) {
    return (
      <section className="mt-6 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)]/45 p-5">
        <h3 className="text-sm font-bold text-[var(--foreground)]">Property images</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Save the property first, then edit it to upload images.</p>
      </section>
    );
  }

  const activePropertyId = propertyId;

  function replaceImages(nextImages: PropertyImage[]) {
    setImages(sortImages(nextImages));
    setAltValues((current) => ({
      ...current,
      ...Object.fromEntries(nextImages.map((image) => [image.id, image.alt_text || ""])),
    }));
  }

  async function handleUpload(files: FileList | null) {
    if (!files?.length || isUploading) return;

    const selectedFiles = Array.from(files);
    setIsUploading(true);
    setUploadProgress({ completed: 0, stage: "optimizing", total: selectedFiles.length });
    const supabase = createClient();
    const authenticated = await supabase.auth.getUser();
    if (!UUID_PATTERN.test(activePropertyId) || authenticated.error || !authenticated.data.user) {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.error("Your admin session is unavailable. Refresh the page and try again.");
      return;
    }

    const failures: string[] = [];
    const warnings: string[] = [];
    let completed = 0;

    for (const file of selectedFiles) {
      const originalExtension = SUPPORTED_IMAGE_TYPES[file.type as keyof typeof SUPPORTED_IMAGE_TYPES];
      if (!originalExtension) {
        failures.push(`${file.name}: use JPEG, PNG, or WebP.`);
      } else {
        setUploadProgress({ completed, stage: "optimizing", total: selectedFiles.length });
        const prepared = await optimizePropertyImage(file);
        if (prepared.optimizationFailed) warnings.push(`${file.name}: optimization could not be applied; the original was used.`);

        if (prepared.file.size > MAX_FILE_SIZE) {
          failures.push(`${file.name}: final upload must be 10 MB or smaller.`);
        } else {
          const extension = prepared.optimized ? "webp" : originalExtension;
          const storagePath = `${activePropertyId}/${crypto.randomUUID()}.${extension}`;
          setUploadProgress({ completed, stage: "uploading", total: selectedFiles.length });
          const upload = await supabase.storage.from("property-images").upload(storagePath, prepared.file, {
            contentType: prepared.file.type,
          upsert: false,
          });

          if (upload.error) {
            failures.push(`${file.name}: upload failed.`);
          } else {
            const metadata = await createPropertyImageMetadataAction({ propertyId: activePropertyId, storagePath });
            if (!metadata.ok || !metadata.image) {
              await supabase.storage.from("property-images").remove([storagePath]);
              failures.push(`${file.name}: image details could not be saved.`);
            } else {
              setImages((current) => sortImages([...current, metadata.image]));
              setAltValues((current) => ({ ...current, [metadata.image.id]: metadata.image.alt_text || "" }));
            }
          }
        }
      }

      completed += 1;
      setUploadProgress({ completed, stage: "optimizing", total: selectedFiles.length });
    }

    setIsUploading(false);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (completed > failures.length) toast.success(`${completed - failures.length} image${completed - failures.length === 1 ? "" : "s"} uploaded.`);
    failures.forEach((message) => toast.error(message));
  }

  function toggleSelected(imageId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(imageId)) next.delete(imageId);
      else next.add(imageId);
      return next;
    });
  }

  // Writes the `Room | ` prefix into each selected photo's alt text through the
  // existing alt-text action: no new field and no separate save path.
  async function applyRoomToSelected() {
    if (!bulkRoom || selectedIds.size === 0 || isBulkSaving) return;
    setIsBulkSaving(true);
    let saved = 0;
    let failed = 0;
    for (const image of orderedImages.filter((candidate) => selectedIds.has(candidate.id))) {
      const result = await updatePropertyImageAltTextAction({
        altText: applyRoomPrefix(altValues[image.id] ?? image.alt_text, bulkRoom),
        imageId: image.id,
        propertyId: activePropertyId,
      });
      if (!result.ok || !result.image) {
        failed += 1;
        continue;
      }
      saved += 1;
      setImages((current) => current.map((currentImage) => (currentImage.id === image.id ? result.image : currentImage)));
      setAltValues((current) => ({ ...current, [image.id]: result.image.alt_text || "" }));
    }
    setIsBulkSaving(false);
    if (saved > 0) {
      toast.success(`${bulkRoom} applied to ${saved} photo${saved === 1 ? "" : "s"}.`);
      setSelectedIds(new Set());
      setBulkRoom("");
    }
    if (failed > 0) toast.error(`${failed} photo${failed === 1 ? "" : "s"} could not be updated.`);
  }

  async function saveAltText(image: PropertyImage) {
    setSavingAltId(image.id);
    const result = await updatePropertyImageAltTextAction({
      altText: altValues[image.id] || "",
      imageId: image.id,
      propertyId: activePropertyId,
    });
    setSavingAltId(null);
    if (!result.ok || !result.image) {
      toast.error(result.message);
      return;
    }
    setImages((current) => current.map((currentImage) => (currentImage.id === image.id ? result.image : currentImage)));
    setAltValues((current) => ({ ...current, [image.id]: result.image.alt_text || "" }));
    toast.success("Alt text saved.");
  }

  async function setCover(image: PropertyImage) {
    if (image.is_cover) return;
    setCoverImageId(image.id);
    const result = await setPropertyImageCoverAction({ imageId: image.id, propertyId: activePropertyId });
    setCoverImageId(null);
    if (!result.ok || !result.images) {
      toast.error(result.message);
      return;
    }
    replaceImages(result.images);
    toast.success("Cover image updated.");
  }

  async function moveImage(image: PropertyImage, direction: "up" | "down") {
    setMovingImageId(image.id);
    const result = await movePropertyImageAction({ direction, imageId: image.id, propertyId: activePropertyId });
    setMovingImageId(null);
    if (!result.ok || !result.images) {
      toast.error(result.message);
      return;
    }
    replaceImages(result.images);
  }

  const orderedImages = sortImages(images);
  const galleryImages = displayImages(images);

  return (
    <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/45 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Property images</h3>
            <Badge tone="neutral">{images.length} {images.length === 1 ? "image" : "images"}</Badge>
          </div>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Upload JPEG, PNG, or WebP images up to 10 MB each. The gallery stores Storage paths, not public URLs.</p>
        </div>
        <div>
          <input
            accept="image/jpeg,image/png,image/webp"
            aria-label="Upload property images"
            className="sr-only"
            disabled={isUploading}
            multiple
            onChange={(event) => void handleUpload(event.target.files)}
            ref={fileInputRef}
            type="file"
          />
          <Button disabled={isUploading} onClick={() => fileInputRef.current?.click()} type="button" variant="primary">
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {isUploading ? "Processing..." : "Upload images"}
          </Button>
        </div>
      </div>

      {uploadProgress ? (
        <div className="mt-4" aria-live="polite">
          <div className="flex justify-between gap-3 text-xs font-semibold text-[var(--muted)]">
            <span>{uploadProgress.stage === "optimizing" ? "Optimizing" : "Uploading"} image {Math.min(uploadProgress.completed + 1, uploadProgress.total)} of {uploadProgress.total}</span>
            <span>{Math.round((uploadProgress.completed / uploadProgress.total) * 100)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full bg-[var(--brand)] transition-[width]" style={{ width: `${(uploadProgress.completed / uploadProgress.total) * 100}%` }} />
          </div>
        </div>
      ) : null}

      {!images.length ? (
        <div className="mt-5 rounded-lg border border-dashed border-[var(--border-strong)] bg-white/70 p-6 text-sm leading-6 text-[var(--muted)]">
          No gallery images yet. Upload the first image to make it the cover image automatically.
        </div>
      ) : (
        <>
        <div className="mt-5 flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-white p-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--foreground)]">Group photos by room</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
              The public photo tour groups photos by the room named in the alt text, for example &ldquo;Bedroom 2 | Bed with ceiling fan&rdquo;. Tick photos, pick a room, and the prefix is added to each alt text. Rooms appear in the order of each room&rsquo;s first photo.
            </p>
          </div>
          <label className="sm:w-48">
            <span className="cms-label">Room for selected</span>
            <Select disabled={isBulkSaving} onChange={(event) => setBulkRoom(event.target.value)} value={bulkRoom}>
              <option value="">Choose a room</option>
              {ROOM_SUGGESTIONS.map((room) => (
                <option key={room} value={room}>{room}</option>
              ))}
            </Select>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={isBulkSaving}
              onClick={() => setSelectedIds(selectedIds.size === orderedImages.length ? new Set() : new Set(orderedImages.map((image) => image.id)))}
              size="sm"
              type="button"
              variant="secondary"
            >
              {selectedIds.size === orderedImages.length ? "Clear selection" : "Select all"}
            </Button>
            <Button disabled={!bulkRoom || selectedIds.size === 0 || isBulkSaving} onClick={() => void applyRoomToSelected()} size="sm" type="button" variant="primary">
              {isBulkSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
              {isBulkSaving ? "Applying..." : `Apply to ${selectedIds.size} selected`}
            </Button>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {galleryImages.map((image) => {
            const orderIndex = orderedImages.findIndex((orderedImage) => orderedImage.id === image.id);
            const isSavingAlt = savingAltId === image.id;
            const isMoving = movingImageId === image.id;
            const isUpdatingCover = coverImageId === image.id;
            const detected = parsePhotoRoom(altValues[image.id]);

            return (
              <article className="overflow-hidden rounded-xl border border-[var(--border)] bg-white" key={image.id}>
                <div className="relative aspect-[4/3] bg-[var(--surface-2)]">
                  <img alt={image.alt_text || "Property gallery image"} className="h-full w-full object-cover" src={getPublicImageUrl(image.storage_path)} />
                  {image.is_cover ? <Badge className="absolute left-3 top-3" tone="brand"><Star className="h-3.5 w-3.5" />Cover</Badge> : null}
                  <label className="absolute right-3 top-3 inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold shadow-sm">
                    <input
                      checked={selectedIds.has(image.id)}
                      className="h-4 w-4 accent-[var(--brand)]"
                      disabled={isBulkSaving}
                      onChange={() => toggleSelected(image.id)}
                      type="checkbox"
                    />
                    Select
                  </label>
                </div>
                <div className="grid gap-3 p-3">
                  <label>
                    <span className="cms-label">Alt text</span>
                    <Input
                      onChange={(event) => setAltValues((current) => ({ ...current, [image.id]: event.target.value }))}
                      placeholder="Describe this image"
                      value={altValues[image.id] || ""}
                    />
                    <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">Describe the image for accessibility and search engines. Also shown as the photo caption.</span>
                  </label>
                  <div className="grid gap-2 rounded-lg bg-[var(--surface-2)] p-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold uppercase tracking-[0.06em] text-[var(--muted)]">Detected room</span>
                      {detected.room ? (
                        <Badge tone={detected.source === "prefix" ? "green" : "teal"}>{detected.room}</Badge>
                      ) : (
                        <Badge tone="amber">Additional photos</Badge>
                      )}
                      {detected.room ? (
                        <span className="text-[var(--muted)]">{detected.source === "prefix" ? "from the room prefix" : "guessed from the text"}</span>
                      ) : null}
                    </div>
                    {!detected.room ? (
                      <p className="text-xs leading-5 text-[var(--muted)]">
                        Add a room name, for example &ldquo;Bedroom 2 | Bed with ceiling fan&rdquo;, so this photo is grouped.
                      </p>
                    ) : null}
                    <Select
                      aria-label="Set room for this photo"
                      onChange={(event) => {
                        const room = event.target.value;
                        if (room) setAltValues((current) => ({ ...current, [image.id]: applyRoomPrefix(current[image.id], room) }));
                      }}
                      value=""
                    >
                      <option value="">Set room in alt text...</option>
                      {ROOM_SUGGESTIONS.map((room) => (
                        <option key={room} value={room}>{room}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button disabled={isSavingAlt} onClick={() => void saveAltText(image)} size="sm" type="button" variant="secondary">
                      {isSavingAlt ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {isSavingAlt ? "Saving..." : "Save alt"}
                    </Button>
                    <Button disabled={image.is_cover || isUpdatingCover} onClick={() => void setCover(image)} size="sm" type="button" variant="secondary">
                      {isUpdatingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
                      {image.is_cover ? "Cover" : "Make cover"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
                    <div className="flex gap-2">
                      <Button aria-label="Move image up" disabled={isMoving || orderIndex === 0} onClick={() => void moveImage(image, "up")} size="icon" type="button" variant="secondary">
                        {isMoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoveUp className="h-4 w-4" />}
                      </Button>
                      <Button aria-label="Move image down" disabled={isMoving || orderIndex === orderedImages.length - 1} onClick={() => void moveImage(image, "down")} size="icon" type="button" variant="secondary">
                        {isMoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoveDown className="h-4 w-4" />}
                      </Button>
                    </div>
                    <DeleteImageDialog image={image} onDeleted={replaceImages} propertyId={activePropertyId} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        </>
      )}
    </section>
  );
}
