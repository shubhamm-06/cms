import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex items-center gap-2 p-6 text-sm text-[var(--muted)]">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading
    </div>
  );
}
