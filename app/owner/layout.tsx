import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/src/features/auth/auth-guards";

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole("owner");
  return (
    <DashboardShell mode="owner" profile={profile}>
      {children}
    </DashboardShell>
  );
}
