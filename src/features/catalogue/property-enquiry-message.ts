/**
 * The WhatsApp message every `/property/[slug]` enquiry CTA sends. One builder
 * keeps the stay card, the "Managed by" card and the mobile enquiry bar in step.
 */
export function buildStayEnquiryMessage({
  checkIn = null,
  checkOut = null,
  guestCount,
  propertyName,
  propertyUrl,
}: {
  checkIn?: string | null;
  checkOut?: string | null;
  guestCount?: number;
  propertyName: string;
  propertyUrl: string;
}) {
  const opening = `Hi CurateMyStay! I'm interested in staying at ${propertyName}.`;

  // Without both dates there is nothing useful to quote, so the message stays
  // short rather than carrying an empty or half-filled date block.
  if (!checkIn || !checkOut) {
    return `${opening}\n\nCould you please share availability and rates?\n\nProperty: ${propertyUrl}\n\nThanks!`;
  }

  return [
    opening,
    "",
    `Check-in: ${checkIn}`,
    `Check-out: ${checkOut}`,
    ...(guestCount ? [`Guests: ${guestCount}`] : []),
    "",
    "Could you please confirm availability for these dates and share the final rate?",
    "",
    `Property: ${propertyUrl}`,
    "",
    "Thanks!",
  ].join("\n");
}
