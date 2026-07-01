import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils/cn";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={cn("cms-card", className)}>{children}</section>;
}

export function CardHeader({
  children,
  title,
  subtitle,
  action,
}: {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
      {children ?? (
        <div>
          {title ? <h2 className="text-[0.95rem] font-bold">{title}</h2> : null}
          {subtitle ? <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p> : null}
        </div>
      )}
      {action}
    </div>
  );
}

export function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("text-[0.95rem] font-bold leading-none", className)}>{children}</h3>;
}

export function CardDescription({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sm text-[var(--muted)]", className)}>{children}</p>;
}

export function CardContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function CardFooter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-center border-t border-[var(--border)] px-5 py-4", className)}>{children}</div>;
}
