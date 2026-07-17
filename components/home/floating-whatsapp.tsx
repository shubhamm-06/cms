"use client";

import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa6";
import { trackWhatsAppClick } from "@/src/lib/analytics";
import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";

const publicMarketingPaths = new Set([
  "/",
  "/about",
  "/faq",
  "/property-management-proposal",
]);

export function FloatingWhatsApp() {
  const pathname = usePathname();
  const normalizedPath =
    pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  const whatsappUrl = getPublicWhatsAppUrl();

  if (!publicMarketingPaths.has(normalizedPath) || !whatsappUrl) {
    return null;
  }

  return (
    <a
      aria-label="Chat with CurateMyStay on WhatsApp"
      className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-[70] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_22px_rgba(9,81,45,0.32)] transition duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-[#128C7E] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
      href={whatsappUrl}
      onClick={() => trackWhatsAppClick("floating_whatsapp")}
      rel="noopener noreferrer"
      target="_blank"
    >
      <FaWhatsapp 
      aria-hidden="true" 
      className="h-7 w-7 sm:h-8 sm:w-8" 
      fill="white"
      />
    </a>
  );
}
