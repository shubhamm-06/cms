"use client";

import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa6";
import { trackWhatsAppClick } from "@/src/lib/analytics";
import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";

const publicMarketingPaths = new Set([
  "/",
  "/about",
  "/booking",
  "/case-studies",
  "/faq",
  "/property-management-proposal",
  "/property-management-goa",
]);

/**
 * Property detail pages (`/property/*`) are deliberately not listed: their own
 * sticky enquiry bar and sticky stay card replace this button there.
 */

export function FloatingWhatsApp() {
  const pathname = usePathname();
  const normalizedPath =
    pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  const whatsappUrl = getPublicWhatsAppUrl();
  const isPublicMarketingPath = publicMarketingPaths.has(normalizedPath);

  if (!isPublicMarketingPath || !whatsappUrl) {
    return null;
  }

  return (
    <a
      aria-label="Chat with CurateMyStay on WhatsApp"
      className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-[70] inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_22px_rgba(9,81,45,0.32)] transition duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-[#128C7E] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none sm:bottom-6 sm:right-6 sm:h-18 sm:w-18"
      href={whatsappUrl}
      onClick={() => trackWhatsAppClick("floating_whatsapp")}
      rel="noopener noreferrer"
      target="_blank"
    >
      <FaWhatsapp 
      aria-hidden="true" 
      className="h-9 w-9 sm:h-10 sm:w-10" 
      fill="white"
      />
    </a>
  );
}
