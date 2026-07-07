import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPnlLoading() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--cream)] shadow-[0_18px_40px_rgba(34,34,34,0.06)]">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <Skeleton className="mb-4 h-6 w-52 rounded-full" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="mt-4 h-4 w-full max-w-3xl" />
            <Skeleton className="mt-2 h-4 w-4/5 max-w-2xl" />
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-3 h-8 w-32" />
            <Skeleton className="mt-3 h-3 w-full" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4" key={index}>
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-3 h-8 w-28" />
            <Skeleton className="mt-3 h-3 w-full" />
          </div>
        ))}
      </section>

      <Card className="overflow-hidden border-[var(--border)]">
        <CardHeader title="Property P&L records" subtitle=" " />
        <CardBody className="p-0">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <Skeleton className="h-10 w-full max-w-xs rounded-lg" />
          </div>
          <div className="space-y-0">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="flex min-w-[990px] gap-4 border-b border-[var(--border)] px-4 py-4" key={index}>
                <Skeleton className="h-12 w-[240px] flex-none" />
                {Array.from({ length: 5 }).map((__, amountIndex) => (
                  <Skeleton className="h-6 w-[150px] flex-none" key={amountIndex} />
                ))}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
