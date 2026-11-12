import { goaStaysCopy } from "@/src/features/goa-stays/goa-stays-copy";

export function GoaStaysVillaVsHotel() {
  return (
    <section className="scroll-mt-20 px-4 py-12 sm:px-6 sm:py-14 md:px-8 lg:scroll-mt-24 lg:py-16" id="villa-or-hotel">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="text-[26px] font-extrabold tracking-[-0.02em] text-public-ink sm:text-[30px]">{goaStaysCopy.villaOrHotel.heading}</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {goaStaysCopy.villaOrHotel.cards.map((card) => (
            <div className="min-w-0 rounded-2xl border border-public-hairline bg-white p-5 shadow-sm" key={card.title}>
              <p className="text-[17px] font-bold tracking-[-0.01em] text-public-ink">{card.title}</p>
              <p className="mt-1 text-[15px] leading-6 text-public-body">{card.line}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
