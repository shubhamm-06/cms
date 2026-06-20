import { Save } from "lucide-react";
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
      <Field label="Image URL">
        <Input defaultValue={property?.image_url || ""} name="image_url" />
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

export function ExpenseForm({ properties, expense }: { properties: Property[]; expense?: Expense }) {
  return (
    <form action={saveExpenseAction} className="grid gap-3 md:grid-cols-4">
      <input name="id" type="hidden" value={expense?.id || ""} />
      <Field label="Expense for">
        <Select defaultValue={expense?.expense_for || "property"} name="expense_for">
          <option value="property">Property</option>
          <option value="cms">CMS</option>
        </Select>
      </Field>
      <Field label="Property">
        <Select defaultValue={expense?.property_id || ""} name="property_id">
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
        <Input defaultValue={expense?.category || ""} name="category" required />
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
