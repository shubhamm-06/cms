"use client";

import { createContext, useContext, useState, type MouseEvent, type ReactNode } from "react";
import { buildStayEnquiryMessage, toDateInputValue, validateStayDates } from "@/src/features/catalogue/property-enquiry-message";
import { trackWhatsAppClick } from "@/src/lib/analytics";
import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";

type StayEnquiry = {
  checkIn: string;
  checkOut: string;
  guestCount: number;
  error: ReturnType<typeof validateStayDates>;
  setCheckIn: (value: string) => void;
  setCheckOut: (value: string) => void;
  setGuestCount: (value: number) => void;
  whatsappUrl: string | null;
  handleWhatsAppClick: (event: MouseEvent<HTMLAnchorElement>, location: string) => void;
};

const EnquiryContext = createContext<StayEnquiry | null>(null);

export function PropertyEnquiryProvider({ children, maxGuests, propertyName, propertyUrl }: {
  children: ReactNode;
  maxGuests: number | null;
  propertyName: string;
  propertyUrl: string;
}) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState(Math.min(2, maxGuests && maxGuests > 0 ? maxGuests : 10));
  const [attempted, setAttempted] = useState(false);
  const error = attempted ? validateStayDates(checkIn, checkOut) : null;
  const whatsappUrl = getPublicWhatsAppUrl(buildStayEnquiryMessage({ checkIn, checkOut, guestCount, propertyName, propertyUrl }));

  function handleWhatsAppClick(event: MouseEvent<HTMLAnchorElement>, location: string) {
    const validation = validateStayDates(checkIn, checkOut, toDateInputValue(new Date()));
    if (validation) {
      event.preventDefault();
      setAttempted(true);
      // The page renders a desktop card, a tablet card and a mobile date section; only use the
      // visible one. A card focuses the missing date input; the mobile calendar has no inputs,
      // so it focuses its own `data-stay-focus` target instead.
      const card = Array.from(document.querySelectorAll<HTMLElement>("[data-stay-enquiry-card]")).find((element) => element.getClientRects().length > 0);
      const target =
        card?.querySelector<HTMLElement>(`[data-stay-date="${validation.field}"]`) ?? card?.querySelector<HTMLElement>("[data-stay-focus]");
      card?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
      target?.focus({ preventScroll: true });
      if (target instanceof HTMLInputElement) {
        try {
          target.showPicker?.();
        } catch {
          // Some browsers prohibit programmatic pickers; the focused native input remains usable.
        }
      }
      return;
    }
    trackWhatsAppClick(location);
  }

  return (
    <EnquiryContext.Provider value={{ checkIn, checkOut, guestCount, error, setCheckIn, setCheckOut, setGuestCount, whatsappUrl, handleWhatsAppClick }}>
      {children}
    </EnquiryContext.Provider>
  );
}

export function usePropertyEnquiry() {
  const context = useContext(EnquiryContext);
  if (!context) throw new Error("Property enquiry controls require PropertyEnquiryProvider.");
  return context;
}
