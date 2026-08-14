"use client";

import { Building2, ReceiptText, Save, WalletCards } from "lucide-react";
import { useState, type MouseEvent, type ReactNode } from "react";
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
import { normalizePropertySlug } from "@/src/lib/utils/property-slug";
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
  required = false,
}: {
  children: ReactNode;
  className?: string;
  helper?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label className={className}>
      <span className="cms-label">
        {label}
        {required ? <span className="text-[var(--brand)]"> *</span> : null}
      </span>
      {children}
      {helper ? <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{helper}</span> : null}
    </label>
  );
}

function PropertySection({ children, description, title }: { children: ReactNode; description: string; title: string }) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/45 p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[var(--foreground)]">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>
      {children}
    </section>
  );
}

function PropertyCheckbox({
  checked,
  description,
  name,
  onChange,
  title,
}: {
  checked?: boolean;
  description: string;
  name: string;
  onChange?: (checked: boolean) => void;
  title: string;
}) {
  const controlProps = onChange ? { checked } : { defaultChecked: checked };

  return (
    <div>
      <input name={name} type="hidden" value="false" />
      <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-white px-3 py-2.5">
        <input
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]"
          name={name}
          onChange={(event) => onChange?.(event.target.checked)}
          type="checkbox"
          value="true"
          {...controlProps}
        />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-[var(--foreground)]">{title}</span>
          <span className="mt-0.5 block text-xs leading-5 text-[var(--muted)]">{description}</span>
        </span>
      </label>
    </div>
  );
}

function linesFromList(items: string[] | null | undefined) {
  return items?.join("\n") || "";
}

export function PropertyFormSaveButton({ formId, isEditing }: { formId: string; isEditing: boolean }) {
  const [pending, setPending] = useState(false);

  function handleSubmitClick(event: MouseEvent<HTMLButtonElement>) {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form || !form.checkValidity()) {
      event.preventDefault();
      form?.reportValidity();
      return;
    }
    setPending(true);
  }

  return (
    <Button form={formId} onClick={handleSubmitClick} pending={pending} type="submit" variant="primary">
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

export function PropertyForm({ formId, owners, property }: { formId: string; owners: Profile[]; property?: Property }) {
  const [showOnWebsite, setShowOnWebsite] = useState(property?.show_on_website ?? false);
  const [publicName, setPublicName] = useState(property?.public_name || "");
  const [slug, setSlug] = useState(property?.slug || "");
  const [slugEdited, setSlugEdited] = useState(Boolean(property?.slug));

  return (
    <form action={savePropertyAction} className="grid gap-5" id={formId} key={property?.id || "new-property-form"}>
      <input name="mode" type="hidden" value={property ? "edit" : "add"} />
      <input name="id" type="hidden" value={property?.id || ""} />
      <PropertySection description="Internal operations, owner assignment, and financial splits. This information is not used as public website copy." title="Operational property">
        <div className="grid gap-4 md:grid-cols-12">
          <PropertyField className="md:col-span-7" helper="Used in owner reports, bookings, expenses, and payouts." label="Property name" required>
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
          <PropertyField className="md:col-span-2" helper="Controls operational use only." label="Status">
            <select className="cms-input min-h-11" defaultValue={property?.status || "active"} name="status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </PropertyField>
          <PropertyField className="md:col-span-7" helper="Private operational address. It is never used as public website copy." label="Address">
            <Textarea defaultValue={property?.address || ""} name="address" rows={3} />
          </PropertyField>
          <div className="rounded-xl border border-[var(--border)] bg-white/70 p-4 md:col-span-5">
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
            <Input defaultValue={property?.bedrooms ?? 1} min="0" name="bedrooms" type="number" />
          </PropertyField>
        </div>
      </PropertySection>

      <PropertySection description="Public catalogue information. Website visibility is separate from the operational property status above." title="Website listing">
        <PropertyCheckbox
          checked={showOnWebsite}
          description="Publish this property to future public catalogue pages. Turning this off preserves the saved listing details."
          name="show_on_website"
          onChange={setShowOnWebsite}
          title="Show on website"
        />

        <div className="mt-5 grid gap-6" hidden={!showOnWebsite}>
          <div>
            <h4 className="text-sm font-bold text-[var(--foreground)]">Listing identity</h4>
            <div className="mt-3 grid gap-4 md:grid-cols-12">
              <PropertyField className="md:col-span-6" label="Public property name" required={showOnWebsite}>
                <Input
                  name="public_name"
                  onChange={(event) => {
                    const value = event.target.value;
                    setPublicName(value);
                    if (!slugEdited) setSlug(normalizePropertySlug(value));
                  }}
                  required={showOnWebsite}
                  value={publicName}
                />
              </PropertyField>
              <PropertyField className="md:col-span-6" helper={slug ? `/property/${slug}` : "A URL preview will appear here."} label="Slug" required={showOnWebsite}>
                <Input
                  name="slug"
                  onChange={(event) => {
                    setSlugEdited(true);
                    setSlug(normalizePropertySlug(event.target.value));
                  }}
                  required={showOnWebsite}
                  value={slug}
                />
              </PropertyField>
              <PropertyField className="md:col-span-4" label="Public property type" required={showOnWebsite}>
                <Input defaultValue={property?.public_property_type || ""} name="public_property_type" required={showOnWebsite} />
              </PropertyField>
              <PropertyField className="md:col-span-4" label="Promotional badge">
                <Input defaultValue={property?.promotional_badge || ""} name="promotional_badge" />
              </PropertyField>
              <PropertyField className="md:col-span-4" label="Display order">
                <Input defaultValue={property?.display_order ?? 0} min="0" name="display_order" type="number" />
              </PropertyField>
              <div className="grid gap-3 sm:grid-cols-2 md:col-span-12">
                <PropertyCheckbox checked={property?.is_featured ?? false} description="Give this listing featured treatment when public catalogue pages are built." name="is_featured" title="Featured property" />
                <PropertyCheckbox checked={property?.show_in_similar_properties ?? true} description="Allow this listing in future similar-property suggestions." name="show_in_similar_properties" title="Show in similar properties" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[var(--foreground)]">Public location</h4>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">These public location details are separate from the private operational address.</p>
            <div className="mt-3 grid gap-4 md:grid-cols-12">
              <PropertyField className="md:col-span-3" label="Region" required={showOnWebsite}>
                <Input defaultValue={property?.region || ""} name="region" required={showOnWebsite} />
              </PropertyField>
              <PropertyField className="md:col-span-3" label="Area" required={showOnWebsite}>
                <Input defaultValue={property?.area || ""} name="area" required={showOnWebsite} />
              </PropertyField>
              <PropertyField className="md:col-span-6" label="Short location line" required={showOnWebsite}>
                <Input defaultValue={property?.short_location_line || ""} name="short_location_line" required={showOnWebsite} />
              </PropertyField>
              <PropertyField className="md:col-span-6" label="Public location description">
                <Textarea defaultValue={property?.public_location_text || ""} name="public_location_text" rows={3} />
              </PropertyField>
              <PropertyField className="md:col-span-3" label="Google Maps URL">
                <Input defaultValue={property?.google_maps_url || ""} name="google_maps_url" type="url" />
              </PropertyField>
              <PropertyField className="md:col-span-3" label="Distance from beach">
                <Input defaultValue={property?.distance_from_beach || ""} name="distance_from_beach" />
              </PropertyField>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[var(--foreground)]">Description</h4>
            <div className="mt-3 grid gap-4 md:grid-cols-12">
              <PropertyField className="md:col-span-12" label="Tagline">
                <Input defaultValue={property?.tagline || ""} name="tagline" />
              </PropertyField>
              <PropertyField className="md:col-span-6" label="Short description" required={showOnWebsite}>
                <Textarea defaultValue={property?.short_description || ""} name="short_description" required={showOnWebsite} rows={4} />
              </PropertyField>
              <PropertyField className="md:col-span-6" label="Full description" required={showOnWebsite}>
                <Textarea defaultValue={property?.full_description || ""} name="full_description" required={showOnWebsite} rows={4} />
              </PropertyField>
              <PropertyField className="md:col-span-12" helper="One highlight per line." label="Property highlights">
                <Textarea defaultValue={linesFromList(property?.property_highlights)} name="property_highlights" rows={4} />
              </PropertyField>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[var(--foreground)]">Capacity and amenities</h4>
            <div className="mt-3 grid gap-4 md:grid-cols-12">
              <PropertyField className="md:col-span-2" label="Beds">
                <Input defaultValue={property?.beds ?? ""} min="0" name="beds" type="number" />
              </PropertyField>
              <PropertyField className="md:col-span-2" label="Bathrooms" required={showOnWebsite}>
                <Input defaultValue={property?.bathrooms ?? ""} min="0" name="bathrooms" required={showOnWebsite} step="0.5" type="number" />
              </PropertyField>
              <PropertyField className="md:col-span-3" label="Maximum guests" required={showOnWebsite}>
                <Input defaultValue={property?.max_guests ?? ""} min="1" name="max_guests" required={showOnWebsite} type="number" />
              </PropertyField>
              <PropertyField className="md:col-span-5" label="Pool type">
                <Input defaultValue={property?.pool_type || ""} name="pool_type" />
              </PropertyField>
              <PropertyField className="md:col-span-6" helper="One amenity per line." label="Amenities">
                <Textarea defaultValue={linesFromList(property?.amenities)} name="amenities" rows={4} />
              </PropertyField>
              <PropertyField className="md:col-span-6" helper="One house rule per line." label="House rules">
                <Textarea defaultValue={linesFromList(property?.house_rules)} name="house_rules" rows={4} />
              </PropertyField>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[var(--foreground)]">Price display</h4>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Website display information only. It never changes confirmed booking rates, revenue, P&amp;L, or payouts.</p>
            <div className="mt-3 grid gap-4 md:grid-cols-12">
              <div className="md:col-span-4">
                <PropertyCheckbox checked={property?.show_price ?? true} description="Show price guidance on future public listing pages." name="show_price" title="Show price" />
              </div>
              <PropertyField className="md:col-span-4" label="Starting price">
                <Input defaultValue={property?.starting_price ?? ""} min="0" name="starting_price" step="0.01" type="number" />
              </PropertyField>
              <PropertyField className="md:col-span-4" label="Price note">
                <Input defaultValue={property?.price_note || ""} name="price_note" />
              </PropertyField>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[var(--foreground)]">Stay and enquiry settings</h4>
            <div className="mt-3 grid gap-4 md:grid-cols-12">
              <div className="md:col-span-5">
                <PropertyCheckbox checked={property?.accept_booking_requests ?? true} description="Allow future visitors to send a booking request. Requests will remain separate from confirmed bookings." name="accept_booking_requests" title="Accept booking requests" />
              </div>
              <PropertyField className="md:col-span-2" label="Minimum nights">
                <Input defaultValue={property?.minimum_nights ?? ""} min="1" name="minimum_nights" type="number" />
              </PropertyField>
              <PropertyField className="md:col-span-2" label="Check-in time">
                <Input defaultValue={property?.check_in_time?.slice(0, 5) || ""} name="check_in_time" type="time" />
              </PropertyField>
              <PropertyField className="md:col-span-3" label="Check-out time">
                <Input defaultValue={property?.check_out_time?.slice(0, 5) || ""} name="check_out_time" type="time" />
              </PropertyField>
              <PropertyField className="md:col-span-12" label="Booking enquiry note">
                <Textarea defaultValue={property?.booking_enquiry_note || ""} name="booking_enquiry_note" rows={3} />
              </PropertyField>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[var(--foreground)]">SEO</h4>
            <div className="mt-3 grid gap-4 md:grid-cols-12">
              <PropertyField className="md:col-span-6" label="SEO title">
                <Input defaultValue={property?.seo_title || ""} name="seo_title" />
              </PropertyField>
              <PropertyField className="md:col-span-6" label="SEO description">
                <Textarea defaultValue={property?.seo_description || ""} name="seo_description" rows={3} />
              </PropertyField>
            </div>
          </div>
        </div>
      </PropertySection>

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
