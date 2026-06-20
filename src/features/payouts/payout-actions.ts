"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/src/features/auth/auth-guards";
import {
  calculateBreakupsForOwnerMonth,
  calculateOwnerCombinedPayout,
  calculatePreviousCarryForward,
} from "@/src/features/payouts/payout-calculations";
import { createClient } from "@/src/lib/supabase/server";
import {
  getMonthRange,
  getPreviousMonthKey,
  isAfterPayoutReviewWindow,
  isPayoutReviewWindow,
} from "@/src/lib/utils/dates";
import type { Database } from "@/types/database.types";

type PayoutStatus = Database["public"]["Tables"]["owner_payouts"]["Row"]["status"];
type PayoutUpdate = Database["public"]["Tables"]["owner_payouts"]["Update"];

const OWNER_ACTION_STATUSES: PayoutStatus[] = ["approved", "query_raised", "resolved", "paid"];
const RECALCULATABLE_STATUSES: PayoutStatus[] = ["draft", "ready_for_review"];

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
  const owners = ownersResult.data ?? [];
  const ownerIds = owners.map((owner) => owner.id);

  if (!ownerIds.length) return;

  const propertiesResult = await supabase
    .from("properties")
    .select("*")
    .eq("status", "active")
    .in("owner_id", ownerIds);
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
      await supabase.from("owner_payouts").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("owner_payouts").insert({
        ...payload,
        property_id: representativeProperty.id,
        owner_id: owner.id,
        month: monthKey,
      });
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
  if (!isPayoutReviewWindow()) return;

  const id = String(formData.get("id") || "");
  const ownerNote = String(formData.get("owner_note") || "").trim() || null;
  const supabase = await createClient();
  const payout = await supabase
    .from("owner_payouts")
    .select("id,owner_id,status")
    .eq("id", id)
    .eq("owner_id", profile.id)
    .maybeSingle();

  if (payout.data?.status !== "ready_for_review") return;

  await supabase
    .from("owner_payouts")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      owner_note: ownerNote,
    })
    .eq("id", id)
    .eq("owner_id", profile.id);

  revalidatePath("/owner/payout");
  revalidatePath("/dashboard/payouts");
}

export async function raisePayoutQueryAction(formData: FormData) {
  const profile = await requireRole("owner");
  if (!isPayoutReviewWindow()) return;

  const id = String(formData.get("id") || "");
  const message = String(formData.get("message") || "").trim();
  if (!id || !message) return;

  const supabase = await createClient();
  const payout = await supabase
    .from("owner_payouts")
    .select("id,owner_id,property_id,status")
    .eq("id", id)
    .eq("owner_id", profile.id)
    .maybeSingle();

  if (payout.data?.status !== "ready_for_review") return;

  await supabase.from("owner_queries").insert({
    owner_id: profile.id,
    property_id: payout.data.property_id,
    payout_id: payout.data.id,
    message,
    status: "open",
    resolved: false,
  });

  await supabase
    .from("owner_payouts")
    .update({ status: "query_raised", owner_note: message })
    .eq("id", id)
    .eq("owner_id", profile.id);

  revalidatePath("/owner/payout");
  revalidatePath("/owner/queries");
  revalidatePath("/dashboard/payouts");
  revalidatePath("/dashboard/queries");
}

export async function markPayoutPaidAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();
  const payout = await supabase.from("owner_payouts").select("id,status").eq("id", id).maybeSingle();
  if (!payout.data || !["approved", "resolved"].includes(payout.data.status)) return;

  await supabase
    .from("owner_payouts")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/dashboard/payouts");
  revalidatePath("/owner/payout");
}
