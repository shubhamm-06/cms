import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function OwnerProfileLoading() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--cream)] shadow-[0_18px_40px_rgba(34,34,34,0.06)]">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_280px] lg:items-end">
          <div>
            <Skeleton className="mb-4 h-6 w-40 rounded-full" />
            <Skeleton className="h-10 w-36" />
            <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
            <Skeleton className="mt-2 h-4 w-3/4 max-w-xl" />
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4">
            <Skeleton className="h-3 w-28" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-4/5" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.9fr)_minmax(260px,0.55fr)]">
        <Card className="overflow-hidden border-[var(--border)]">
          <CardHeader subtitle=" " title="Personal contact details" />
          <CardBody>
            <div className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-2 h-11 w-full" />
                  <Skeleton className="mt-2 h-3 w-4/5" />
                </div>
                <div>
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-2 h-11 w-full" />
                  <Skeleton className="mt-2 h-3 w-4/5" />
                </div>
              </div>
              <div>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-2 h-11 w-full" />
                <Skeleton className="mt-2 h-3 w-4/5" />
              </div>
              <div className="border-t border-[var(--border)] pt-5">
                <Skeleton className="h-4 w-full max-w-md" />
                <Skeleton className="mt-4 h-11 w-full sm:w-32" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="overflow-hidden border-[var(--border)]">
          <CardHeader subtitle=" " title="Account information" />
          <CardBody>
            <div className="space-y-5">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
