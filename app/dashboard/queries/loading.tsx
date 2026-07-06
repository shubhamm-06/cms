import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardQueriesLoading() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--cream)] shadow-[0_18px_40px_rgba(34,34,34,0.06)]">
        <div className="p-5 sm:p-6">
          <Skeleton className="mb-4 h-6 w-44 rounded-full" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="mt-4 h-4 w-full max-w-3xl" />
          <Skeleton className="mt-2 h-4 w-4/5 max-w-2xl" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4" key={index}>
            <Skeleton className="h-3 w-36" />
            <Skeleton className="mt-3 h-8 w-20" />
            <Skeleton className="mt-3 h-3 w-full" />
          </div>
        ))}
      </section>

      <Card className="overflow-hidden border-[var(--border)]">
        <CardHeader title="Owner query history" subtitle=" " />
        <CardBody className="p-0">
          <div className="space-y-0">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="flex min-w-[1240px] gap-4 border-b border-[var(--border)] px-4 py-4" key={index}>
                <Skeleton className="h-12 w-[210px] flex-none" />
                <Skeleton className="h-12 w-[170px] flex-none" />
                <Skeleton className="h-12 w-[360px] flex-none" />
                <Skeleton className="h-6 w-[120px] flex-none rounded-full" />
                <Skeleton className="h-6 w-[140px] flex-none" />
                <Skeleton className="h-9 w-[240px] flex-none" />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
