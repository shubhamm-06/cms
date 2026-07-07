"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Save, ShieldCheck, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { deleteUserAction, updateUserAction } from "@/src/features/shared/actions";
import { accountStatuses } from "@/src/lib/constants/statuses";
import { isProtectedAdmin } from "@/src/lib/utils/permissions";
import type { Database } from "@/types/database.types";

export type UserTableRow = Database["public"]["Tables"]["profiles"]["Row"];

function displayName(profile: UserTableRow) {
  return profile.name || profile.email;
}

function searchableIdentity(profile: UserTableRow) {
  return [profile.name, profile.email, profile.phone].filter(Boolean).join(" ");
}

function RoleBadge({ role }: { role: UserTableRow["role"] }) {
  return (
    <Badge className="w-[76px] justify-center whitespace-nowrap capitalize" tone={role === "admin" ? "brand" : "teal"}>
      {role}
    </Badge>
  );
}

function StatusBadge({ status }: { status: UserTableRow["status"] }) {
  return (
    <Badge
      className="w-[86px] justify-center whitespace-nowrap capitalize"
      tone={status === "active" ? "green" : status === "pending" ? "amber" : "neutral"}
    >
      {status}
    </Badge>
  );
}

function SaveUserButton({ isProtected }: { isProtected: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button className="whitespace-nowrap" pending={pending} type="submit" variant="primary">
      {pending ? null : <Save className="h-4 w-4" />}
      {pending ? "Saving..." : isProtected ? "Save locked" : "Save"}
    </Button>
  );
}

function DeleteUserDialogActions() {
  const { pending } = useFormStatus();

  return (
    <AlertDialogFooter>
      <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
      <Button
        className="border-red-200 bg-red-600 text-white hover:bg-red-700"
        pending={pending}
        type="submit"
      >
        {pending ? "Deleting..." : "Delete user"}
      </Button>
    </AlertDialogFooter>
  );
}

function DeleteUserDialog({ profile }: { profile: UserTableRow }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger className="cms-btn border-red-200 bg-red-50 text-red-700 hover:bg-red-100">
        <Trash2 className="h-4 w-4" />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this user?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete <span className="font-semibold text-[var(--foreground)]">{displayName(profile)}</span>
            {" "}with email <span className="font-semibold text-[var(--foreground)]">{profile.email}</span>. If the account has linked operational records, deletion will be blocked so you can reassign records or mark the user inactive instead.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={deleteUserAction}>
          <input name="id" type="hidden" value={profile.id} />
          <DeleteUserDialogActions />
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const userColumns: ColumnDef<UserTableRow>[] = [
  {
    accessorFn: searchableIdentity,
    header: "User",
    id: "identity",
    cell: ({ row }) => {
      const profile = row.original;
      const protectedAdmin = isProtectedAdmin(profile);

      return (
        <div className="w-[260px] min-w-[260px] py-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="max-w-[180px] truncate font-semibold" title={displayName(profile)}>
              {displayName(profile)}
            </span>
            {protectedAdmin ? (
              <Badge className="whitespace-nowrap" tone="outline">
                <ShieldCheck className="h-3.5 w-3.5" />
                Protected
              </Badge>
            ) : null}
          </div>
          <div className="mt-1 truncate text-xs text-[var(--muted)]" title={profile.email}>
            {profile.email}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <div className="w-[96px] min-w-[96px]">
        <RoleBadge role={row.original.role} />
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="w-[108px] min-w-[108px]">
        <StatusBadge status={row.original.status} />
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="block w-[132px] min-w-[132px] truncate text-sm" title={row.original.phone || "None"}>
        {row.original.phone || "None"}
      </span>
    ),
  },
  {
    id: "edit",
    header: "Edit",
    enableSorting: false,
    cell: ({ row }) => {
      const profile = row.original;
      const protectedAdmin = isProtectedAdmin(profile);

      return (
        <form action={updateUserAction} className="grid min-w-[732px] grid-cols-[220px_140px_116px_116px_108px] gap-2">
          <input name="id" type="hidden" value={profile.id} />
          <Input className="w-full min-w-0" defaultValue={profile.name || ""} name="name" placeholder="Name" />
          <Input className="w-full min-w-0" defaultValue={profile.phone || ""} name="phone" placeholder="Phone" />
          {protectedAdmin ? <input name="role" type="hidden" value="admin" /> : null}
          <div className="w-[116px]">
            <Select defaultValue={profile.role} disabled={protectedAdmin} name="role">
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </Select>
          </div>
          {protectedAdmin ? <input name="status" type="hidden" value="active" /> : null}
          <div className="w-[116px]">
            <Select defaultValue={profile.status} disabled={protectedAdmin} name="status">
              {accountStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-[108px]">
            <SaveUserButton isProtected={protectedAdmin} />
          </div>
        </form>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => {
      const profile = row.original;

      if (isProtectedAdmin(profile)) {
        return (
          <Badge className="whitespace-nowrap" tone="outline">
            Locked
          </Badge>
        );
      }

      return <DeleteUserDialog profile={profile} />;
    },
  },
];
