const DEFAULT_PUBLIC_WHATSAPP_MESSAGE =
  "Hi CMS - I am interested in property management for my property in Goa.";

export function getPublicWhatsAppUrl(
  message = DEFAULT_PUBLIC_WHATSAPP_MESSAGE,
): string | null {
  const number = (process.env.NEXT_PUBLIC_CMS_WHATSAPP_NUMBER || "").replace(
    /\D/g,
    "",
  );

  return number
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : null;
}
