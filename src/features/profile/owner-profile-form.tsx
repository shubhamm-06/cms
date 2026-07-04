"use client";

import { Save } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveProfileAction } from "@/src/features/shared/actions";
import type { Database } from "@/types/database.types";

type Profile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "avatar_url" | "name" | "phone"
>;

function OwnerProfileSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-full sm:w-auto"
      pending={pending}
      type="submit"
      variant="primary"
    >
      {pending ? null : <Save className="h-4 w-4" />}
      {pending ? "Saving..." : "Save profile"}
    </Button>
  );
}

function ProfileField({
  children,
  helper,
  label,
}: {
  children: ReactNode;
  helper?: string;
  label: string;
}) {
  return (
    <label className="block">
      <span className="cms-label">{label}</span>
      {children}
      {helper ? (
        <span className="mt-1.5 block text-xs leading-5 text-[#6a655f]">
          {helper}
        </span>
      ) : null}
    </label>
  );
}

export function OwnerProfileForm({ profile }: { profile: Profile }) {
  return (
    <form action={saveProfileAction} className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileField
          helper="Use the name you want CurateMyStay to use in owner communication."
          label="Name"
        >
          <Input
            className="min-h-11 text-base font-semibold"
            defaultValue={profile.name || ""}
            minLength={2}
            name="name"
            required
          />
        </ProfileField>
        <ProfileField
          helper="A contact number for payout or property-related follow-up."
          label="Phone"
        >
          <Input
            className="min-h-11"
            defaultValue={profile.phone || ""}
            name="phone"
            type="tel"
          />
        </ProfileField>
      </div>

      <ProfileField
        helper="Optional. Paste a hosted image URL; image upload is not part of the owner portal yet."
        label="Avatar URL"
      >
        <Input
          className="min-h-11"
          defaultValue={profile.avatar_url || ""}
          name="avatar_url"
          placeholder="https://..."
          type="url"
        />
      </ProfileField>

      <div className="flex flex-col items-start justify-between gap-3 border-t border-[var(--border)] pt-5">
        <OwnerProfileSubmitButton />

        <p className="flex-1 text-xs leading-6 text-[#5f5b55]">
          Only your personal contact details are updated here. Account role and
          status remain read-only.
        </p>
      </div>
    </form>
  );
}
