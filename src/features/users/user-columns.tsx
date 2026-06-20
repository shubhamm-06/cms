"use client";

import { Save } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { ConfirmDeleteButton } from "@/components/forms/confirm-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { deleteUserAction, updateUserAction } from "@/src/features/shared/actions";
import { accountStatuses } from "@/src/lib/constants/statuses";
import { isProtectedAdmin } from "@/src/lib/utils/permissions";
import type { Database } from "@/types/database.types";

export type UserTableRow = Database["public"]["Tables"]["profiles"]["Row"];

export const userColumns: ColumnDef<UserTableRow>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => {
      const profile = row.original;

      return (
        <div>
          <div className="font-semibold">{profile.name || profile.email}</div>
          <div className="text-xs text-[var(--muted)]">{profile.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge tone={row.original.role === "admin" ? "brand" : "teal"}>{row.original.role}</Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return <Badge tone={status === "active" ? "green" : status === "pending" ? "amber" : "neutral"}>{status}</Badge>;
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => row.original.phone || "None",
  },
  {
    id: "edit",
    header: "Edit",
    enableSorting: false,
    cell: ({ row }) => {
      const profile = row.original;

      return (
        <form action={updateUserAction} className="grid min-w-[560px] gap-2 md:grid-cols-[1fr_1fr_120px_120px_auto]">
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
          <Button type="submit" variant="primary">
            <Save className="h-4 w-4" />
            Save
          </Button>
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

      if (isProtectedAdmin(profile)) return <Badge tone="brand">Protected</Badge>;

      return (
        <form action={deleteUserAction}>
          <input name="id" type="hidden" value={profile.id} />
          <ConfirmDeleteButton />
        </form>
      );
    },
  },
];
