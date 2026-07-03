import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function MetricSkeleton() {
  return (
    <Card className="rounded-2xl border-[var(--border)] bg-white">
      <CardBody className="p-5">
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <Skeleton className="mt-5 h-4 w-32" />
        <Skeleton className="mt-3 h-9 w-36" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-4/5" />
      </CardBody>
    </Card>
  );
}

function ListSkeleton() {
  return (
    <Card className="rounded-2xl border-[var(--border)] bg-white">
      <CardBody className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <Skeleton className="h-4 w-14" />
        </div>
        <div className="mt-5 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton className="h-16 w-full rounded-2xl" key={index} />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.25fr_0.75fr] lg:p-8">
          <div>
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="mt-5 h-10 w-full max-w-xl" />
            <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
            <Skeleton className="mt-2 h-5 w-4/5 max-w-xl" />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--cream)] p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="mt-5 h-32 w-full rounded-xl" />
          </div>
        </div>
      </section>

      <section>
        <Skeleton className="h-6 w-56" />
        <Skeleton className="mt-2 h-4 w-full max-w-xl" />
        <div className="mt-3 grid gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <MetricSkeleton key={index} />
          ))}
        </div>
      </section>

      <ListSkeleton />

      <div className="grid gap-5 xl:grid-cols-2">
        <ListSkeleton />
        <ListSkeleton />
      </div>

      <ListSkeleton />

      <ListSkeleton />
    </div>
  );
}
