import { LogOut } from "lucide-react";
import { logoutAction } from "@/src/features/auth/auth-actions";
import { Button } from "@/components/ui/button";
import type { AppProfile } from "@/types/app.types";

export function Topbar({ profile }: { profile: AppProfile }) {
  return (
    <header className="sticky top-0 z-20 flex h-[60px] items-center gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-5">
      <div>
        <div className="text-sm font-bold">CurateMyStay</div>
        <div className="text-xs text-[var(--muted)]">Signed in as {profile.email}</div>
      </div>
      <form action={logoutAction} className="ml-auto">
        <Button variant="ghost" type="submit">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </form>
    </header>
  );
}
