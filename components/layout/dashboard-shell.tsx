import type { ReactNode } from "react";
import type { AppProfile } from "@/types/app.types";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export async function DashboardShell({
  children,
  mode,
  profile,
}: {
  children: ReactNode;
  mode: "admin" | "owner";
  profile: AppProfile;
}) {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar mode={mode} profile={profile} />
      <main className="min-w-0 flex-1">
        <Topbar profile={profile} />
        <div className="p-5 md:p-7">{children}</div>
      </main>
    </div>
  );
}
