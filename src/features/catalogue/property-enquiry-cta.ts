import { isAirbnbListingUrl } from "../../lib/airbnb-url.ts";

/**
 * Decides which enquiry CTAs `/property/[slug]` shows. Only a valid Airbnb listing link on a
 * property that accepts enquiries switches to the WhatsApp + Airbnb layout; every other
 * property keeps the existing WhatsApp + Call layout, and a paused property shows no CTAs.
 */
export function getPropertyEnquiryCtas(acceptBookingRequests: boolean, airbnbListingUrl: string | null | undefined) {
  if (!acceptBookingRequests) return { paused: true, showAirbnb: false, airbnbUrl: null };

  const airbnbUrl = airbnbListingUrl && isAirbnbListingUrl(airbnbListingUrl) ? airbnbListingUrl.trim() : null;

  return { paused: false, showAirbnb: airbnbUrl !== null, airbnbUrl };
}
