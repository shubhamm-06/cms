import { Skeleton } from "@/components/ui/skeleton";

export default function BookingLoading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="h-[480px] w-full bg-[#efeae4] sm:h-[560px] lg:h-[680px] xl:h-[720px]" />

      <div className="relative z-10 -mt-12 lg:-mt-[40px]">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 md:px-8">
          <div className="mx-auto h-[92px] max-w-[980px] rounded-3xl border border-[#dddddd] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.14)] lg:h-[79px] lg:rounded-full" />
        </div>

        <div className="mx-auto max-w-[1180px] px-4 pb-2 pt-10 sm:px-6 sm:pb-4 sm:pt-12 md:px-8 lg:pt-14">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <Skeleton className="h-11 w-40 rounded-full" />
              <Skeleton className="h-11 w-32 rounded-full" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>

          <div className="mt-7 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                className="overflow-hidden rounded-2xl border border-[#ebebeb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                key={index}
              >
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="p-4 sm:p-[18px]">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-1/2" />
                  <Skeleton className="mt-3 h-5 w-2/5 rounded-full" />
                  <Skeleton className="mt-3 h-4 w-4/5" />
                  <div className="mt-4 flex items-end justify-between gap-3 border-t border-[#f2ede9] pt-3.5">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-5 w-24 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
