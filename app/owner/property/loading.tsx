import { Skeleton } from "@/components/ui/skeleton";

function DetailSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-5 w-32" />
        </div>
      </div>
    </div>
  );
}

function ShareSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-3 h-9 w-20" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-4/5" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-[0_18px_55px_rgba(22,24,29,0.06)] sm:p-6">
        <Skeleton className="mb-4 h-6 w-44 rounded-full" />
        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <Skeleton className="h-11 w-full max-w-sm" />
            <Skeleton className="mt-4 h-5 w-full max-w-2xl" />
            <Skeleton className="mt-2 h-5 w-4/5 max-w-xl" />
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--cream)] p-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-[0_18px_55px_rgba(22,24,29,0.05)]">
        <div className="grid gap-5 border-b border-[var(--border)] p-5 sm:p-6 lg:grid-cols-[1fr_0.36fr]">
          <div className="flex min-w-0 gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-8 w-full max-w-md" />
              <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
              <Skeleton className="mt-2 h-4 w-3/4 max-w-xl" />
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--cream)] p-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-3 h-9 w-28" />
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <DetailSkeleton key={index} />
          ))}
        </div>

        <div className="grid gap-4 border-t border-[var(--border)] bg-[var(--surface-2)]/35 p-5 sm:grid-cols-2 sm:p-6">
          <ShareSkeleton />
          <ShareSkeleton />
        </div>

        <div className="border-t border-[var(--border)] p-5 sm:p-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
          <Skeleton className="mt-2 h-4 w-4/5 max-w-xl" />
        </div>
      </section>
    </div>
  );
}
