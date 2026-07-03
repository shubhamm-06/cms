import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function MetricSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-3 h-8 w-32" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-4/5" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-[0_18px_55px_rgba(22,24,29,0.06)] sm:p-6">
        <Skeleton className="mb-4 h-6 w-28 rounded-full" />
        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <Skeleton className="h-11 w-full max-w-md" />
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

      <section className="rounded-3xl border border-[var(--border)] bg-white shadow-[0_18px_55px_rgba(22,24,29,0.05)]">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 py-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full max-w-2xl">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="mt-3 h-6 w-72 max-w-full" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
          </div>
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <MetricSkeleton key={index} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-white shadow-[0_18px_55px_rgba(22,24,29,0.05)]">
        <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-3 h-6 w-72 max-w-full" />
          <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
          <Skeleton className="mt-2 h-4 w-4/5 max-w-xl" />
        </div>
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-3 sm:px-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <MetricSkeleton key={index} />
          ))}
        </div>
      </section>

      <Card className="rounded-3xl border-[var(--border)] shadow-[0_18px_55px_rgba(22,24,29,0.05)]">
        <CardHeader>
          <div className="w-full max-w-2xl">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-3 h-6 w-44" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
          </div>
          <Skeleton className="h-7 w-28 rounded-full" />
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[920px] p-4">
              <div className="grid grid-cols-[112px_128px_156px_132px_112px_136px_150px_1fr] gap-4 border-b border-[var(--border)] pb-3">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton className="h-4 w-full" key={index} />
                ))}
              </div>
              <div className="space-y-3 pt-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton className="h-12 w-full rounded-xl" key={index} />
                ))}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
