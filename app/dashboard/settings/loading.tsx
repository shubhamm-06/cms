import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSettingsLoading() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--cream)] shadow-[0_18px_40px_rgba(34,34,34,0.06)]">
        <div className="p-5 sm:p-6">
          <Skeleton className="mb-4 h-6 w-36 rounded-full" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="mt-4 h-4 w-full max-w-3xl" />
          <Skeleton className="mt-2 h-4 w-4/5 max-w-2xl" />
        </div>
      </section>

      <Card className="overflow-hidden border-[var(--border)]">
        <CardHeader title="Dropdown option lists" subtitle=" " />
        <CardBody>
          <div className="grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="rounded-2xl border border-[var(--border)] bg-white p-4" key={index}>
                <Skeleton className="h-4 w-36" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
                <Skeleton className="mt-6 h-52 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-5 h-16 w-full rounded-2xl" />
          <div className="mt-5 flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-4 w-full max-w-lg" />
            <Skeleton className="h-10 w-36" />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
