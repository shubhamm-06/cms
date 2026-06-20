import type { ReactNode } from "react";

const tones = {
  neutral: "bg-[var(--surface-2)] text-[#4a4a48]",
  brand: "border-red-100 bg-[var(--brand-soft)] text-[var(--brand-ink)]",
  green: "border-green-100 bg-[var(--green-soft)] text-green-800",
  amber: "border-yellow-100 bg-[var(--amber-soft)] text-yellow-800",
  teal: "border-sky-100 bg-[var(--teal-soft)] text-sky-800",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
}) {
  return <span className={`cms-badge ${tones[tone]}`}>{children}</span>;
}
