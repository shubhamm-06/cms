import { Skeleton } from "@/components/ui/skeleton";

function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[0_14px_34px_rgba(22,24,29,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="mt-5 h-4 w-28" />
      <Skeleton className="mt-3 h-8 w-32" />
    </div>
  );
}

function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton className="h-16 w-full rounded-2xl" key={index} />
      ))}
    </div>
  );
}

function SectionHeaderSkeleton() {
  return (
    <div className="border-b border-[var(--border)] px-5 py-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-3 h-6 w-56 max-w-full" />
      <Skeleton className="mt-3 h-4 w-full max-w-xl" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-[0_18px_55px_rgba(22,24,29,0.06)] sm:p-6">
        <Skeleton className="mb-4 h-6 w-32 rounded-full" />
        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <Skeleton className="h-11 w-full max-w-xl" />
            <Skeleton className="mt-4 h-5 w-full max-w-2xl" />
            <Skeleton className="mt-2 h-5 w-4/5 max-w-xl" />
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--cream)] p-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
          </div>
        </div>
      </section>

      <section>
        <Skeleton className="h-6 w-44" />
        <Skeleton className="mt-2 h-4 w-full max-w-xl" />
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <KpiSkeleton key={index} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-12 gap-5">
        <section className="col-span-12 rounded-3xl border border-[var(--border)] bg-white shadow-[0_14px_34px_rgba(22,24,29,0.04)] xl:col-span-8">
          <SectionHeaderSkeleton />
          <div className="overflow-x-auto">
            <div className="min-w-[760px] p-5">
              <div className="grid grid-cols-6 gap-4 border-b border-[var(--border)] pb-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton className="h-4 w-full" key={index} />
                ))}
              </div>
              <div className="space-y-3 pt-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton className="h-14 w-full rounded-xl" key={index} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="col-span-12 rounded-3xl border border-[var(--border)] bg-white shadow-[0_14px_34px_rgba(22,24,29,0.04)] xl:col-span-4">
          <SectionHeaderSkeleton />
          <ListSkeleton />
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-3xl border border-[var(--border)] bg-white shadow-[0_14px_34px_rgba(22,24,29,0.04)]">
          <SectionHeaderSkeleton />
          <ListSkeleton />
        </section>
        <section className="rounded-3xl border border-[var(--border)] bg-white shadow-[0_14px_34px_rgba(22,24,29,0.04)]">
          <SectionHeaderSkeleton />
          <div className="grid md:grid-cols-2">
            <ListSkeleton />
            <ListSkeleton />
          </div>
        </section>
      </div>
    </div>
  );
}
