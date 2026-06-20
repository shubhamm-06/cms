import { z } from "zod";
import { payoutStatuses } from "@/src/lib/constants/statuses";

export const payoutSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  property_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  month: z.string().min(3),
  revenue_total: z.coerce.number().nonnegative(),
  expense_total: z.coerce.number().nonnegative(),
  net_profit: z.coerce.number(),
  owner_share_amount: z.coerce.number(),
  cms_share_amount: z.coerce.number(),
  tds_amount: z.coerce.number().nonnegative(),
  final_payout_amount: z.coerce.number(),
  status: z.enum(payoutStatuses),
  admin_note: z.string().optional(),
});
