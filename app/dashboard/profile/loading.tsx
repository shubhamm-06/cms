import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardProfileLoading() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--cream)] shadow-[0_18px_40px_rgba(34,34,34,0.06)]">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_300px] lg:items-end">
          <div>
            <Skeleton className="mb-4 h-6 w-44 rounded-full" />
            <Skeleton className="h-10 w-36" />
            <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
            <Skeleton className="mt-2 h-4 w-4/5 max-w-xl" />
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4">
            <Skeleton className="h-3 w-32" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="mt-3 h-3 w-full" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.9fr)_minmax(260px,0.55fr)]">
        <Card className="overflow-hidden border-[var(--border)]">
          <CardHeader title="Editable personal details" subtitle=" " />
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="mt-4 h-20 w-full" />
            <div className="mt-5 border-t border-[var(--border)] pt-5">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="mt-3 h-4 w-full max-w-lg" />
            </div>
          </CardBody>
        </Card>

        <Card className="overflow-hidden border-[var(--border)]">
          <CardHeader title="Read-only account details" subtitle=" " />
          <CardBody>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index}>
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-2 h-6 w-40" />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
