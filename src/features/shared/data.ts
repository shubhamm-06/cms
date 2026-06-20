import "server-only";

import { createClient } from "@/src/lib/supabase/server";
import { requireRole } from "@/src/features/auth/auth-guards";

export async function getAdminData() {
  await requireRole("admin");
  const supabase = await createClient();
  const [profiles, properties, bookings, expenses, payouts, queries, settings] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("properties").select("*").order("created_at", { ascending: false }),
    supabase.from("bookings").select("*").order("check_in", { ascending: false }),
    supabase.from("expenses").select("*").order("date", { ascending: false }),
    supabase.from("owner_payouts").select("*").order("created_at", { ascending: false }),
    supabase.from("owner_queries").select("*").order("created_at", { ascending: false }),
    supabase.from("settings").select("*").order("key"),
  ]);

  return {
    profiles: profiles.data ?? [],
    properties: properties.data ?? [],
    bookings: bookings.data ?? [],
    expenses: expenses.data ?? [],
    payouts: payouts.data ?? [],
    queries: queries.data ?? [],
    settings: settings.data ?? [],
  };
}

export async function getOwnerData() {
  const profile = await requireRole("owner");
  const supabase = await createClient();
  const properties = await supabase.from("properties").select("*").eq("owner_id", profile.id);
  const propertyIds = (properties.data ?? []).map((property) => property.id);

  if (!propertyIds.length) {
    return {
      profile,
      properties: [],
      bookings: [],
      expenses: [],
      payouts: [],
      queries: [],
    };
  }

  const [bookings, expenses, payouts, queries] = await Promise.all([
    supabase.from("bookings").select("*").in("property_id", propertyIds).order("check_in", { ascending: false }),
    supabase
      .from("expenses")
      .select("*")
      .eq("expense_for", "property")
      .in("property_id", propertyIds)
      .order("date", { ascending: false }),
    supabase.from("owner_payouts").select("*").eq("owner_id", profile.id).order("created_at", { ascending: false }),
    supabase.from("owner_queries").select("*").eq("owner_id", profile.id).order("created_at", { ascending: false }),
  ]);

  return {
    profile,
    properties: properties.data ?? [],
    bookings: bookings.data ?? [],
    expenses: expenses.data ?? [],
    payouts: payouts.data ?? [],
    queries: queries.data ?? [],
  };
}
