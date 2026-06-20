import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  pending?: boolean;
  children: ReactNode;
};

export function Button({
  children,
  className = "",
  pending,
  variant = "secondary",
  ...props
}: ButtonProps) {
  const variants = {
    primary: "cms-btn cms-btn-primary",
    secondary: "cms-btn bg-white text-[var(--foreground)] hover:bg-[var(--surface-2)]",
    ghost: "cms-btn cms-btn-ghost text-[var(--foreground)] hover:bg-[var(--surface-2)]",
    danger: "cms-btn border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  };

  return (
    <button className={`${variants[variant]} ${className}`} disabled={pending || props.disabled} {...props}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
