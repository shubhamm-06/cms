import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

function legacyJwtRole(key: string) {
  const parts = key.split(".");
  if (parts.length !== 3) return null;

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { role?: unknown };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export function hasValidServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key || key.startsWith("sb_publishable_")) return false;
  if (key.startsWith("sb_secret_")) return true;

  return legacyJwtRole(key) === "service_role";
}

// Service role is only for secure server-side code paths such as contact inserts
// when RLS blocks anonymous submissions. Never import this into client components.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || !hasValidServiceRoleKey()) {
    throw new Error("Missing Supabase service role environment variables.");
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
