import { z } from "zod";

export const bookingSchema = z
  .object({
    id: z.string().uuid().optional().or(z.literal("")),
    property_id: z.string().uuid(),
    guest_name: z.string().min(2),
    guest_phone: z.string().optional(),
    source: z.string().optional(),
    check_in: z.string().min(1),
    check_out: z.string().min(1),
    nights: z.coerce.number().int().nonnegative().optional(),
    guests: z.coerce.number().int().nonnegative().optional(),
    nightly_rate: z.coerce.number().nonnegative().optional(),
    total_amount: z.coerce.number().nonnegative(),
    concierge: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.check_out >= data.check_in, {
    message: "Check-out cannot be before check-in.",
    path: ["check_out"],
  });
