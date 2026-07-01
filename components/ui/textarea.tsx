import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils/cn";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("cms-input min-h-28", className)} {...props} />;
}
