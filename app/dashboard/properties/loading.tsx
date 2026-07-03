import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertiesLoading() {
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-3 h-4 w-[34rem] max-w-full" />
        </div>
      </div>
      <Card className="mb-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <CardHeader>
          <div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-3 h-4 w-72 max-w-full" />
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid gap-4 md:grid-cols-12">
            <Skeleton className="h-20 md:col-span-7" />
            <Skeleton className="h-20 md:col-span-3" />
            <Skeleton className="h-20 md:col-span-2" />
            <Skeleton className="h-28 md:col-span-7" />
            <Skeleton className="h-28 md:col-span-5" />
            <Skeleton className="h-20 md:col-span-3" />
            <Skeleton className="h-20 md:col-span-2" />
            <Skeleton className="h-20 md:col-span-7" />
          </div>
        </CardBody>
      </Card>
      <Card className="overflow-hidden shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <CardHeader>
          <div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-3 h-4 w-48" />
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton className="h-12 w-full" key={index} />
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
