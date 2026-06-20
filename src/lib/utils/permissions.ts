import type { AppProfile } from "@/types/app.types";
import { PROTECTED_ADMIN_EMAIL } from "@/src/lib/constants/roles";

export function isProtectedAdmin(profile: Pick<AppProfile, "email" | "is_protected">) {
  return profile.is_protected || profile.email.toLowerCase() === PROTECTED_ADMIN_EMAIL;
}
