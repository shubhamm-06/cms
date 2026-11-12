import { goaStaysCopy } from "@/src/features/goa-stays/goa-stays-copy";

export function GoaStaysHowItWorks() {
  return (
    <section className="scroll-mt-20 bg-public-cream px-4 py-12 sm:px-6 sm:py-14 md:px-8 lg:scroll-mt-24 lg:py-16" id="how-it-works">
      <div className="mx-auto grid max-w-[1180px] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-14">
        <div className="min-w-0">
          <h2 className="text-[26px] font-extrabold tracking-[-0.02em] text-public-ink sm:text-[30px]">{goaStaysCopy.howItWorks.heading}</h2>
          <ol className="relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-1">
            <span aria-hidden="true" className="absolute bottom-5 left-5 top-5 w-px bg-public-hairline sm:hidden lg:block" />
            {goaStaysCopy.howItWorks.steps.map((step, index) => (
              <li className="relative z-10 flex min-w-0 items-start gap-4 rounded-2xl border border-public-hairline bg-white p-4 shadow-sm md:p-5" key={step.title}>
                <span className="ring-4 ring-public-cream flex size-10 shrink-0 items-center justify-center rounded-full bg-public-coral text-base font-bold text-white">{index + 1}</span>
                <div className="min-w-0">
                  <p className="text-base font-semibold leading-tight text-public-ink md:text-lg">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-public-muted md:text-base">{step.line}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="mx-auto mt-8 aspect-[500/1024] w-[min(78vw,300px)] md:w-[320px] lg:mx-0 lg:mt-0 lg:w-[340px]">
          <iframe
            aria-hidden="true"
            className="pointer-events-none block h-full w-full border-0 bg-transparent"
            loading="lazy"
            src="/cms-whatsapp-demo/index.html"
            tabIndex={-1}
            title="How booking on WhatsApp works"
          />
        </div>
      </div>
    </section>
  );
}
