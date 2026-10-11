import {
  AirVent,
  Car,
  Check,
  ChefHat,
  Dumbbell,
  Footprints,
  PawPrint,
  Refrigerator,
  ShieldCheck,
  ShowerHead,
  Sparkles,
  Trees,
  Tv,
  UtensilsCrossed,
  Waves,
  Wifi,
  BedDouble,
  Laptop,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Icons and categories for free-text amenities on `/property/[slug]`.
 *
 * Admins type amenities as free text, so both maps are keyword lists. They are
 * matched case-insensitively and first match wins, so put the more specific
 * patterns first. Anything unrecognised gets the neutral tick icon and the
 * "Other" category, so nothing an admin enters is ever hidden.
 */

const amenityIcons: Array<[RegExp, LucideIcon]> = [
  [/wi-?fi|internet|broadband/i, Wifi],
  [/pool/i, Waves],
  [/air.?condition|\bac\b|cooling/i, AirVent],
  [/fridge|refrigerat|freezer/i, Refrigerator],
  [/kitchen|stove|cook|microwave/i, ChefHat],
  [/\btv\b|television|netflix/i, Tv],
  [/park|garage|\bcar\b|driver/i, Car],
  [/wash|laundry|dryer/i, Sparkles],
  [/pet|dog|cat/i, PawPrint],
  [/security|cctv|gated|safe|first aid|fire|smoke|extinguisher/i, ShieldCheck],
  [/power|inverter|backup|generator|charging/i, Zap],
  [/workspace|desk|study|work/i, Laptop],
  [/breakfast|dining|chef|restaurant/i, UtensilsCrossed],
  [/bed|linen|mattress/i, BedDouble],
  [/garden|terrace|balcony|outdoor|lawn|sit-?out/i, Trees],
  [/hot water|geyser|shower|bath|toiletr|towel/i, ShowerHead],
  [/gym|fitness/i, Dumbbell],
  [/beach|walk/i, Footprints],
];

export function amenityIcon(amenity: string): LucideIcon {
  return amenityIcons.find(([pattern]) => pattern.test(amenity))?.[1] || Check;
}

/** Category order is the order sections appear in the "all amenities" dialog. */
export const AMENITY_CATEGORIES = [
  "Essentials",
  "Bedroom and bathroom",
  "Kitchen and dining",
  "Entertainment",
  "Work",
  "Outdoor",
  "Parking and access",
  "Safety",
  "Family and pets",
  "Other",
] as const;

export type AmenityCategory = (typeof AMENITY_CATEGORIES)[number];

/** First match wins, so the specific patterns (Safety, Kitchen) sit before broad ones. */
const amenityCategoryRules: Array<[RegExp, AmenityCategory]> = [
  [/security|cctv|gated|safe\b|safety|first.?aid|fire|smoke|carbon monoxide|extinguisher|guard/i, "Safety"],
  [/kitchen|stove|cook|microwave|fridge|refrigerat|freezer|oven|kettle|toaster|dining|utensil|crockery|cutlery|condiment|water purifier|ro water|coffee|breakfast|chef|barbecue|bbq/i, "Kitchen and dining"],
  [/workspace|desk|study|work|office|printer/i, "Work"],
  [/\btv\b|television|netflix|streaming|speaker|music|game|book/i, "Entertainment"],
  [/pool|garden|terrace|balcony|outdoor|lawn|sit-?out|patio|deck|beach|swing|hammock/i, "Outdoor"],
  [/park|garage|\bcar\b|driver|lift|elevator|ramp|entrance|self check/i, "Parking and access"],
  [/pet|dog|cat|crib|cot|high chair|baby|child|kid/i, "Family and pets"],
  [/towel|toiletr|shampoo|soap|hot water|geyser|shower|bath|linen|bed|mattress|pillow|wardrobe|hanger|hair ?dryer|iron/i, "Bedroom and bathroom"],
  [/wi-?fi|internet|broadband|air.?condition|\bac\b|cooling|fan|heater|power|inverter|backup|generator|wash|laundry|dryer|essentials|cleaning|housekeeping|drinking water/i, "Essentials"],
];

export function amenityCategory(amenity: string): AmenityCategory {
  return amenityCategoryRules.find(([pattern]) => pattern.test(amenity))?.[1] || "Other";
}

/** Groups amenities by category in `AMENITY_CATEGORIES` order, keeping admin order inside each. */
export function groupAmenities(amenities: string[]) {
  const groups = new Map<AmenityCategory, string[]>();
  amenities.forEach((amenity) => {
    const category = amenityCategory(amenity);
    groups.set(category, [...(groups.get(category) || []), amenity]);
  });

  return AMENITY_CATEGORIES.filter((category) => groups.has(category)).map((category) => ({
    category,
    items: groups.get(category) || [],
  }));
}
