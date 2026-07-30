"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav, ownerNav } from "@/src/lib/constants/nav";
import { cn } from "@/src/lib/utils/cn";

type NavigationMode = "admin" | "owner" | "demo";

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

export function isNavItemActive(pathname: string, href: string, mode: NavigationMode) {
  const currentPath = normalizePath(pathname);
  const itemPath = normalizePath(href);
  const rootPath = mode === "admin" ? "/dashboard" : mode === "demo" ? "/demo" : "/owner";

  if (itemPath === rootPath) {
    return currentPath === itemPath;
  }

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

export function NavigationLinks({
  className,
  mode,
  variant = "desktop",
}: {
  className?: string;
  mode: NavigationMode;
  variant?: "desktop" | "mobile";
}) {
  const pathname = usePathname();
  const nav = mode === "admin" ? adminNav : ownerNav;
  const isOwner = mode === "owner" || mode === "demo";
  const isMobile = variant === "mobile";
  const isDemo = mode === "demo";

  return (
    <nav
      aria-label={mode === "admin" ? "Admin navigation" : "Owner navigation"}
      className={cn(isMobile ? "flex gap-2 overflow-x-auto px-4 py-3" : "space-y-1", className)}
    >
      {nav.map((item) => {
        const Icon = item.icon;
        const active = isDemo ? item.href === "/owner" : isNavItemActive(pathname, item.href, mode);
        const unavailable = isDemo && item.href !== "/owner";

        return (
          <Link
            aria-current={active ? "page" : undefined}
            aria-disabled={unavailable || undefined}
            tabIndex={unavailable ? -1 : undefined}
            className={cn(
              "group relative inline-flex items-center gap-2 rounded-lg text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]",
              isMobile ? "min-h-10 shrink-0 px-3 py-2" : "w-full px-3 py-2",
              unavailable && "cursor-not-allowed opacity-45 hover:bg-transparent hover:text-[#4a4a48]",
              active
                ? cn(
                    "border border-red-100 bg-[var(--brand-soft)] text-[var(--brand-ink)] shadow-[0_1px_0_rgba(194,54,58,0.06)]",
                    isOwner && "border-orange-100 bg-[#fff4ec] text-[#aa3f24] shadow-[0_6px_16px_rgba(170,63,36,0.06)]",
                  )
                : "border border-transparent text-[#4a4a48] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]",
            )}
            href={unavailable ? "/demo" : isDemo ? "/demo" : item.href}
            key={item.href}
          >
            {!isMobile && active ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-1 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[var(--brand)]",
                  isOwner && "bg-[var(--orange)]",
                )}
              />
            ) : null}
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                active ? (isOwner ? "text-[#aa3f24]" : "text-[var(--brand)]") : "text-[#7a7973] group-hover:text-[var(--foreground)]",
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
