import type { AppProfile } from "@/types/app.types";

export function roleRedirectPath(profile: AppProfile | null) {
  if (!profile) return "/login";
  if (profile.status === "pending") return "/pending-approval";
  if (profile.status === "inactive") return "/account-disabled";
  return profile.role === "admin" ? "/dashboard" : "/owner";
}
