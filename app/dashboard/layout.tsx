import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/src/features/auth/auth-guards";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole("admin");
  return (
    <DashboardShell mode="admin" profile={profile}>
      {children}
    </DashboardShell>
  );
}
