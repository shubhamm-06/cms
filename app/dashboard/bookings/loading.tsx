import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <div className="mb-5">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="mt-2 h-4 w-full max-w-xl" />
      </div>

      <Card className="mb-6 overflow-hidden border-[var(--border)]">
        <CardHeader>
          <div className="w-full space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full max-w-2xl" />
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <Skeleton className="mb-4 h-5 w-36" />
              <div className="grid gap-4 md:grid-cols-12">
                <Skeleton className="h-10 md:col-span-7" />
                <Skeleton className="h-10 md:col-span-5" />
                <Skeleton className="h-10 md:col-span-6" />
                <Skeleton className="h-10 md:col-span-6" />
                <Skeleton className="h-10 md:col-span-8" />
                <Skeleton className="h-10 md:col-span-4" />
              </div>
            </section>
            <section className="rounded-lg border border-[var(--border)] bg-white p-4">
              <Skeleton className="mb-4 h-5 w-32" />
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton className="h-10" key={index} />
                ))}
              </div>
            </section>
          </div>
          <Skeleton className="mt-5 h-24 w-full" />
        </CardBody>
      </Card>

      <Card className="overflow-hidden border-[var(--border)]">
        <CardHeader>
          <div className="w-full space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>
        </CardHeader>
        <CardBody>
          <Skeleton className="h-10 w-64" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton className="h-12 w-full" key={index} />
            ))}
          </div>
        </CardBody>
      </Card>
    </>
  );
}
