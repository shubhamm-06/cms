import { z } from "zod";

export const expenseSchema = z
  .object({
    id: z.string().uuid().optional().or(z.literal("")),
    expense_for: z.enum(["property", "cms"]),
    property_id: z.string().uuid().optional().or(z.literal("")),
    date: z.string().min(1),
    category: z.string().min(1),
    amount: z.coerce.number().nonnegative(),
    vendor: z.string().optional(),
    note: z.string().optional(),
  })
  .refine((data) => data.expense_for === "cms" || Boolean(data.property_id), {
    message: "Property is required for property expenses.",
    path: ["property_id"],
  })
  .refine((data) => data.expense_for === "property" || !data.property_id, {
    message: "CMS expenses cannot have a property.",
    path: ["property_id"],
  });
