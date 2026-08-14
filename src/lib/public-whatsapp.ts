const DEFAULT_PUBLIC_WHATSAPP_MESSAGE =
  "Hi CMS - I am interested in property management for my property in Goa.";

/**
 * Digits-only public contact number, or null when it is not configured. This is
 * the single number behind both the WhatsApp links and the `tel:` links, so a
 * caller never has to read the environment variable again.
 */
export function getPublicContactNumber(): string | null {
  const number = (process.env.NEXT_PUBLIC_CMS_WHATSAPP_NUMBER || "").replace(
    /\D/g,
    "",
  );

  return number || null;
}

/** `tel:` link for the public contact number, or null when it is not configured. */
export function getPublicPhoneUrl(): string | null {
  const number = getPublicContactNumber();

  return number ? `tel:+${number}` : null;
}

/**
 * Human-readable form of the public contact number, e.g. "+91 62826 27601".
 * CurateMyStay publishes an Indian number, so that is the only grouping worth
 * special-casing; any other length falls back to plain `+<digits>`.
 */
export function getPublicPhoneDisplay(): string | null {
  const number = getPublicContactNumber();
  if (!number) return null;

  const indian = /^91(\d{5})(\d{5})$/.exec(number);

  return indian ? `+91 ${indian[1]} ${indian[2]}` : `+${number}`;
}

export function getPublicWhatsAppUrl(
  message = DEFAULT_PUBLIC_WHATSAPP_MESSAGE,
): string | null {
  const number = getPublicContactNumber();

  return number
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : null;
}
