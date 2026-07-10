import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { noIndexMetadata } from "@/app/seo";
import { requireRole } from "@/src/features/auth/auth-guards";

export const metadata: Metadata = noIndexMetadata;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole("admin");
  return (
    <DashboardShell mode="admin" profile={profile}>
      {children}
    </DashboardShell>
  );
}
