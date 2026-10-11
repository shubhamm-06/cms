"use client";

import { Share } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils/cn";

/**
 * Shares a public page through the Web Share API where the browser offers it
 * (most phones), and otherwise copies the link and confirms with a toast.
 */
export function ShareButton({
  className,
  label = "Share",
  title,
  url,
}: {
  className?: string;
  label?: string;
  title: string;
  url: string;
}) {
  async function share() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        // The visitor closed the share sheet; that is not a failure.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy the link. Copy it from the address bar instead.");
    }
  }

  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-[14.5px] font-semibold text-public-ink underline-offset-4 outline-none transition-colors hover:bg-public-hover focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2",
        className,
      )}
      onClick={() => void share()}
      type="button"
    >
      <Share aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
      <span className="underline">{label}</span>
    </button>
  );
}
