import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Use a valid email."),
  phone: z.string().optional(),
  message: z.string().min(5, "Tell us a little about the property."),
});
