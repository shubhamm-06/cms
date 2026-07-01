import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "secondary" | "ghost" | "danger" | "destructive" | "outline" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  pending?: boolean;
  children?: ReactNode;
};

export function Button({
  children,
  className = "",
  pending,
  size = "default",
  variant = "secondary",
  ...props
}: ButtonProps) {
  const variants = {
    default: "cms-btn cms-btn-primary",
    primary: "cms-btn cms-btn-primary",
    secondary: "cms-btn bg-white text-[var(--foreground)] hover:bg-[var(--surface-2)]",
    ghost: "cms-btn cms-btn-ghost text-[var(--foreground)] hover:bg-[var(--surface-2)]",
    danger: "cms-btn border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    destructive: "cms-btn border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    outline: "cms-btn bg-white text-[var(--foreground)] hover:bg-[var(--surface-2)]",
    link: "inline-flex items-center justify-center gap-2 text-sm font-semibold text-[var(--brand-ink)] underline-offset-4 hover:underline",
  };
  const sizes = {
    default: "",
    sm: "min-h-9 px-3 py-1.5 text-xs",
    lg: "min-h-11 px-4 py-2.5 text-base",
    icon: "h-9 w-9 min-h-9 p-0",
  };

  return (
    <button className={cn(variants[variant], sizes[size], className)} disabled={pending || props.disabled} {...props}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
