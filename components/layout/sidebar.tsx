import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import type { AppProfile } from "@/types/app.types";
import { adminNav, ownerNav } from "@/src/lib/constants/nav";
import { initials } from "@/src/lib/utils/format";

export async function Sidebar({
  profile,
  mode,
}: {
  profile: AppProfile;
  mode: "admin" | "owner";
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-current-path") || "";
  const nav = mode === "admin" ? adminNav : ownerNav;

  return (
    <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] p-3 md:flex md:flex-col">
      <Link href={mode === "admin" ? "/dashboard" : "/owner"} className="flex items-center gap-3 px-2 pb-5 pt-1">
        <Image src="/logo.png" alt="CurateMyStay" width={36} height={36} className="rounded-lg bg-[var(--surface-2)]" />
        <div>
          <div className="text-sm font-bold">CurateMyStay</div>
          <div className="text-[0.7rem] font-semibold text-[var(--muted)]">Operations Console</div>
        </div>
      </Link>
      <div className="px-2 pb-2 text-[0.65rem] font-bold uppercase tracking-wider text-[#b8b6af]">Workspace</div>
      <nav className="space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== `/${mode}` && pathname.startsWith(item.href));
          return (
            <Link
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                active
                  ? "bg-[var(--brand-soft)] text-[var(--brand-ink)]"
                  : "text-[#4a4a48] hover:bg-[var(--surface-2)]"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex items-center gap-3 border-t border-[var(--border)] px-2 pt-4">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--brand)] text-xs font-bold text-white">
          {initials(profile.name, profile.email)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-xs font-bold">{profile.name || profile.email}</div>
          <div className="text-[0.7rem] text-[var(--muted)]">{mode === "admin" ? "Admin" : "Owner"}</div>
        </div>
      </div>
    </aside>
  );
}
