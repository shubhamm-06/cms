import "server-only";

import { revalidatePath, updateTag } from "next/cache";
import { mutationInvalidationPlan, type BusinessDataset } from "@/src/features/shared/cache-policy";

/** Server Actions only. Call after a confirmed write, before later work can fail. */
export function invalidateBusinessData(...datasets: BusinessDataset[]) {
  const plan = mutationInvalidationPlan(datasets);
  for (const tag of plan.tags) updateTag(tag);
  for (const { path, type } of plan.paths) revalidatePath(path, type);
}
