import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyLoading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-5 sm:px-6 sm:pb-20 md:px-8">
        <Skeleton className="h-5 w-24" />

        <div className="mt-4 mb-4 sm:mb-5">
          <Skeleton className="h-9 w-3/4 max-w-lg" />
          <Skeleton className="mt-3 h-5 w-56" />
        </div>

        {/* Gallery */}
        <Skeleton className="aspect-[4/3] w-full rounded-2xl lg:hidden" />
        <div className="hidden h-[440px] grid-cols-[1.4fr_1fr] gap-2 lg:grid">
          <Skeleton className="h-full w-full rounded-[20px]" />
          <div className="grid grid-cols-2 grid-rows-2 gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton className="h-full w-full rounded-[20px]" key={index} />
            ))}
          </div>
        </div>

        <div className="pt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_384px] lg:gap-14 lg:pt-10">
          <div className="min-w-0">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton className="h-[60px] w-full rounded-[14px]" key={index} />
              ))}
            </div>

            <div className="mt-8 space-y-3">
              <Skeleton className="h-7 w-52" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            <div className="mt-8 space-y-3">
              <Skeleton className="h-7 w-64" />
              <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton className="my-2 h-5 w-4/5" key={index} />
                ))}
              </div>
            </div>
          </div>

          {/* Enquiry card */}
          <div className="mt-8 lg:mt-0">
            <Skeleton className="h-[300px] w-full rounded-[20px]" />
          </div>
        </div>
      </div>
    </main>
  );
}
