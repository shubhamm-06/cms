import { z } from "zod";
import {
  AMENITIES,
  APARTMENT_CONFIGURATIONS,
  BEACH_DISTANCES,
  FORECAST_LOCATIONS,
  FURNISHING_STATUSES,
  POOL_TYPES,
  PROPERTY_CATEGORIES,
  VILLA_CONFIGURATIONS,
} from "@/src/features/owner-forecast/forecast-calculator";

export const RENTAL_STATUSES = [
  "No, idle",
  "Yes, long-term",
  "Yes, on Airbnb (self-managed)",
  "Yes, with another agency",
] as const;

export const RESIDENCY_OPTIONS = ["In Goa", "In India (outside Goa)", "Abroad (NRI)"] as const;

export const ownerForecastSchema = z
  .object({
    propertyCategory: z.enum(PROPERTY_CATEGORIES),
    configuration: z.enum(["Studio", "1BHK", "2BHK", "3BHK", "1-2BHK", "4BHK", "5BHK+"]),
    areaSqft: z.coerce.number().min(100, "Enter a practical built-up area.").max(20000, "Enter a practical built-up area."),
    location: z.enum(FORECAST_LOCATIONS),
    beachDistance: z.enum(BEACH_DISTANCES),
    poolType: z.enum(POOL_TYPES),
    amenities: z.array(z.enum(AMENITIES)).max(AMENITIES.length).default([]),
    furnishingStatus: z.enum(FURNISHING_STATUSES),
    currentlyRented: z.enum(RENTAL_STATUSES),
    name: z.string().trim().min(2, "Enter your full name.").max(100),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a valid phone number.")
      .max(24)
      .regex(/^[+0-9()\-\s]+$/, "Enter a valid phone number.")
      .refine((value) => value.replace(/\D/g, "").length >= 7, "Enter a valid phone number."),
    email: z.string().trim().email("Enter a valid email address.").max(254),
    residency: z.enum(RESIDENCY_OPTIONS),
    whatsappInterest: z.boolean().default(false),
  })
  .superRefine((data, context) => {
    const validConfigurations = data.propertyCategory === "Apartment" ? APARTMENT_CONFIGURATIONS : VILLA_CONFIGURATIONS;
    if (!(validConfigurations as readonly string[]).includes(data.configuration)) {
      context.addIssue({
        code: "custom",
        message: `Select a valid ${data.propertyCategory.toLowerCase()} configuration.`,
        path: ["configuration"],
      });
    }

    if (new Set(data.amenities).size !== data.amenities.length) {
      context.addIssue({ code: "custom", message: "Amenities must be unique.", path: ["amenities"] });
    }
  });

export type OwnerForecastRequest = z.infer<typeof ownerForecastSchema>;
