"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { loginSchema, signupSchema } from "@/src/lib/validators/auth";
import { roleRedirectPath } from "@/src/features/auth/role-redirect";
import { getCurrentProfile } from "@/src/features/auth/auth-guards";

export type AuthState = {
  message?: string;
  ok?: boolean;
};

export async function loginAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: "Enter a valid email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { message: error.message };

  const profile = await getCurrentProfile();
  redirect(roleRedirectPath(profile));
}

export async function signupAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: "Check the signup fields and try again." };

  const supabase = await createClient();
  const { email, password, name, phone } = parsed.data;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) return { message: error.message };

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email,
      name,
      phone: phone || null,
      role: "owner",
      status: "pending",
      is_protected: false,
    });
  }

  redirect("/pending-approval");
}

export async function googleLoginAction() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error || !data.url) redirect("/login?error=google");
  redirect(data.url);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
