import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <div className="mb-5">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-full max-w-xl" />
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card className="border-[var(--border)] bg-white" key={index}>
            <CardBody className="p-4">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-10 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-3 w-28" />
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-[var(--border)]">
        <CardHeader>
          <div className="w-full space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
        </CardHeader>
        <CardBody>
          <Skeleton className="h-10 w-72" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton className="h-12 w-full" key={index} />
            ))}
          </div>
        </CardBody>
      </Card>
    </>
  );
}
