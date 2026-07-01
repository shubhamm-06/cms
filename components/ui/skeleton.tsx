import type { HTMLAttributes } from "react";
import { cn } from "@/src/lib/utils/cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-[var(--surface-2)]", className)} {...props} />;
}

