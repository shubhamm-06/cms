import "server-only";

import { createClient } from "@/src/lib/supabase/server";
import { requireRole } from "@/src/features/auth/auth-guards";

type AdminDataset = "profiles" | "properties" | "bookings" | "expenses" | "payouts" | "queries" | "settings";
type OwnerDataset = "bookings" | "expenses" | "payouts" | "queries";

function checkedRows<T>(result: { data: T[] | null; error: { code?: string } | null }, dataset: string): T[] {
  if (result.error) {
    console.error("Dashboard data read failed", { dataset, code: result.error.code });
    throw new Error("Dashboard data could not be loaded. Please try again.");
  }
  return result.data ?? [];
}

export async function getAdminData(required: readonly AdminDataset[] = ["profiles", "properties", "bookings", "expenses", "payouts", "queries", "settings"]) {
  await requireRole("admin");
  const supabase = await createClient();
  const [profiles, properties, bookings, expenses, payouts, queries, settings] = await Promise.all([
    required.includes("profiles") ? supabase.from("profiles").select("*").order("created_at", { ascending: false }) : null,
    required.includes("properties") ? supabase.from("properties").select("*").order("created_at", { ascending: false }) : null,
    required.includes("bookings") ? supabase.from("bookings").select("*").order("check_in", { ascending: false }) : null,
    required.includes("expenses") ? supabase.from("expenses").select("*").order("date", { ascending: false }) : null,
    required.includes("payouts") ? supabase.from("owner_payouts").select("*").order("created_at", { ascending: false }) : null,
    required.includes("queries") ? supabase.from("owner_queries").select("*").order("created_at", { ascending: false }) : null,
    required.includes("settings") ? supabase.from("settings").select("*").order("key") : null,
  ]);

  return {
    profiles: profiles ? checkedRows(profiles, "profiles") : [],
    properties: properties ? checkedRows(properties, "properties") : [],
    bookings: bookings ? checkedRows(bookings, "bookings") : [],
    expenses: expenses ? checkedRows(expenses, "expenses") : [],
    payouts: payouts ? checkedRows(payouts, "payouts") : [],
    queries: queries ? checkedRows(queries, "queries") : [],
    settings: settings ? checkedRows(settings, "settings") : [],
  };
}

export async function getPropertyImagesForAdmin(propertyId: string) {
  await requireRole("admin");
  const supabase = await createClient();
  const images = await supabase
    .from("property_images")
    .select("*")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return checkedRows(images, "property_images");
}

export async function getOwnerData(required: readonly OwnerDataset[] = ["bookings", "expenses", "payouts", "queries"]) {
  const profile = await requireRole("owner");
  const supabase = await createClient();
  const properties = await supabase.from("properties").select("*").eq("owner_id", profile.id);
  const ownedProperties = checkedRows(properties, "properties");
  const propertyIds = ownedProperties.map((property) => property.id);

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
    required.includes("bookings") ? supabase.from("bookings").select("*").in("property_id", propertyIds).order("check_in", { ascending: false }) : null,
    required.includes("expenses") ? supabase
      .from("expenses")
      .select("*")
      .eq("expense_for", "property")
      .in("property_id", propertyIds)
      .order("date", { ascending: false }) : null,
    required.includes("payouts") ? supabase.from("owner_payouts").select("*").eq("owner_id", profile.id).order("created_at", { ascending: false }) : null,
    required.includes("queries") ? supabase.from("owner_queries").select("*").eq("owner_id", profile.id).order("created_at", { ascending: false }) : null,
  ]);

  return {
    profile,
    properties: ownedProperties,
    bookings: bookings ? checkedRows(bookings, "bookings") : [],
    expenses: expenses ? checkedRows(expenses, "expenses") : [],
    payouts: payouts ? checkedRows(payouts, "payouts") : [],
    queries: queries ? checkedRows(queries, "queries") : [],
  };
}
