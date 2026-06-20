import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Service role is only for secure server-side code paths such as contact inserts
// when RLS blocks anonymous submissions. Never import this into client components.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase service role environment variables.");
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
