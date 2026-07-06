import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPayoutsLoading() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--cream)] shadow-[0_18px_40px_rgba(34,34,34,0.06)]">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <Skeleton className="mb-4 h-6 w-48 rounded-full" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="mt-4 h-4 w-full max-w-3xl" />
            <Skeleton className="mt-2 h-4 w-4/5 max-w-2xl" />
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4">
            <Skeleton className="h-3 w-44" />
            <Skeleton className="mt-3 h-8 w-32" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-4/5" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4" key={index}>
            <Skeleton className="h-3 w-36" />
            <Skeleton className="mt-3 h-8 w-28" />
            <Skeleton className="mt-3 h-3 w-full" />
          </div>
        ))}
      </section>

      <Card className="overflow-hidden border-[var(--border)]">
        <CardHeader subtitle=" " title="Owner payout statements" />
        <CardBody className="p-0">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <Skeleton className="h-10 w-full max-w-xs rounded-lg" />
          </div>
          <div className="space-y-0">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="flex min-w-[1500px] gap-4 border-b border-[var(--border)] px-4 py-4" key={index}>
                <Skeleton className="h-10 w-[132px] flex-none" />
                <Skeleton className="h-10 w-[200px] flex-none" />
                {Array.from({ length: 8 }).map((__, amountIndex) => (
                  <Skeleton className="h-6 w-[140px] flex-none" key={amountIndex} />
                ))}
                <Skeleton className="h-6 w-[155px] flex-none rounded-full" />
                <Skeleton className="h-6 w-[170px] flex-none rounded-full" />
                <Skeleton className="h-9 w-[220px] flex-none" />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-5">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card className="overflow-hidden border-[var(--border)]" key={index}>
            <CardHeader>
              <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Skeleton className="h-6 w-56" />
                  <Skeleton className="mt-3 h-4 w-80 max-w-full" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[520px]">
                  {Array.from({ length: 4 }).map((__, metricIndex) => (
                    <Skeleton className="h-12 w-full" key={metricIndex} />
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="space-y-0">
                {Array.from({ length: 3 }).map((__, rowIndex) => (
                  <div className="flex min-w-[760px] gap-4 border-b border-[var(--border)] px-4 py-4" key={rowIndex}>
                    <Skeleton className="h-6 w-[220px] flex-none" />
                    {Array.from({ length: 5 }).map((___, colIndex) => (
                      <Skeleton className="h-6 w-[96px] flex-none" key={colIndex} />
                    ))}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
