import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
});
