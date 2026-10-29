"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Link, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShowMoreDialog } from "@/components/ui/show-more-dialog";
import { addPropertyImageLinkAction, listPropertyImageLibraryAction, reusePropertyImagesAction } from "@/src/features/properties/property-image-actions";
import { createClient } from "@/src/lib/supabase/client";
import type { Database } from "@/types/database.types";

type PropertyImage = Database["public"]["Tables"]["property_images"]["Row"];
type LibraryImage = { id: string; storage_path: string; alt_text: string | null; propertyName: string };
type Props = { propertyId: string; disabled: boolean; onAdded: (images: PropertyImage[]) => void };

export function PropertyImageLibraryDialog({ propertyId, disabled, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const generation = useRef(0);

  useEffect(() => {
    const current = ++generation.current;
    if (!open) return;
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setImages([]);
      setHasMore(false);
      setError("");
      try {
        const result = await listPropertyImageLibraryAction({ propertyId, search, offset: 0 });
        if (!active || current !== generation.current) return;
        if (!result.ok || !result.images) setError(result.message || "Image library could not be loaded.");
        else { setImages(result.images); setHasMore(Boolean(result.hasMore)); }
      } catch { if (active && current === generation.current) setError("Image library could not be loaded. Try again."); }
      finally { if (active && current === generation.current) setLoading(false); }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [open, propertyId, search]);

  async function loadMore() {
    const current = generation.current;
    setLoading(true);
    setError("");
    try {
      const result = await listPropertyImageLibraryAction({ propertyId, search, offset: images.length });
      if (current !== generation.current) return;
      if (!result.ok || !result.images) setError(result.message || "Image library could not be loaded.");
      else { setImages((previous) => [...previous, ...result.images!]); setHasMore(Boolean(result.hasMore)); }
    } catch { if (current === generation.current) setError("Image library could not be loaded. Try again."); }
    finally { if (current === generation.current) setLoading(false); }
  }

  async function addSelected() {
    setSaving(true);
    setError("");
    try {
      const result = await reusePropertyImagesAction({ propertyId, imageIds: [...selected] });
      if (!result.ok || !("images" in result) || !result.images) { setError(result.message || "Images could not be added."); return; }
      onAdded(result.images);
      setSelected(new Set());
      setOpen(false);
      toast.success("Selected images added.");
    } catch { setError("Images could not be added. Try again."); }
    finally { setSaving(false); }
  }

  return (
    <ShowMoreDialog
      onOpenChange={(next) => { if (!saving) { setOpen(next); if (!next) setSelected(new Set()); } }}
      open={open}
      title="Choose from library"
      description="Copy photos from another property. Select up to 24 images."
      trigger={<Button disabled={disabled} type="button" variant="secondary"><ImagePlus className="h-4 w-4" />Choose from library</Button>}
    >
      <label>
        <span className="cms-label">Search by property name or alt text</span>
        <Input disabled={saving} maxLength={100} onChange={(event) => setSearch(event.target.value)} placeholder="Search images" value={search} />
      </label>
      {error ? <p className="mt-3 text-sm text-red-700" role="alert">{error}</p> : null}
      <div aria-busy={loading} className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image) => (
          <label className={`cursor-pointer overflow-hidden rounded-lg border p-2 ${selected.has(image.id) ? "border-[var(--brand)] ring-2 ring-[var(--brand)]" : "border-[var(--border)]"}`} key={image.id}>
            <img alt={image.alt_text || image.propertyName} className="aspect-[4/3] w-full rounded object-cover" loading="lazy" src={createClient().storage.from("property-images").getPublicUrl(image.storage_path).data.publicUrl} />
            <span className="mt-2 flex items-start gap-2 text-sm font-semibold">
              <input
                checked={selected.has(image.id)}
                className="mt-1 accent-[var(--brand)]"
                disabled={saving || (!selected.has(image.id) && selected.size >= 24)}
                onChange={() => setSelected((previous) => { const next = new Set(previous); if (next.has(image.id)) next.delete(image.id); else next.add(image.id); return next; })}
                type="checkbox"
              />
              {image.propertyName}
            </span>
            <span className="mt-1 block line-clamp-2 text-xs text-[var(--muted)]">{image.alt_text || "No alt text"}</span>
          </label>
        ))}
      </div>
      {loading ? <p className="mt-3 text-sm" role="status">Loading images...</p> : !images.length && !error ? <p className="mt-3 text-sm">No matching images from other properties.</p> : null}
      <div className="mt-4 flex flex-wrap justify-between gap-3">
        {hasMore ? <Button disabled={loading || saving} onClick={() => void loadMore()} type="button" variant="secondary">Load more</Button> : <span />}
        <Button disabled={disabled || saving || !selected.size} onClick={() => void addSelected()} type="button" variant="primary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? "Adding..." : `Add selected (${selected.size})`}
        </Button>
      </div>
    </ShowMoreDialog>
  );
}

export function PropertyImageLinkDialog({ propertyId, disabled, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function addLink() {
    setSaving(true);
    setError("");
    try {
      const result = await addPropertyImageLinkAction({ propertyId, url });
      if (!result.ok || !result.image) { setError(result.message || "Image could not be added."); return; }
      onAdded([result.image]);
      setUrl("");
      setOpen(false);
      toast.success("Image added from link.");
    } catch { setError("Fetch failed. Check the link and try again."); }
    finally { setSaving(false); }
  }

  return (
    <ShowMoreDialog
      onOpenChange={(next) => { if (!saving) { setOpen(next); setError(""); } }}
      open={open}
      title="Add from link"
      description="Add a direct HTTPS image link. JPEG, PNG or WebP, up to 10 MB."
      trigger={<Button disabled={disabled} type="button" variant="secondary"><Link className="h-4 w-4" />Add from link</Button>}
    >
      <label>
        <span className="cms-label">Image URL</span>
        <Input aria-describedby={error ? "image-link-error" : undefined} aria-invalid={Boolean(error)} disabled={saving} maxLength={4096} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com/photo.jpg" type="url" value={url} />
      </label>
      {error ? <p className="mt-3 text-sm text-red-700" id="image-link-error" role="alert">{error}</p> : null}
      <div className="mt-4 flex justify-end">
        <Button disabled={disabled || saving || !url.trim()} onClick={() => void addLink()} type="button" variant="primary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{saving ? "Adding..." : "Add image"}
        </Button>
      </div>
    </ShowMoreDialog>
  );
}
