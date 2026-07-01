import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils/cn";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label>
      <span className="cms-label">{label}</span>
      {children}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("cms-input", className)} {...props} />;
}
