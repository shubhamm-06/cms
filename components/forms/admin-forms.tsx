"use client";

import { Building2, ReceiptText, Save, WalletCards } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  saveExpenseAction,
  saveProfileAction,
  savePropertyAction,
  saveSettingsAction,
  updateUserAction,
} from "@/src/features/shared/actions";
import { accountStatuses } from "@/src/lib/constants/statuses";
import type { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Property = Database["public"]["Tables"]["properties"]["Row"];
type Expense = Database["public"]["Tables"]["expenses"]["Row"];
type Setting = Database["public"]["Tables"]["settings"]["Row"];
type EditableProfile = Pick<Profile, "avatar_url" | "name" | "phone">;

function PropertyField({
  children,
  className = "",
  helper,
  label,
}: {
  children: ReactNode;
  className?: string;
  helper?: string;
  label: string;
}) {
  return (
    <label className={className}>
      <span className="cms-label">{label}</span>
      {children}
      {helper ? <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{helper}</span> : null}
    </label>
  );
}

function PropertySubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button pending={pending} type="submit" variant="primary">
      {pending ? null : <Save className="h-4 w-4" />}
      {pending ? "Saving..." : isEditing ? "Save changes" : "Save property"}
    </Button>
  );
}

function ExpenseSubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button pending={pending} type="submit" variant="primary">
      {pending ? null : <Save className="h-4 w-4" />}
      {pending ? "Saving..." : isEditing ? "Save changes" : "Save expense"}
    </Button>
  );
}

function SettingsSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button pending={pending} type="submit" variant="primary">
      {pending ? null : <Save className="h-4 w-4" />}
      {pending ? "Saving..." : "Save settings"}
    </Button>
  );
}

function ProfileSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full sm:w-auto" pending={pending} type="submit" variant="primary">
      {pending ? null : <Save className="h-4 w-4" />}
      {pending ? "Saving..." : "Save profile"}
    </Button>
  );
}

export function UserEditForm({ profile }: { profile: Profile }) {
  return (
    <form action={updateUserAction} className="grid gap-2 md:grid-cols-6">
      <input name="id" type="hidden" value={profile.id} />
      <Input defaultValue={profile.name || ""} name="name" placeholder="Name" />
      <Input defaultValue={profile.phone || ""} name="phone" placeholder="Phone" />
      <select className="cms-input" defaultValue={profile.role} name="role">
        <option value="admin">Admin</option>
        <option value="owner">Owner</option>
      </select>
      <select className="cms-input" defaultValue={profile.status} name="status">
        {accountStatuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <div className="text-sm text-[var(--muted)]">{profile.email}</div>
      <Button type="submit" variant="primary">
        <Save className="h-4 w-4" />
        Save
      </Button>
    </form>
  );
}

export function PropertyForm({ owners, property }: { owners: Profile[]; property?: Property }) {
  const isEditing = Boolean(property);

  return (
    <form action={savePropertyAction} className="grid gap-4 md:grid-cols-12" key={property?.id || "new-property-form"}>
      <input name="mode" type="hidden" value={property ? "edit" : "add"} />
      <input name="id" type="hidden" value={property?.id || ""} />
      <PropertyField className="md:col-span-7" helper="Use the public-facing property name used in owner reports." label="Property name">
        <Input className="text-base font-semibold" defaultValue={property?.name || ""} name="name" required />
      </PropertyField>
      <PropertyField className="md:col-span-3" label="Owner">
        <select className="cms-input min-h-11" defaultValue={property?.owner_id || ""} name="owner_id">
          <option value="">Unassigned</option>
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.name || owner.email}
            </option>
          ))}
        </select>
      </PropertyField>
      <PropertyField className="md:col-span-2" label="Status">
        <select className="cms-input min-h-11" defaultValue={property?.status || "active"} name="status">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </PropertyField>
      <PropertyField className="md:col-span-7" helper="Keep this useful for operations; full legal formatting is not required here." label="Address">
        <Textarea defaultValue={property?.address || ""} name="address" rows={3} />
      </PropertyField>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/60 p-4 md:col-span-5">
        <div className="mb-3">
          <div className="text-sm font-bold text-[var(--foreground)]">Profit share</div>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Owner share and CMS share must total 100.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <PropertyField label="Owner share">
            <Input defaultValue={property?.owner_share ?? 70} max="100" min="0" name="owner_share" type="number" />
          </PropertyField>
          <PropertyField label="CMS share">
            <Input defaultValue={property?.cms_share ?? 30} max="100" min="0" name="cms_share" type="number" />
          </PropertyField>
        </div>
      </div>
      <PropertyField className="md:col-span-3" label="City">
        <Input defaultValue={property?.city || ""} name="city" />
      </PropertyField>
      <PropertyField className="md:col-span-2" label="Bedrooms">
        <Input defaultValue={property?.bedrooms || 1} min="0" name="bedrooms" type="number" />
      </PropertyField>
      <div className="flex flex-col gap-2 self-end md:col-span-7 md:items-end">
        <PropertySubmitButton isEditing={isEditing} />
        <p className="text-xs text-[var(--muted)]">
          {isEditing ? "Updates the selected property row." : "Creates one new property row."}
        </p>
      </div>
    </form>
  );
}

export function ExpenseForm({
  categories,
  properties,
  expense,
}: {
  categories: string[];
  properties: Property[];
  expense?: Expense;
}) {
  const isEditing = Boolean(expense);
  const [expenseFor, setExpenseFor] = useState<"cms" | "property">(expense?.expense_for || "cms");
  const [propertyId, setPropertyId] = useState(expense?.property_id || "");
  const categoryOptions = expense?.category && !categories.includes(expense.category)
    ? [expense.category, ...categories]
    : categories;

  return (
    <form action={saveExpenseAction} className="grid gap-5" key={expense?.id || "new-expense-form"}>
      <input name="id" type="hidden" value={expense?.id || ""} />

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-[var(--brand)]" />
              <h3 className="text-sm font-bold text-[var(--foreground)]">Expense context</h3>
            </div>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              CMS expenses stay internal. Property expenses require a property and appear in owner reporting.
            </p>
          </div>
          <span className="hidden rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-bold text-[var(--foreground)] sm:inline-flex">
            {expenseFor === "cms" ? "CMS expense" : "Property expense"}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-12">
          <PropertyField className="md:col-span-4" helper="Defaults to CMS for internal company costs." label="Expense type">
            <select
              className="cms-input min-h-11"
              name="expense_for"
              onChange={(event) => {
                const value = event.target.value as "cms" | "property";
                setExpenseFor(value);
                if (value === "cms") setPropertyId("");
              }}
              value={expenseFor}
            >
              <option value="cms">CMS</option>
              <option value="property">Property</option>
            </select>
          </PropertyField>
          <PropertyField
            className="md:col-span-8"
            helper={expenseFor === "cms" ? "Disabled for CMS expenses; the server stores no property." : "Required for property expenses."}
            label="Property"
          >
            <select
              className="cms-input min-h-11 disabled:cursor-not-allowed disabled:bg-[var(--surface-2)] disabled:text-[var(--muted)]"
              disabled={expenseFor === "cms"}
              name="property_id"
              onChange={(event) => setPropertyId(event.target.value)}
              required={expenseFor === "property"}
              value={propertyId}
            >
              <option value="">CMS / none</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </PropertyField>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <WalletCards className="h-4 w-4 text-[var(--brand)]" />
          <h3 className="text-sm font-bold text-[var(--foreground)]">Expense details</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-12">
          <PropertyField className="md:col-span-4" label="Category">
            <select className="cms-input min-h-11" defaultValue={expense?.category || ""} name="category" required>
              <option value="">{categoryOptions.length ? "Select category" : "No categories configured"}</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </PropertyField>
          <PropertyField className="md:col-span-3" label="Date">
            <Input defaultValue={expense?.date || ""} name="date" required type="date" />
          </PropertyField>
          <PropertyField className="md:col-span-3" label="Amount">
            <Input defaultValue={expense?.amount || 0} name="amount" required type="number" />
          </PropertyField>
          <PropertyField className="md:col-span-2" label="Vendor">
            <Input defaultValue={expense?.vendor || ""} name="vendor" />
          </PropertyField>
        </div>
      </section>

      <PropertyField label="Note">
        <Textarea defaultValue={expense?.note || ""} name="note" placeholder="Internal note or receipt context" rows={4} />
      </PropertyField>

      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm leading-6 text-[var(--muted)]">
          <Building2 className="h-4 w-4 text-[var(--muted)]" />
          {expenseFor === "cms" ? "CMS expenses stay hidden from owners." : "Property expenses are visible only to the assigned owner."}
        </p>
        <ExpenseSubmitButton isEditing={isEditing} />
      </div>
    </form>
  );
}

export function SettingsForm({ settings }: { settings: Setting[] }) {
  const valueFor = (key: string) => {
    const value = settings.find((setting) => setting.key === key)?.value;
    return Array.isArray(value) ? value.join("\n") : "";
  };
  const settingGroups = [
    {
      description: "Sources available on the booking form, such as Airbnb, Booking.com, direct, or walk-in.",
      key: "booking_sources",
      label: "Booking Sources",
    },
    {
      description: "Categories available when admins record property or CMS expenses.",
      key: "expense_categories",
      label: "Expense Categories",
    },
    {
      description: "Concierge services selectable while creating or editing bookings.",
      key: "concierge_options",
      label: "Concierge Options",
    },
  ];

  return (
    <form action={saveSettingsAction} className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-3">
        {settingGroups.map((setting) => (
          <label
            className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[0_10px_24px_rgba(34,34,34,0.03)]"
            key={setting.key}
          >
            <span className="cms-label">{setting.label}</span>
            <span className="mt-1 block min-h-10 text-sm leading-5 text-[#5f5b55]">{setting.description}</span>
            <span className="mt-3 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              One option per line
            </span>
            <Textarea
              className="mt-2 min-h-52 resize-y leading-6"
              defaultValue={valueFor(setting.key)}
              name={setting.key}
              spellCheck={false}
            />
          </label>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--cream)]/70 px-4 py-3 text-sm leading-6 text-[#5f5b55]">
        Existing values may appear in historical bookings or expenses. Add new options freely, but avoid removing options unless you understand how older records and edit forms should behave.
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-[var(--muted)]">
          Saved values continue to be stored as JSON arrays in the existing settings table.
        </p>
        <SettingsSubmitButton />
      </div>
    </form>
  );
}

export function ProfileForm({ profile }: { profile: EditableProfile }) {
  return (
    <form action={saveProfileAction} className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <PropertyField
          helper="Use the name CurateMyStay should show in internal admin context."
          label="Name"
        >
          <Input
            className="min-h-11 text-base font-semibold"
            defaultValue={profile.name || ""}
            minLength={2}
            name="name"
            required
          />
        </PropertyField>
        <PropertyField
          helper="Optional contact number for internal coordination."
          label="Phone"
        >
          <Input
            className="min-h-11"
            defaultValue={profile.phone || ""}
            name="phone"
            type="tel"
          />
        </PropertyField>
      </div>

      <PropertyField
        helper="Optional. Paste a hosted image URL; upload/storage behavior is unchanged."
        label="Avatar URL"
      >
        <Input
          className="min-h-11"
          defaultValue={profile.avatar_url || ""}
          name="avatar_url"
          placeholder="https://..."
          type="url"
        />
      </PropertyField>

      <div className="flex flex-col items-start justify-between gap-3 border-t border-[var(--border)] pt-5">
        <ProfileSubmitButton />
        <p className="text-xs leading-6 text-[#5f5b55]">
          Only your own personal contact details are updated here. Role, status, email, and protected-account controls are managed elsewhere.
        </p>
      </div>
    </form>
  );
}
