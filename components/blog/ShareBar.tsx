"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";
import { trackWhatsAppClick } from "@/src/lib/analytics";

const focus = "rounded-md p-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-coral";

export function ShareBar() {
  const [copied, setCopied] = useState(false);
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch { setCopied(false); }
  }
  const shareUrl = getPublicWhatsAppUrl("Hi, I found this Goa New Year villa booking guide: https://www.curatemystay.net/blog/last-minute-villa-goa-new-year-2027");
  return <div className="flex min-h-12 items-center justify-between border-y border-neutral-200 py-2">
    <button aria-label={copied ? "Link copied" : "Copy article link"} className={focus} onClick={copyLink} type="button">{copied ? <Check aria-hidden="true" className="mr-1 inline h-4 w-4" /> : <Copy aria-hidden="true" className="mr-1 inline h-4 w-4" />}{copied ? "Copied" : "Copy link"}</button>
    <span aria-live="polite" className="sr-only">{copied ? "Link copied" : ""}</span>
    {shareUrl ? <a aria-label="Share article on WhatsApp" className={focus} href={shareUrl} onClick={() => trackWhatsAppClick("blog_share")} rel="noreferrer" target="_blank"><Share2 aria-hidden="true" className="mr-1 inline h-4 w-4" />Share on WhatsApp</a> : null}
  </div>;
}
