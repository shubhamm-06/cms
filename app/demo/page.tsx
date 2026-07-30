import type { Metadata } from "next";
import { noIndexMetadata } from "@/app/seo";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DemoOwnerOverview } from "@/src/features/demo/demo-owner-overview";
import { demoOwnerProfile } from "@/src/features/demo/demo-owner-data";

export const metadata: Metadata = noIndexMetadata;

export default function DemoPage() {
  return (
    <DashboardShell mode="demo" profile={demoOwnerProfile}>
      <DemoOwnerOverview />
    </DashboardShell>
  );
}
