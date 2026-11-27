/**
 * Copy and property slugs for section 2 of `/corporate-offsite-villas-goa`.
 * Photos and property names are not here: they come from the public catalogue and
 * gallery views. The option ids are the targets of the hero finder's `#bogmalo`,
 * `#panjim` and `#villas` links.
 */

export type StayOptionId = "bogmalo" | "panjim" | "villas";

export type StayPointIcon =
  | "ac" | "airport" | "art" | "balcony" | "beach" | "bed" | "bookingRule" | "breezy" | "building"
  | "caretaker" | "glass" | "guests" | "keyCard" | "library" | "lift" | "parking" | "place" | "pool"
  | "power" | "restaurants" | "sea" | "seaView" | "sofa" | "staff" | "tea" | "villa" | "wifi" | "workTable";

/** `note` sits at the right of the line, `detail` under the label. Both are muted. */
export type StayPoint = { icon: StayPointIcon; label: string; note?: string; detail?: string };

/**
 * Which gallery photo a feature row shows. `category` is the room prefix of the photo's
 * caption (`Exterior | ...`). `preferred` is the start of one photo's file name; when that
 * photo is no longer published the row falls back to the first unused photo of the category.
 */
export type StayFeaturePhoto = { category: string; preferred?: string };

export type StayFeature = {
  id: string;
  title: string;
  points: StayPoint[];
  /** One muted line under a hairline, after the points. */
  footnote?: string;
  photo: StayFeaturePhoto;
  /** Caption keywords used to assign public gallery photos to this feature row. */
  include: string[];
  exclude: string[];
  /** Shows the links to each studio under this row. */
  showStudioLinks?: boolean;
};

export type StayOption = {
  id: StayOptionId;
  /** Used in the WhatsApp message, so it stays stable for whoever reads the enquiries. */
  title: string;
  slugs: string[];
};

export type SmallerStayOption = StayOption & { points: StayPoint[] };

export const stayOptionsCopy = {
  eyebrow: "CASA VERDE, BOGMALO",
  heading: "Perks of our home",
  subhead: "Six private studios in one building, made for teams of up to 12.",
  propertyChips: ["6 studios", "Sleeps up to 12", "7 min to Dabolim Airport", "3.3 km to Bogmalo Beach"],
  whyTeams: [
    { label: "Everyone under one roof", note: "6 studios, up to 12 guests", icon: "building" },
    { label: "Work and stay in one place", note: "Own Wi-Fi, work table, glass lounge", icon: "laptop" },
    { label: "No other guests in the building", note: "Your team, your space", icon: "users" },
    { label: "One booking, one GST invoice", note: "Quote on WhatsApp", icon: "receipt" },
  ],
  smallerTeamsHeading: "For smaller teams",
  studiosLabel: "Studios in this building",
  enquiryLabel: "Ask about this stay",
  enquiryMessage: (title: string) => `Hi, we are planning a team offsite in Goa and are interested in: ${title}.`,
};

export const bogmaloOption: StayOption = {
  id: "bogmalo",
  title: "The full building in Bogmalo",
  slugs: [
    "breezy-balcony-studio-bogmalo",
    "casa-verde-airport-side-studio-bogmalo",
    "casa-verde-cozy-studio-bogmalo",
    "casa-verde-sea-view-suite-bogmalo",
    "casa-verde-upper-floor-sea-view-suite-bogmalo",
    "terrace-studio-bogmalo",
  ],
};

export const bogmaloChapter = {
  features: [
    {
      id: "own-building",
      title: "A building of your own",
      points: [
        { icon: "building", label: "6 private studios in one building" },
        { icon: "guests", label: "Sleeps up to 12" },
        { icon: "caretaker", label: "Caretaker on site" },
        { icon: "keyCard", label: "Key-card entry" },
        { icon: "lift", label: "Lift to every floor" },
        { icon: "parking", label: "Parking at the gate" },
      ],
      photo: { category: "Exterior", preferred: "5381c6d2" },
      include: ["exterior", "building", "facade", "entrance", "outside", "balcony view"],
      exclude: ["bedroom", "bathroom", "kitchen"],
    },
    {
      id: "glass-lounge",
      title: "The glass lounge",
      points: [
        { icon: "ac", label: "Double-height and air-conditioned" },
        { icon: "glass", label: "Floor-to-ceiling glass" },
        { icon: "library", label: "Reading library" },
        { icon: "art", label: "Original art and plants" },
        { icon: "sofa", label: "Sofa seating" },
        { icon: "sea", label: "Open deck, sea in the distance" },
      ],
      photo: { category: "Common area", preferred: "f282add4" },
      include: ["lounge", "library", "living", "common", "deck", "terrace", "seating"],
      exclude: ["bathroom", "bedroom"],
    },
    {
      id: "studios",
      title: "Six studios, four styles",
      points: [
        { icon: "bed", label: "Cozy Studio", note: "x2" },
        { icon: "breezy", label: "Breezy Balcony Studio", note: "x1" },
        { icon: "balcony", label: "King Studio with Balcony", note: "x1" },
        { icon: "seaView", label: "Sea View Suite", note: "x2", detail: "largest rooms, seating area" },
      ],
      footnote: "Every studio: king bed, attached bath with hot water, AC, TV, mini fridge and kettle",
      photo: { category: "Bedroom", preferred: "07f9a37b" },
      include: ["bedroom", "room", "suite", "studio", "balcony"],
      exclude: ["bathroom", "toilet", "washroom", "kitchen", "exterior"],
      showStudioLinks: true,
    },
    {
      id: "work-ready",
      title: "Work-ready, looked after",
      points: [
        { icon: "wifi", label: "Own Wi-Fi in every studio" },
        { icon: "workTable", label: "Work table in every studio" },
        { icon: "power", label: "Full power back-up" },
        { icon: "tea", label: "Tea, coffee and toiletries in every studio" },
        { icon: "staff", label: "Housekeeping and cooking staff" },
        { icon: "airport", label: "7 min to Dabolim Airport" },
      ],
      photo: { category: "Bedroom", preferred: "cb740921" },
      include: ["bedroom", "work", "desk", "table", "room"],
      exclude: ["bathroom", "toilet", "washroom", "shower", "kitchen", "exterior"],
    },
  ] satisfies StayFeature[],
};

export const panjimOption: SmallerStayOption = {
  id: "panjim",
  title: "Two apartments in Panjim",
  points: [
    { icon: "building", label: "2 x 2 BHK apartments" },
    { icon: "guests", label: "Sleeps up to 8" },
    { icon: "pool", label: "Shared pool" },
    { icon: "beach", label: "800 m to Miramar Beach" },
    { icon: "restaurants", label: "Restaurants nearby" },
  ],
  slugs: ["2bhk-modern-suite-panjim", "2bhk-suite-panjim"],
};

export const villasOption: SmallerStayOption = {
  id: "villas",
  title: "3 BHK villas in South Goa",
  points: [
    { icon: "villa", label: "3 BHK villa" },
    { icon: "guests", label: "Sleeps 8 per villa" },
    { icon: "bookingRule", label: "Booked one at a time, not combined" },
    { icon: "place", label: "Varca, 700 m to the beach" },
    { icon: "place", label: "Majorda, 2 km to the beach" },
  ],
  slugs: ["3bhk-villa-varca-pool-south-goa", "3bhk-villa-majorda-shared-pool"],
};

export type BookingStepIcon = "confirm" | "invoice" | "message" | "pay";

/** Copy for section 4, "how to book". The button label is the hero's. */
export const howToBook: {
  heading: string;
  subline: string;
  steps: { icon: BookingStepIcon; title: string; line: string }[];
  phoneLabel: string;
} = {
  heading: "Get a quote in one message",
  subline: "Rates vary by season and stay length, so we quote each offsite directly.",
  steps: [
    { icon: "message", title: "Message us on WhatsApp", line: "Share your dates, team size and location." },
    { icon: "confirm", title: "We confirm and quote", line: "Availability and rate, sent on WhatsApp." },
    { icon: "pay", title: "Make your payment", line: "Bank transfer or UPI. Company payments welcome." },
    { icon: "invoice", title: "Get your GST invoice", line: "Emailed with your written booking confirmation." },
  ],
  phoneLabel: "WhatsApp",
};

export const stayOptionsFaqCopy = {
  heading: "Questions teams ask",
  subline: "Can't find yours? Message us on WhatsApp.",
};

export const faqs = [
  { question: "How many people can stay?", answer: "Up to 12 in the Bogmalo building. Up to 8 in the two Panjim apartments. Each South Goa villa sleeps 8 and is booked on its own." },
  { question: "Do we get the whole building to ourselves?", answer: "In Bogmalo, yes. All six studios are in one building and no other guests stay there during your offsite." },
  { question: "Is there Wi-Fi and a place to work?", answer: "Every studio has its own Wi-Fi and a work table. The glass-walled lounge works for group sessions and calls." },
  { question: "Can you issue a GST invoice?", answer: "Yes. We email a GST invoice with your written booking confirmation. You can pay by bank transfer or UPI." },
  { question: "How much does a team offsite cost?", answer: "It depends on the property, the season and the number of nights. Message us your dates and team size on WhatsApp and we will send a quote." },
  { question: "What about food?", answer: "Plenty of good eateries are right outside Casa Verde, so lunch and dinner need no planning." },
  { question: "Where is the Bogmalo building?", answer: "On the airport side of South Goa, 3.4 km (about 7 minutes) from Dabolim Airport and 3.3 km from Bogmalo Beach." },
  { question: "Which option is best for a team of 10?", answer: "The Bogmalo building. It sleeps up to 12 and keeps everyone under one roof, with workspace and a common lounge." },
];

export type WhyUsPointIcon = "chat" | "food" | "plane";

/** Copy for section 3, the dark "why teams choose us" band. */
export const whyUs: {
  eyebrow: string;
  heading: string;
  stats: { value: string; label: string; star?: boolean }[];
  points: { icon: WhyUsPointIcon; title: string; line: string }[];
} = {
  eyebrow: "WHY TEAMS CHOOSE US",
  heading: "Built for a team that needs to get things done",
  stats: [
    { value: "4.9+", label: "rating on Airbnb", star: true },
    { value: "230+", label: "five-star reviews" },
    { value: "300+", label: "stays hosted" },
  ],
  points: [
    { icon: "food", title: "Good food at your doorstep", line: "Plenty of eateries right outside. Nothing to arrange." },
    { icon: "chat", title: "A hands-on team", line: "Managed by our own team. Talk to us directly on WhatsApp." },
    { icon: "plane", title: "Easy arrival", line: "7 minutes from Dabolim Airport, with parking at the gate." },
  ],
};
