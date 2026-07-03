"use client";

import { DataTable } from "@/components/ui/data-table";
import { userColumns, type UserTableRow } from "@/src/features/users/user-columns";

export function UsersTable({ profiles }: { profiles: UserTableRow[] }) {
  return (
    <DataTable
      columns={userColumns}
      data={profiles}
      embedded
      emptyMessage="No users are available yet. Public signups will appear here for approval."
      pageSize={8}
      searchPlaceholder="Search name, email, or phone..."
    />
  );
}
