"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { requireProfile, requireRole } from "@/src/features/auth/auth-guards";
import { getBookingStatus } from "@/src/features/bookings/booking-calculations";
import { bookingSchema } from "@/src/lib/validators/bookings";
import { expenseSchema } from "@/src/lib/validators/expenses";
import { profileSchema } from "@/src/lib/validators/profile";
import { propertySchema } from "@/src/lib/validators/properties";
import { userSchema } from "@/src/lib/validators/users";
import { isProtectedAdmin } from "@/src/lib/utils/permissions";
import { isPayoutReviewWindow } from "@/src/lib/utils/dates";
import type { Database } from "@/types/database.types";

function emptyToNull<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value === "" ? null : value])) as T;
}

export async function saveProfileAction(formData: FormData) {
  const profile = await requireProfile();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase.from("profiles").update(emptyToNull(parsed.data)).eq("id", profile.id);
  revalidatePath(profile.role === "admin" ? "/dashboard/profile" : "/owner/profile");
}

export async function updateUserAction(formData: FormData) {
  await requireRole("admin");
  const parsed = userSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const supabase = await createClient();
  const { id, ...values } = parsed.data;
  const current = await supabase.from("profiles").select("email,is_protected").eq("id", id).maybeSingle();
  const data = current.data && isProtectedAdmin(current.data) ? { ...values, role: "admin" as const, status: "active" as const } : values;
  await supabase.from("profiles").update(emptyToNull(data)).eq("id", id);
  revalidatePath("/dashboard/users");
}

export async function deleteUserAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  const supabase = await createClient();
  const current = await supabase.from("profiles").select("email,is_protected").eq("id", id).maybeSingle();
  // Protected admin deletion is blocked here as well as hidden in the UI.
  if (!current.data || isProtectedAdmin(current.data)) return;
  await supabase.from("profiles").delete().eq("id", id);
  revalidatePath("/dashboard/users");
}

export async function savePropertyAction(formData: FormData) {
  await requireRole("admin");
  const parsed = propertySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { id, ...values } = emptyToNull(parsed.data);
  const supabase = await createClient();
  if (id) await supabase.from("properties").update(values).eq("id", id);
  else await supabase.from("properties").insert(values);
  revalidatePath("/dashboard/properties");
  revalidatePath("/dashboard");
}

export async function deletePropertyAction(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("properties").delete().eq("id", String(formData.get("id") || ""));
  revalidatePath("/dashboard/properties");
}

export async function saveBookingAction(formData: FormData) {
  await requireRole("admin");
  const parsed = bookingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { id, concierge, ...rest } = emptyToNull(parsed.data);
  const payload = {
    ...rest,
    status: getBookingStatus(rest.check_in, rest.check_out),
    concierge: typeof concierge === "string" && concierge ? concierge.split(",").map((item) => item.trim()).filter(Boolean) : [],
  };
  const supabase = await createClient();
  if (id) await supabase.from("bookings").update(payload).eq("id", id);
  else await supabase.from("bookings").insert(payload);
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
}

export async function deleteBookingAction(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("bookings").delete().eq("id", String(formData.get("id") || ""));
  revalidatePath("/dashboard/bookings");
}

export async function saveExpenseAction(formData: FormData) {
  await requireRole("admin");
  const parsed = expenseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { id, ...data } = emptyToNull(parsed.data);
  const supabase = await createClient();
  if (data.expense_for === "property") {
    const property = await supabase.from("properties").select("id").eq("id", String(data.property_id || "")).maybeSingle();
    if (!property.data) return;
  }
  // CMS expenses intentionally have no property_id; owners only read property expenses.
  const payload: Database["public"]["Tables"]["expenses"]["Insert"] =
    data.expense_for === "cms" ? { ...data, property_id: null } : data;
  if (id) await supabase.from("expenses").update(payload).eq("id", id);
  else await supabase.from("expenses").insert(payload);
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/pnl");
}

export async function deleteExpenseAction(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("expenses").delete().eq("id", String(formData.get("id") || ""));
  revalidatePath("/dashboard/expenses");
}

export async function resolveQueryAction(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  const query = await supabase.from("owner_queries").select("id,payout_id").eq("id", id).maybeSingle();
  await supabase
    .from("owner_queries")
    .update({ resolved: true, status: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", id);

  if (query.data?.payout_id) {
    await supabase
      .from("owner_payouts")
      .update({ status: "resolved" })
      .eq("id", query.data.payout_id)
      .eq("status", "query_raised");
  }

  revalidatePath("/dashboard/queries");
  revalidatePath("/dashboard/payouts");
  revalidatePath("/owner/payout");
}

export async function deleteOwnerQueryAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  if (!id) redirect("/dashboard/queries?error=missing-query");

  const supabase = await createClient();
  const query = await supabase.from("owner_queries").select("id,payout_id").eq("id", id).maybeSingle();
  if (!query.data) redirect("/dashboard/queries?error=query-not-found");

  let restoredPayout: { approved_at: string | null; id: string } | null = null;
  if (query.data.payout_id) {
    const payout = await supabase
      .from("owner_payouts")
      .select("id,status,approved_at")
      .eq("id", query.data.payout_id)
      .maybeSingle();

    if (payout.data?.status === "query_raised") {
      const inReviewWindow = isPayoutReviewWindow();
      const restored = await supabase
        .from("owner_payouts")
        .update({
          status: inReviewWindow ? "ready_for_review" : "approved",
          approved_at: inReviewWindow ? payout.data.approved_at : payout.data.approved_at || new Date().toISOString(),
        })
        .eq("id", payout.data.id)
        .eq("status", "query_raised");
      if (restored.error) redirect("/dashboard/queries?error=payout-restore-failed");
      restoredPayout = { approved_at: payout.data.approved_at, id: payout.data.id };
    }
  }

  const deleted = await supabase.from("owner_queries").delete().eq("id", id);
  if (deleted.error) {
    if (restoredPayout) {
      await supabase
        .from("owner_payouts")
        .update({ status: "query_raised", approved_at: restoredPayout.approved_at })
        .eq("id", restoredPayout.id);
    }
    redirect("/dashboard/queries?error=delete-failed");
  }

  revalidatePath("/dashboard/queries");
  revalidatePath("/dashboard/payouts");
  revalidatePath("/owner/payout");
  revalidatePath("/owner/queries");
  redirect("/dashboard/queries?deleted=1");
}

export async function createOwnerQueryAction(formData: FormData) {
  const profile = await requireRole("owner");
  const message = String(formData.get("message") || "").trim();
  if (!message) return;
  const property_id = String(formData.get("property_id") || "") || null;
  const supabase = await createClient();
  if (property_id) {
    const property = await supabase
      .from("properties")
      .select("id")
      .eq("id", property_id)
      .eq("owner_id", profile.id)
      .maybeSingle();
    if (!property.data) return;
  }
  await supabase.from("owner_queries").insert({ owner_id: profile.id, property_id, message });
  revalidatePath("/owner/queries");
}

export async function saveSettingsAction(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  const keys = ["booking_sources", "expense_categories", "concierge_options"];
  await Promise.all(
    keys.map((key) =>
      supabase.from("settings").upsert(
        {
          key,
          value: String(formData.get(key) || "")
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
        },
        { onConflict: "key" },
      ),
    ),
  );
  revalidatePath("/dashboard/settings");
}
