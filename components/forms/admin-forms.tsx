"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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

export function UserEditForm({ profile }: { profile: Profile }) {
  return (
    <form action={updateUserAction} className="grid gap-2 md:grid-cols-6">
      <input name="id" type="hidden" value={profile.id} />
      <Input defaultValue={profile.name || ""} name="name" placeholder="Name" />
      <Input defaultValue={profile.phone || ""} name="phone" placeholder="Phone" />
      <Select defaultValue={profile.role} name="role">
        <option value="admin">Admin</option>
        <option value="owner">Owner</option>
      </Select>
      <Select defaultValue={profile.status} name="status">
        {accountStatuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </Select>
      <div className="text-sm text-[var(--muted)]">{profile.email}</div>
      <Button type="submit" variant="primary">
        <Save className="h-4 w-4" />
        Save
      </Button>
    </form>
  );
}

export function PropertyForm({ owners, property }: { owners: Profile[]; property?: Property }) {
  return (
    <form action={savePropertyAction} className="grid gap-3 md:grid-cols-4">
      <input name="id" type="hidden" value={property?.id || ""} />
      <Field label="Name">
        <Input defaultValue={property?.name || ""} name="name" required />
      </Field>
      <Field label="City">
        <Input defaultValue={property?.city || ""} name="city" />
      </Field>
      <Field label="Bedrooms">
        <Input defaultValue={property?.bedrooms || 1} min="0" name="bedrooms" type="number" />
      </Field>
      <Field label="Owner">
        <Select defaultValue={property?.owner_id || ""} name="owner_id">
          <option value="">Unassigned</option>
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.name || owner.email}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Address">
        <Input defaultValue={property?.address || ""} name="address" />
      </Field>
      <Field label="Owner share">
        <Input defaultValue={property?.owner_share ?? 70} max="100" min="0" name="owner_share" type="number" />
      </Field>
      <Field label="CMS share">
        <Input defaultValue={property?.cms_share ?? 30} max="100" min="0" name="cms_share" type="number" />
      </Field>
      <Field label="Status">
        <Select defaultValue={property?.status || "active"} name="status">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </Field>
      <div className="self-end md:col-span-3">
        <Button type="submit" variant="primary">
          <Save className="h-4 w-4" />
          Save property
        </Button>
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
  const [expenseFor, setExpenseFor] = useState<"cms" | "property">(expense?.expense_for || "cms");
  const [propertyId, setPropertyId] = useState(expense?.property_id || "");
  const categoryOptions = expense?.category && !categories.includes(expense.category)
    ? [expense.category, ...categories]
    : categories;

  return (
    <form action={saveExpenseAction} className="grid gap-3 md:grid-cols-4">
      <input name="id" type="hidden" value={expense?.id || ""} />
      <Field label="Expense for">
        <Select
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
        </Select>
      </Field>
      <Field label="Property">
        <Select
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
        </Select>
      </Field>
      <Field label="Date">
        <Input defaultValue={expense?.date || ""} name="date" required type="date" />
      </Field>
      <Field label="Category">
        <Select defaultValue={expense?.category || ""} name="category" required>
          <option value="">{categoryOptions.length ? "Select category" : "No categories configured"}</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </Select>
      </Field>
      <Field label="Amount">
        <Input defaultValue={expense?.amount || 0} name="amount" required type="number" />
      </Field>
      <Field label="Vendor">
        <Input defaultValue={expense?.vendor || ""} name="vendor" />
      </Field>
      <Field label="Note">
        <Input defaultValue={expense?.note || ""} name="note" />
      </Field>
      <div className="self-end">
        <Button type="submit" variant="primary">
          <Save className="h-4 w-4" />
          Save expense
        </Button>
      </div>
    </form>
  );
}

export function SettingsForm({ settings }: { settings: Setting[] }) {
  const valueFor = (key: string) => {
    const value = settings.find((setting) => setting.key === key)?.value;
    return Array.isArray(value) ? value.join("\n") : "";
  };

  return (
    <form action={saveSettingsAction} className="grid gap-4 md:grid-cols-2">
      {[
        ["booking_sources", "Booking sources"],
        ["expense_categories", "Expense categories"],
        ["concierge_options", "Concierge options"],
      ].map(([key, label]) => (
        <Field key={key} label={label}>
          <Textarea defaultValue={valueFor(key)} name={key} />
        </Field>
      ))}
      <div className="md:col-span-2">
        <Button type="submit" variant="primary">
          <Save className="h-4 w-4" />
          Save settings
        </Button>
      </div>
    </form>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  return (
    <form action={saveProfileAction} className="grid max-w-xl gap-4">
      <Field label="Name">
        <Input defaultValue={profile.name || ""} name="name" required />
      </Field>
      <Field label="Phone">
        <Input defaultValue={profile.phone || ""} name="phone" />
      </Field>
      <Field label="Avatar URL">
        <Input defaultValue={profile.avatar_url || ""} name="avatar_url" />
      </Field>
      <Button type="submit" variant="primary">
        <Save className="h-4 w-4" />
        Save profile
      </Button>
    </form>
  );
}
