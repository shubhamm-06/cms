import { z } from "zod";
import { accountStatuses } from "@/src/lib/constants/statuses";

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(["admin", "owner"]),
  status: z.enum(accountStatuses),
});
