import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils/cn";

const tones = {
  neutral: "bg-[var(--surface-2)] text-[#4a4a48]",
  brand: "border-red-100 bg-[var(--brand-soft)] text-[var(--brand-ink)]",
  green: "border-green-100 bg-[var(--green-soft)] text-green-800",
  amber: "border-yellow-100 bg-[var(--amber-soft)] text-yellow-800",
  teal: "border-sky-100 bg-[var(--teal-soft)] text-sky-800",
  default: "border-red-100 bg-[var(--brand-soft)] text-[var(--brand-ink)]",
  secondary: "bg-[var(--surface-2)] text-[#4a4a48]",
  destructive: "border-red-200 bg-red-50 text-red-700",
  outline: "border-[var(--border)] bg-transparent text-[var(--foreground)]",
};

export function Badge({
  children,
  className = "",
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: keyof typeof tones;
}) {
  return <span className={cn("cms-badge", tones[tone], className)}>{children}</span>;
}
