/** Prefilled WhatsApp text for the guest header's general "WhatsApp Us" button. */
export function buildGuestHeaderWhatsAppMessage(propertyName?: string | null) {
  const name = propertyName?.trim();

  return name
    ? `Hi! I’m interested in ${name} in Goa. Could you help me with availability and pricing?`
    : "Hi! I’m looking for a stay in Goa. Could you help me find a suitable property?";
}
