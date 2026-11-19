"use client";

import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";
import { trackWhatsAppClick } from "@/src/lib/analytics";

export function InlineWhatsAppLink({ children }: { children: React.ReactNode }) {
  const url = getPublicWhatsAppUrl("Hi, I’m looking for a villa in Goa for New Year. Dates: ___, guests: ___.");
  return url ? <a className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-coral" href={url} onClick={() => trackWhatsAppClick("blog_article_body")} rel="noreferrer" target="_blank">{children}</a> : <>{children}</>;
}
