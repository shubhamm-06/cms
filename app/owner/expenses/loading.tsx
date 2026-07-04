import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function OwnerExpensesLoading() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--cream)] shadow-[0_18px_40px_rgba(34,34,34,0.06)]">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_300px] lg:items-end">
          <div>
            <Skeleton className="mb-4 h-6 w-40 rounded-full" />
            <Skeleton className="h-10 w-44" />
            <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
            <Skeleton className="mt-2 h-4 w-4/5 max-w-xl" />
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4">
            <Skeleton className="h-3 w-44" />
            <Skeleton className="mt-3 h-8 w-32" />
            <Skeleton className="mt-3 h-3 w-full" />
          </div>
        </div>
      </section>

      <Card className="overflow-hidden">
        <CardHeader
          action={<Skeleton className="h-6 w-24 rounded-full" />}
          subtitle=" "
          title="Property expense history"
        />
        <CardBody className="p-0">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <Skeleton className="h-10 w-full max-w-xs rounded-lg" />
          </div>
          <div className="space-y-0">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="grid min-w-[760px] grid-cols-[0.9fr_1.4fr_1.1fr_1fr_1.7fr_0.9fr] gap-4 border-b border-[var(--border)] px-4 py-4" key={index}>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="ml-auto h-6 w-24" />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
