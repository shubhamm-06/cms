"use client";

import { Share } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getPublicShareUrl, sharePublicPage } from "@/src/features/catalogue/share-public-page";
import { cn } from "@/src/lib/utils/cn";

/**
 * Shares a public page through the Web Share API where the browser offers it
 * (most phones), otherwise copies with a toast or offers manual sharing.
 */
export function ShareButton({
  className,
  iconOnly = false,
  label = "Share",
  title,
  url,
}: {
  className?: string;
  /** Hides the text visually (it stays the accessible name), for round icon buttons. */
  iconOnly?: boolean;
  label?: string;
  title: string;
  url: string;
}) {
  const [manualUrl, setManualUrl] = useState<string | null>(null);
  async function share() {
    const publicUrl = getPublicShareUrl(url);
    const result = await sharePublicPage({ title, text: title, url: publicUrl });
    if (result === "copied") toast.success("Link copied");
    if (result === "manual") setManualUrl(publicUrl);
  }

  return (
    <div className="relative shrink-0">
      <button
        aria-expanded={manualUrl ? true : undefined}
        className={cn(
          "inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-[14.5px] font-semibold text-public-ink underline-offset-4 outline-none transition-colors hover:bg-public-hover focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2",
          className,
        )}
        onClick={() => void share()}
        type="button"
      >
        <Share aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
        <span className={iconOnly ? "sr-only" : "underline"}>{label}</span>
      </button>
      {manualUrl ? (
        <div aria-label="Share this stay" className="absolute right-0 top-full z-20 mt-2 w-[min(280px,calc(100vw-32px))] rounded-xl border border-public-hairline bg-white p-4 text-public-ink shadow-lg" role="dialog">
          <a className="inline-flex min-h-11 items-center rounded-lg px-2 outline-none focus-visible:ring-2 focus-visible:ring-public-coral" href={`https://wa.me/?text=${encodeURIComponent(`${title}\n${manualUrl}`)}`} rel="noopener noreferrer" target="_blank">
            <span className="text-sm font-semibold text-whatsapp">Share on WhatsApp</span>
          </a>
          <input aria-label="Property link" className="mt-2 min-h-11 w-full rounded-lg border border-public-control px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-public-coral" onFocus={(event) => event.currentTarget.select()} readOnly value={manualUrl} />
          <button className="mt-2 min-h-11 rounded-lg px-2 text-sm underline outline-none focus-visible:ring-2 focus-visible:ring-public-coral" onClick={() => setManualUrl(null)} type="button">Close</button>
        </div>
      ) : null}
    </div>
  );
}
