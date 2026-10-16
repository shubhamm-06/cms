"use server";

import { invalidateBusinessData } from "@/src/features/shared/cache-invalidation";
import { redirect } from "next/navigation";
import { requireRole } from "@/src/features/auth/auth-guards";
import {
  calculateBreakupsForOwnerMonth,
  calculateOwnerCombinedPayout,
  calculatePreviousCarryForward,
} from "@/src/features/payouts/payout-calculations";
import { sendOwnerQueryAdminEmail } from "@/src/features/queries/owner-query-email";
import { createClient } from "@/src/lib/supabase/server";
import {
  getMonthRange,
  getPreviousMonthKey,
  isAfterPayoutReviewWindow,
  isPayoutReviewWindow,
} from "@/src/lib/utils/dates";
import type { Database } from "@/types/database.types";

type PayoutStatus = Database["public"]["Tables"]["owner_payouts"]["Row"]["status"];
type PayoutInsert = Database["public"]["Tables"]["owner_payouts"]["Insert"];
type PayoutUpdate = Database["public"]["Tables"]["owner_payouts"]["Update"];

const OWNER_ACTION_STATUSES: PayoutStatus[] = ["approved", "query_raised", "resolved", "paid"];
const RECALCULATABLE_STATUSES: PayoutStatus[] = ["draft", "ready_for_review"];

function postgresErrorCode(error: unknown) {
  return error && typeof error === "object" && "code" in error ? String(error.code || "") : undefined;
}

function logSafePayoutFailure(action: string, error: unknown, context: Record<string, string>) {
  console.error("Payout action failed", { action, code: postgresErrorCode(error), ...context });
}

async function updateRecalculatablePayout(
  supabase: Awaited<ReturnType<typeof createClient>>,
  payoutId: string,
  payload: PayoutUpdate,
) {
  return supabase
    .from("owner_payouts")
    .update(payload)
    .eq("id", payoutId)
    .in("status", RECALCULATABLE_STATUSES)
    .select("id")
    .maybeSingle();
}

async function ensurePayoutsForPreviousMonth(ownerId?: string) {
  const supabase = await createClient();
  const monthKey = getPreviousMonthKey();
  const { start, end } = getMonthRange(monthKey);

  let ownersQuery = supabase
    .from("profiles")
    .select("*")
    .eq("role", "owner")
    .eq("status", "active");

  if (ownerId) ownersQuery = ownersQuery.eq("id", ownerId);

  const ownersResult = await ownersQuery;
  if (ownersResult.error) {
    logSafePayoutFailure("load-owners", ownersResult.error, { ownerId: ownerId || "all" });
    return;
  }
  const owners = ownersResult.data ?? [];
  const ownerIds = owners.map((owner) => owner.id);

  if (!ownerIds.length) return;

  const propertiesResult = await supabase
    .from("properties")
    .select("*")
    .eq("status", "active")
    .in("owner_id", ownerIds);
  if (propertiesResult.error) {
    logSafePayoutFailure("load-properties", propertiesResult.error, { ownerId: ownerId || "all" });
    return;
  }
  const properties = propertiesResult.data ?? [];
  const propertyIds = properties.map((property) => property.id);

  if (!propertyIds.length) return;

  const [bookingsResult, expensesResult, payoutsResult] = await Promise.all([
    supabase
      .from("bookings")
      .select("*")
      .in("property_id", propertyIds)
      .lt("check_in", end)
      .gt("check_out", start),
    supabase
      .from("expenses")
      .select("*")
      .eq("expense_for", "property")
      .in("property_id", propertyIds)
      .gte("date", start)
      .lt("date", end),
    supabase.from("owner_payouts").select("*").in("owner_id", ownerIds),
  ]);

  if (bookingsResult.error || expensesResult.error || payoutsResult.error) {
    logSafePayoutFailure("load-calculation-inputs", bookingsResult.error || expensesResult.error || payoutsResult.error, {
      ownerId: ownerId || "all",
    });
    return;
  }

  const bookings = bookingsResult.data ?? [];
  const expenses = expensesResult.data ?? [];
  const payouts = payoutsResult.data ?? [];
  const now = new Date();

  for (const owner of owners) {
    const ownerProperties = properties.filter((property) => property.owner_id === owner.id);
    const representativeProperty = ownerProperties[0];
    if (!representativeProperty) continue;

    const ownerPayouts = payouts.filter((payout) => payout.owner_id === owner.id);
    const existing = ownerPayouts.find((payout) => payout.month === monthKey);
    if (existing && OWNER_ACTION_STATUSES.includes(existing.status)) continue;
    if (existing && !RECALCULATABLE_STATUSES.includes(existing.status)) continue;

    const propertyBreakups = calculateBreakupsForOwnerMonth({
      ownerId: owner.id,
      monthKey,
      properties: ownerProperties,
      bookings,
      expenses,
    });
    const previousCarryForward = calculatePreviousCarryForward({
      payouts: ownerPayouts,
      beforeMonth: monthKey,
    });
    const combined = calculateOwnerCombinedPayout({
      propertyBreakups,
      previousCarryForward,
    });
    const autoApprove = isAfterPayoutReviewWindow(now);
    const status: PayoutStatus = autoApprove ? "approved" : isPayoutReviewWindow(now) ? "ready_for_review" : "draft";
    const payload: PayoutUpdate = {
      property_id: representativeProperty.id,
      owner_id: owner.id,
      month: monthKey,
      revenue_total: combined.revenue_total,
      expense_total: combined.expense_total,
      net_profit: combined.adjusted_net_profit,
      owner_share_amount: combined.owner_share_amount,
      cms_share_amount: combined.cms_share_amount,
      tds_amount: combined.tds_amount,
      final_payout_amount: combined.final_payout_amount,
      status,
      approved_at: autoApprove ? now.toISOString() : null,
      owner_note: autoApprove ? "Auto-approved after payout review window ended." : null,
    };

    if (existing) {
      const updated = await updateRecalculatablePayout(supabase, existing.id, payload);
      if (updated.error) {
        logSafePayoutFailure("refresh-existing", updated.error, { month: monthKey, ownerId: owner.id });
      }
      continue;
    }

    const newPayout: PayoutInsert = {
      ...payload,
      property_id: representativeProperty.id,
      owner_id: owner.id,
      month: monthKey,
    };
    const inserted = await supabase.from("owner_payouts").insert(newPayout);
    if (!inserted.error) continue;

    if (postgresErrorCode(inserted.error) !== "23505") {
      logSafePayoutFailure("create", inserted.error, { month: monthKey, ownerId: owner.id });
      continue;
    }

    // Once the manual owner_id + month unique index exists, a concurrent page
    // load can win the insert. Reload that row and refresh it only while it is
    // still in a recalculatable state.
    const concurrent = await supabase
      .from("owner_payouts")
      .select("id,status")
      .eq("owner_id", owner.id)
      .eq("month", monthKey)
      .maybeSingle();
    if (concurrent.error || !concurrent.data) {
      logSafePayoutFailure("reload-after-conflict", concurrent.error, { month: monthKey, ownerId: owner.id });
      continue;
    }
    if (RECALCULATABLE_STATUSES.includes(concurrent.data.status)) {
      const refreshed = await updateRecalculatablePayout(supabase, concurrent.data.id, payload);
      if (refreshed.error) {
        logSafePayoutFailure("refresh-after-conflict", refreshed.error, { month: monthKey, ownerId: owner.id });
      }
    }
  }
}

export async function ensureAdminPayoutsForPreviousMonth() {
  await requireRole("admin");
  await ensurePayoutsForPreviousMonth();
}

export async function ensureOwnerPayoutForPreviousMonth() {
  const profile = await requireRole("owner");
  await ensurePayoutsForPreviousMonth(profile.id);
}

export async function approveOwnerPayoutAction(formData: FormData) {
  const profile = await requireRole("owner");
  if (!isPayoutReviewWindow()) redirect("/owner/payout?notice=owner_payout_action_unavailable");

  const id = String(formData.get("id") || "");
  const ownerNote = String(formData.get("owner_note") || "").trim() || null;
  const supabase = await createClient();
  const payout = await supabase
    .from("owner_payouts")
    .select("id,owner_id,status")
    .eq("id", id)
    .eq("owner_id", profile.id)
    .maybeSingle();

  if (payout.error || payout.data?.status !== "ready_for_review") {
    redirect("/owner/payout?notice=owner_payout_action_unavailable");
  }

  const updated = await supabase
    .from("owner_payouts")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      owner_note: ownerNote,
    })
    .eq("id", id)
    .eq("owner_id", profile.id)
    .eq("status", "ready_for_review")
    .select("id")
    .maybeSingle();
  if (updated.error || !updated.data) redirect("/owner/payout?notice=owner_payout_action_failed");

  invalidateBusinessData("payouts");
  redirect("/owner/payout?notice=owner_payout_approved");
}

export async function raisePayoutQueryAction(formData: FormData) {
  const profile = await requireRole("owner");
  if (!isPayoutReviewWindow()) redirect("/owner/payout?notice=owner_payout_action_unavailable");

  const id = String(formData.get("id") || "");
  const message = String(formData.get("message") || "").trim();
  if (!id || !message) redirect("/owner/payout?notice=owner_payout_action_failed");

  const supabase = await createClient();
  const payout = await supabase
    .from("owner_payouts")
    .select("id,owner_id,property_id,status,owner_note")
    .eq("id", id)
    .eq("owner_id", profile.id)
    .maybeSingle();

  if (payout.error || payout.data?.status !== "ready_for_review") {
    redirect("/owner/payout?notice=owner_payout_action_unavailable");
  }

  const property = await supabase
    .from("properties")
    .select("name")
    .eq("id", payout.data.property_id)
    .eq("owner_id", profile.id)
    .maybeSingle();

  const payoutUpdate = await supabase
    .from("owner_payouts")
    .update({ status: "query_raised", owner_note: message })
    .eq("id", id)
    .eq("owner_id", profile.id)
    .eq("status", "ready_for_review")
    .select("id")
    .maybeSingle();
  if (payoutUpdate.error || !payoutUpdate.data) {
    redirect("/owner/payout?notice=owner_payout_action_failed");
  }
  invalidateBusinessData("payouts", "queries");

  const queryInsert = await supabase
    .from("owner_queries")
    .insert({
      owner_id: profile.id,
      property_id: payout.data.property_id,
      payout_id: payout.data.id,
      message,
      status: "open",
      resolved: false,
    })
    .select("id")
    .single();
  if (queryInsert.error || !queryInsert.data) {
    const rollback = await supabase
      .from("owner_payouts")
      .update({ owner_note: payout.data.owner_note, status: "ready_for_review" })
      .eq("id", id)
      .eq("owner_id", profile.id)
      .eq("status", "query_raised");
    if (rollback.error) {
      logSafePayoutFailure("rollback-payout-after-query-insert", rollback.error, {
        ownerId: profile.id,
        payoutId: id,
      });
    }
    redirect("/owner/payout?notice=owner_payout_action_failed");
  }

  await sendOwnerQueryAdminEmail({
    message,
    ownerEmail: profile.email,
    ownerName: profile.name,
    ownerPhone: profile.phone,
    propertyName: property.data?.name ?? null,
    queryType: "statement",
  });

  invalidateBusinessData("payouts", "queries");
  redirect("/owner/payout?notice=owner_payout_query_raised");
}

export async function markPayoutPaidAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  if (!id) redirect("/dashboard/payouts?notice=admin_payout_update_failed");

  const supabase = await createClient();
  const payout = await supabase.from("owner_payouts").select("id,status").eq("id", id).maybeSingle();
  if (payout.error || !payout.data || !["approved", "resolved"].includes(payout.data.status)) {
    redirect("/dashboard/payouts?notice=admin_payout_update_failed");
  }

  const updateResult = await supabase
    .from("owner_payouts")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["approved", "resolved"])
    .select("id")
    .maybeSingle();
  if (updateResult.error || !updateResult.data) redirect("/dashboard/payouts?notice=admin_payout_update_failed");

  invalidateBusinessData("payouts");
  redirect("/dashboard/payouts?notice=admin_payout_marked_paid");
}
