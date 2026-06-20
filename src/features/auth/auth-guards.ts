import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import type { AppProfile, UserRole } from "@/types/app.types";
import { roleRedirectPath } from "@/src/features/auth/role-redirect";

export async function getCurrentProfile(): Promise<AppProfile | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id,email,name,phone,role,status,avatar_url,is_protected")
    .eq("id", user.id)
    .maybeSingle();

  if (data) return data;

  const email = user.email || "";
  const fallback = {
    id: user.id,
    email,
    name: user.user_metadata?.name ?? null,
    phone: user.user_metadata?.phone ?? null,
    role: "owner" as const,
    status: "pending" as const,
    avatar_url: null,
    is_protected: false,
  };

  // Public signups become pending owners. RLS should allow only this safe insert.
  await supabase.from("profiles").upsert(fallback, { onConflict: "id" });
  return fallback;
}

export async function requireProfile() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "active") redirect(roleRedirectPath(profile));
  return profile;
}

export async function requireRole(role: UserRole) {
  const profile = await requireProfile();
  if (profile.role !== role) redirect(role === "admin" ? "/owner" : "/dashboard");
  return profile;
}
