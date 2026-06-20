import { z } from "zod";

export const propertySchema = z
  .object({
    id: z.string().uuid().optional().or(z.literal("")),
    name: z.string().min(2),
    city: z.string().optional(),
    address: z.string().optional(),
    bedrooms: z.coerce.number().int().nonnegative().optional(),
    owner_id: z.string().uuid().optional().or(z.literal("")),
    owner_share: z.coerce.number().min(0).max(100),
    cms_share: z.coerce.number().min(0).max(100),
    image_url: z.string().optional(),
    status: z.enum(["active", "inactive"]),
  })
  .refine((data) => data.owner_share + data.cms_share === 100, {
    message: "Owner share and CMS share must total 100.",
    path: ["cms_share"],
  });
