"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";
import { requireProfile, requireRole } from "@/src/features/auth/auth-guards";
import { getBookingStatus } from "@/src/features/bookings/booking-calculations";
import { sendOwnerQueryAdminEmail } from "@/src/features/queries/owner-query-email";
import { bookingSchema } from "@/src/lib/validators/bookings";
import { expenseSchema } from "@/src/lib/validators/expenses";
import { profileSchema } from "@/src/lib/validators/profile";
import { propertySchema } from "@/src/lib/validators/properties";
import { userSchema } from "@/src/lib/validators/users";
import { isProtectedAdmin } from "@/src/lib/utils/permissions";
import { isPayoutReviewWindow } from "@/src/lib/utils/dates";
import type { Database } from "@/types/database.types";

type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"];
type PropertyUpdate = Database["public"]["Tables"]["properties"]["Update"];

function emptyToNull<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value === "" ? null : value])) as T;
}

function propertySaveFailureNotice(error: { code?: string; constraint?: string | null } | null) {
  if (error?.code === "23505" && error.constraint?.includes("slug")) return "property_slug_taken";
  return "property_save_failed";
}

function hasLinkedUserData(counts: Array<number | null>) {
  return counts.some((count) => (count ?? 0) > 0);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function authFailureNotice(error: unknown) {
  const status = typeof error === "object" && error && "status" in error ? Number(error.status) : undefined;
  return status === 401 || status === 403 ? "user_delete_auth_unavailable" : "user_delete_failed";
}

function isAuthUserMissing(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const status = "status" in error ? Number(error.status) : undefined;
  const code = "code" in error ? String(error.code || "") : "";
  return status === 404 || code === "user_not_found" || code === "not_found";
}

function logSafeAuthDeleteFailure(message: string, error: unknown, userId: string) {
  const details =
    error && typeof error === "object"
      ? {
          code: "code" in error ? error.code : undefined,
          status: "status" in error ? error.status : undefined,
        }
      : {};
  console.error(message, { ...details, userId });
}

function postgresErrorString(error: unknown, key: "details" | "message") {
  return error && typeof error === "object" && key in error ? String((error as Record<string, unknown>)[key] || "") : "";
}

function postgresErrorCode(error: unknown) {
  return error && typeof error === "object" && "code" in error ? String(error.code || "") : undefined;
}

function postgresConstraintName(error: unknown) {
  const text = `${postgresErrorString(error, "message")} ${postgresErrorString(error, "details")}`;
  return text.match(/constraint "([^"]+)"/i)?.[1];
}

function postgresTableName(error: unknown) {
  const text = `${postgresErrorString(error, "message")} ${postgresErrorString(error, "details")}`;
  return text.match(/table "([^"]+)"/i)?.[1] ?? text.match(/relation "([^"]+)"/i)?.[1];
}

function logSafePropertyDeleteFailure(error: unknown, propertyId: string) {
  console.error("Property deletion failed", {
    code: postgresErrorCode(error),
    constraint: postgresConstraintName(error),
    table: postgresTableName(error),
    propertyId,
  });
}

function propertyDeleteFailureNotice(error: unknown) {
  const code = postgresErrorCode(error);
  const constraint = postgresConstraintName(error);

  if (code === "23503" && constraint?.startsWith("owner_queries_")) {
    return "property_delete_blocked_owner_queries";
  }

  if (code === "23503") {
    return "property_delete_blocked_dependency";
  }

  return "property_delete_failed";
}

function isTrustedPropertyImagePath(propertyId: string, storagePath: string) {
  return storagePath.startsWith(`${propertyId}/`) && !storagePath.includes("..") && storagePath.length <= 255;
}

export async function saveProfileAction(formData: FormData) {
  const profile = await requireProfile();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const supabase = await createClient();
  const result = await supabase.from("profiles").update(emptyToNull(parsed.data)).eq("id", profile.id);
  if (result.error) return;
  revalidatePath(profile.role === "admin" ? "/dashboard/profile" : "/owner/profile");
  if (profile.role === "admin") redirect("/dashboard/profile?notice=admin_profile_updated");
  if (profile.role === "owner") redirect("/owner/profile?notice=owner_profile_updated");
}

export async function updateUserAction(formData: FormData) {
  await requireRole("admin");
  const parsed = userSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const supabase = await createClient();
  const { id, ...values } = parsed.data;
  const current = await supabase.from("profiles").select("email,is_protected").eq("id", id).maybeSingle();
  if (current.error || !current.data) redirect("/dashboard/users?notice=user_update_failed");
  const data = current.data && isProtectedAdmin(current.data) ? { ...values, role: "admin" as const, status: "active" as const } : values;
  const updated = await supabase.from("profiles").update(emptyToNull(data)).eq("id", id).select("id").maybeSingle();
  if (updated.error || !updated.data) redirect("/dashboard/users?notice=user_update_failed");
  revalidatePath("/dashboard/users");
  redirect("/dashboard/users?notice=user_updated");
}

export async function deleteUserAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  if (!isUuid(id)) redirect("/dashboard/users?notice=user_delete_failed");
  const supabase = await createClient();
  const current = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  // Protected admin deletion is blocked here as well as hidden in the UI.
  if (current.error || !current.data) redirect("/dashboard/users?notice=user_delete_failed");
  if (isProtectedAdmin(current.data)) redirect("/dashboard/users?notice=user_delete_blocked");

  const [assignedProperties, payoutStatements, ownerQueries] = await Promise.all([
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("owner_id", id),
    supabase.from("owner_payouts").select("id", { count: "exact", head: true }).eq("owner_id", id),
    supabase.from("owner_queries").select("id", { count: "exact", head: true }).eq("owner_id", id),
  ]);

  if (assignedProperties.error || payoutStatements.error || ownerQueries.error) {
    redirect("/dashboard/users?notice=user_delete_failed");
  }

  if (hasLinkedUserData([assignedProperties.count, payoutStatements.count, ownerQueries.count])) {
    redirect("/dashboard/users?notice=user_delete_blocked_linked_records");
  }

  let adminSupabase: ReturnType<typeof createAdminClient>;
  try {
    adminSupabase = createAdminClient();
  } catch (error) {
    logSafeAuthDeleteFailure("Supabase Auth admin client is unavailable for user deletion", error, id);
    redirect("/dashboard/users?notice=user_delete_auth_unavailable");
  }

  let authBeforeDelete: Awaited<ReturnType<typeof adminSupabase.auth.admin.getUserById>>;
  try {
    authBeforeDelete = await adminSupabase.auth.admin.getUserById(id);
  } catch (error) {
    logSafeAuthDeleteFailure("Supabase Auth user lookup threw before user deletion", error, id);
    redirect("/dashboard/users?notice=user_delete_auth_unavailable");
  }
  if (authBeforeDelete.error || !authBeforeDelete.data.user) {
    logSafeAuthDeleteFailure("Supabase Auth user lookup failed before user deletion", authBeforeDelete.error, id);
    redirect(`/dashboard/users?notice=${authFailureNotice(authBeforeDelete.error)}`);
  }

  // The checked-in schema has public.profiles(id) referencing auth.users(id)
  // without ON DELETE CASCADE, so the profile row must be removed before the
  // Auth admin delete can satisfy the foreign key.
  const profileDelete = await supabase.from("profiles").delete().eq("id", id).select("id").maybeSingle();
  if (profileDelete.error || !profileDelete.data) redirect("/dashboard/users?notice=user_delete_failed");

  let authDelete: Awaited<ReturnType<typeof adminSupabase.auth.admin.deleteUser>>;
  try {
    authDelete = await adminSupabase.auth.admin.deleteUser(id);
  } catch (error) {
    const restoreProfile = await supabase.from("profiles").insert(current.data);
    if (restoreProfile.error) {
      console.error("Failed to restore profile after thrown Auth user deletion failure", {
        error: restoreProfile.error,
        userId: id,
      });
    }
    logSafeAuthDeleteFailure("Supabase Auth user deletion threw", error, id);
    redirect("/dashboard/users?notice=user_delete_auth_unavailable");
  }
  if (authDelete.error) {
    const restoreProfile = await supabase.from("profiles").insert(current.data);
    if (restoreProfile.error) {
      console.error("Failed to restore profile after Auth user deletion failure", {
        error: restoreProfile.error,
        userId: id,
      });
    }
    logSafeAuthDeleteFailure("Failed to delete Supabase Auth user", authDelete.error, id);
    redirect(`/dashboard/users?notice=${authFailureNotice(authDelete.error)}`);
  }

  let authAfterDelete: Awaited<ReturnType<typeof adminSupabase.auth.admin.getUserById>>;
  try {
    authAfterDelete = await adminSupabase.auth.admin.getUserById(id);
  } catch (error) {
    const restoreProfile = await supabase.from("profiles").insert(current.data);
    if (restoreProfile.error) {
      console.error("Failed to restore profile after thrown Auth deletion verification failure", {
        error: restoreProfile.error,
        userId: id,
      });
    }
    logSafeAuthDeleteFailure("Supabase Auth user deletion verification threw", error, id);
    redirect("/dashboard/users?notice=user_delete_auth_unavailable");
  }
  if (authAfterDelete.data.user || (authAfterDelete.error && !isAuthUserMissing(authAfterDelete.error))) {
    const restoreProfile = await supabase.from("profiles").insert(current.data);
    if (restoreProfile.error) {
      console.error("Failed to restore profile after Auth deletion verification failure", {
        error: restoreProfile.error,
        userId: id,
      });
    }
    logSafeAuthDeleteFailure("Supabase Auth user deletion could not be verified", authAfterDelete.error, id);
    redirect("/dashboard/users?notice=user_delete_failed");
  }

  const profileAfterDelete = await supabase.from("profiles").select("id").eq("id", id).maybeSingle();
  if (profileAfterDelete.error || profileAfterDelete.data) redirect("/dashboard/users?notice=user_delete_failed");

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users?notice=user_deleted");
}

export async function savePropertyAction(formData: FormData) {
  await requireRole("admin");
  const parsed = propertySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/dashboard/properties?notice=property_validation_failed");
  const mode = String(formData.get("mode") || "add");
  const { id, ...parsedValues } = parsed.data;
  const values = emptyToNull(parsedValues);
  delete values.image_url;
  const operationalValues = {
    address: values.address,
    bedrooms: values.bedrooms,
    city: values.city,
    cms_share: values.cms_share,
    name: values.name,
    owner_id: values.owner_id,
    owner_share: values.owner_share,
    show_on_website: values.show_on_website,
    status: values.status,
  };
  const valuesToSave = (values.show_on_website ? values : operationalValues) as PropertyUpdate;
  const supabase = await createClient();
  if (mode === "edit") {
    if (!id) redirect("/dashboard/properties?error=missing-property-id");
    const existing = await supabase.from("properties").select("id").eq("id", id).maybeSingle();
    if (!existing.data) redirect("/dashboard/properties?error=property-not-found");
    const { error } = await supabase.from("properties").update(valuesToSave).eq("id", id);
    if (error) redirect(`/dashboard/properties?notice=${propertySaveFailureNotice(error)}`);
  } else {
    const { error } = await supabase.from("properties").insert(valuesToSave as PropertyInsert);
    if (error) redirect(`/dashboard/properties?notice=${propertySaveFailureNotice(error)}`);
  }
  revalidatePath("/dashboard/properties");
  revalidatePath("/dashboard");
  redirect(`/dashboard/properties?notice=${mode === "edit" ? "property_updated" : "property_created"}`);
}

export async function deletePropertyAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  if (!isUuid(id)) redirect("/dashboard/properties?notice=property_delete_failed");

  const supabase = await createClient();
  const property = await supabase.from("properties").select("id").eq("id", id).maybeSingle();
  if (property.error) redirect("/dashboard/properties?notice=property_delete_failed");
  if (!property.data) redirect("/dashboard/properties?notice=property_delete_not_found");

  const propertyImages = await supabase
    .from("property_images")
    .select("storage_path")
    .eq("property_id", id);
  if (propertyImages.error) {
    logSafePropertyDeleteFailure(propertyImages.error, id);
    redirect("/dashboard/properties?notice=property_delete_failed");
  }
  const allStoragePaths = (propertyImages.data ?? []).map((image) => image.storage_path);
  const storagePaths = allStoragePaths
    .filter((storagePath) => isTrustedPropertyImagePath(id, storagePath));

  const deleted = await supabase.from("properties").delete().eq("id", id).select("id").maybeSingle();
  if (deleted.error) {
    logSafePropertyDeleteFailure(deleted.error, id);
    redirect(`/dashboard/properties?notice=${propertyDeleteFailureNotice(deleted.error)}`);
  }
  if (!deleted.data) {
    console.error("Property deletion returned no deleted row", { propertyId: id });
    redirect("/dashboard/properties?notice=property_delete_failed");
  }

  const afterDelete = await supabase.from("properties").select("id").eq("id", id).maybeSingle();
  if (afterDelete.error) {
    logSafePropertyDeleteFailure(afterDelete.error, id);
    redirect("/dashboard/properties?notice=property_delete_failed");
  }
  if (afterDelete.data) redirect("/dashboard/properties?notice=property_delete_failed");

  let storageCleanupFailed = storagePaths.length !== allStoragePaths.length;
  if (storageCleanupFailed) {
    console.error("Property Storage cleanup skipped untrusted image paths", {
      propertyId: id,
      skippedCount: allStoragePaths.length - storagePaths.length,
    });
  }
  if (storagePaths.length) {
    const storageDelete = await supabase.storage.from("property-images").remove(storagePaths);
    if (storageDelete.error) {
      storageCleanupFailed = true;
      console.error("Property Storage cleanup failed after database deletion", {
        code: postgresErrorCode(storageDelete.error),
        propertyId: id,
      });
    }
  }

  revalidatePath("/dashboard/properties");
  revalidatePath("/dashboard");
  redirect(`/dashboard/properties?notice=${storageCleanupFailed ? "property_deleted_with_image_warning" : "property_deleted"}`);
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
  if (id) {
    const updated = await supabase.from("bookings").update(payload).eq("id", id).select("id").maybeSingle();
    if (updated.error || !updated.data) redirect("/dashboard/bookings?notice=booking_save_failed");
  } else {
    const created = await supabase.from("bookings").insert(payload).select("id").maybeSingle();
    if (created.error || !created.data) redirect("/dashboard/bookings?notice=booking_save_failed");
  }
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
  redirect(`/dashboard/bookings?notice=${id ? "booking_updated" : "booking_created"}`);
}

export async function deleteBookingAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  if (!isUuid(id)) redirect("/dashboard/bookings?notice=booking_delete_failed");

  const supabase = await createClient();
  const booking = await supabase.from("bookings").select("id").eq("id", id).maybeSingle();
  if (booking.error) redirect("/dashboard/bookings?notice=booking_delete_failed");
  if (!booking.data) redirect("/dashboard/bookings?notice=booking_delete_not_found");

  const deleted = await supabase.from("bookings").delete().eq("id", id).select("id").maybeSingle();
  if (deleted.error || !deleted.data) redirect("/dashboard/bookings?notice=booking_delete_failed");

  const afterDelete = await supabase.from("bookings").select("id").eq("id", id).maybeSingle();
  if (afterDelete.error || afterDelete.data) redirect("/dashboard/bookings?notice=booking_delete_failed");

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pnl");
  redirect("/dashboard/bookings?notice=booking_deleted");
}

export async function saveExpenseAction(formData: FormData) {
  await requireRole("admin");
  const parsed = expenseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { id, ...data } = emptyToNull(parsed.data);
  const supabase = await createClient();
  if (data.expense_for === "property") {
    const property = await supabase.from("properties").select("id").eq("id", String(data.property_id || "")).maybeSingle();
    if (property.error || !property.data) redirect("/dashboard/expenses?notice=expense_save_failed");
  }
  // CMS expenses intentionally have no property_id; owners only read property expenses.
  const payload: Database["public"]["Tables"]["expenses"]["Insert"] =
    data.expense_for === "cms" ? { ...data, property_id: null } : data;
  if (id) {
    const updated = await supabase.from("expenses").update(payload).eq("id", id).select("id").maybeSingle();
    if (updated.error || !updated.data) redirect("/dashboard/expenses?notice=expense_save_failed");
  } else {
    const created = await supabase.from("expenses").insert(payload).select("id").maybeSingle();
    if (created.error || !created.data) redirect("/dashboard/expenses?notice=expense_save_failed");
  }
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/pnl");
  redirect(`/dashboard/expenses?notice=${id ? "expense_updated" : "expense_created"}`);
}

export async function deleteExpenseAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  if (!isUuid(id)) redirect("/dashboard/expenses?notice=expense_delete_failed");

  const supabase = await createClient();
  const expense = await supabase.from("expenses").select("id").eq("id", id).maybeSingle();
  if (expense.error) redirect("/dashboard/expenses?notice=expense_delete_failed");
  if (!expense.data) redirect("/dashboard/expenses?notice=expense_delete_not_found");

  const deleted = await supabase.from("expenses").delete().eq("id", id).select("id").maybeSingle();
  if (deleted.error || !deleted.data) redirect("/dashboard/expenses?notice=expense_delete_failed");

  const afterDelete = await supabase.from("expenses").select("id").eq("id", id).maybeSingle();
  if (afterDelete.error || afterDelete.data) redirect("/dashboard/expenses?notice=expense_delete_failed");

  revalidatePath("/dashboard/expenses");
  redirect("/dashboard/expenses?notice=expense_deleted");
}

export async function resolveQueryAction(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  const query = await supabase.from("owner_queries").select("id,payout_id,resolved").eq("id", id).maybeSingle();
  if (!query.data || query.data.resolved) redirect("/dashboard/queries?error=resolve-failed");

  const resolvedAt = new Date().toISOString();
  const resolvedQuery = await supabase
    .from("owner_queries")
    .update({ resolved: true, status: "resolved", resolved_at: resolvedAt })
    .eq("id", id)
    .eq("resolved", false)
    .select("id")
    .maybeSingle();
  if (resolvedQuery.error || !resolvedQuery.data) redirect("/dashboard/queries?error=resolve-failed");

  if (query.data?.payout_id) {
    const payoutUpdate = await supabase
      .from("owner_payouts")
      .update({ status: "resolved" })
      .eq("id", query.data.payout_id)
      .eq("status", "query_raised")
      .select("id")
      .maybeSingle();
    if (payoutUpdate.error || !payoutUpdate.data) {
      const rollback = await supabase
        .from("owner_queries")
        .update({ resolved: false, status: "open", resolved_at: null })
        .eq("id", id)
        .eq("resolved_at", resolvedAt);
      if (rollback.error) {
        console.error("Failed to restore owner query after payout resolution failure", {
          code: postgresErrorCode(rollback.error),
          queryId: id,
        });
      }
      redirect("/dashboard/queries?error=resolve-failed");
    }
  }

  revalidatePath("/dashboard/queries");
  revalidatePath("/dashboard/payouts");
  revalidatePath("/owner/payout");
  redirect("/dashboard/queries?notice=admin_query_resolved");
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
      const rollback = await supabase
        .from("owner_payouts")
        .update({ status: "query_raised", approved_at: restoredPayout.approved_at })
        .eq("id", restoredPayout.id);
      if (rollback.error) {
        console.error("Failed to restore payout after owner query deletion failure", {
          code: postgresErrorCode(rollback.error),
          payoutId: restoredPayout.id,
          queryId: id,
        });
      }
    }
    redirect("/dashboard/queries?error=delete-failed");
  }

  revalidatePath("/dashboard/queries");
  revalidatePath("/dashboard/payouts");
  revalidatePath("/owner/payout");
  revalidatePath("/owner/queries");
  redirect("/dashboard/queries?notice=admin_query_deleted");
}

export async function createOwnerQueryAction(formData: FormData) {
  const profile = await requireRole("owner");
  const message = String(formData.get("message") || "").trim();
  if (!message) return;
  const property_id = String(formData.get("property_id") || "") || null;
  const supabase = await createClient();
  let propertyName: string | null = null;
  if (property_id) {
    const property = await supabase
      .from("properties")
      .select("id,name")
      .eq("id", property_id)
      .eq("owner_id", profile.id)
      .maybeSingle();
    if (!property.data) return;
    propertyName = property.data.name;
  }
  const queryInsert = await supabase.from("owner_queries").insert({ owner_id: profile.id, property_id, message });
  if (queryInsert.error) return;

  await sendOwnerQueryAdminEmail({
    message,
    ownerEmail: profile.email,
    ownerName: profile.name,
    ownerPhone: profile.phone,
    propertyName,
    queryType: "normal",
  });

  revalidatePath("/owner/queries");
  redirect("/owner/queries?notice=owner_query_created");
}

export async function saveSettingsAction(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  const keys = ["booking_sources", "expense_categories", "concierge_options"];
  const results = await Promise.all(
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
  if (results.some((result) => result.error)) redirect("/dashboard/settings?error=settings-save-failed");
  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?notice=settings_updated");
}
