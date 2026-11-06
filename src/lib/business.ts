/** Public facts already stated on the site. Keep public summaries and contact details here. */
export const business = {
  name: "Curate My Stay",
  url: "https://www.curatemystay.net",
  email: "curatemystay@gmail.com",
  contactNumber: (process.env.NEXT_PUBLIC_CMS_WHATSAPP_NUMBER || "").replace(/\D/g, ""),
  area: "Goa",
  country: "India",
  serviceArea: "Goa, India",
  guests: {
    summary: "Curate My Stay offers curated stays in Goa, India, with booking enquiries on WhatsApp.",
    booking: "Our team confirms availability, the final rate and the house rules before a booking or payment.",
    enquiryPolicy: "An enquiry is not a booking. Our team confirms availability, the final rate and the house rules with you before anything is booked or paid.",
  },
  owners: {
    summary: "Curate My Stay manages short-stay villas, apartments and holiday homes in Goa, India, with P&L reporting, payouts and an owner dashboard.",
    start: "Owners can start with a property forecast, request a proposal, contact the team on WhatsApp or book a call.",
    included: [
      "Guest coordination, check-in and check-out",
      "Listing management and dynamic pricing",
      "Housekeeping and property maintenance",
      "Registration and compliance support",
      "Property expense tracking and P&L reporting",
      "Owner payouts and dashboard access",
    ],
  },
  // TODO(public-facts): Add verified official social/profile URLs when supplied. None are present in the repo.
  sameAs: [] as string[],
} as const;

// TODO(public-facts): Configure NEXT_PUBLIC_CMS_WHATSAPP_NUMBER if absent; never substitute a made-up number.
