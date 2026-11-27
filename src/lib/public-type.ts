/**
 * Type and button classes of the homepage (`components/home/reference-home.tsx`), for public
 * sections that need to match it without importing that client module. The values are copied from
 * its `Eyebrow`, `Heading`, `ButtonLink` and `h3` styles: change them together. Colour is left to
 * the caller, because it depends on the background.
 */
export const publicType = {
  eyebrow: "text-xs font-extrabold uppercase tracking-[0.18em]",
  h2: "text-[28px] font-extrabold leading-[1.12] sm:text-4xl md:text-[44px] md:leading-[1.08]",
  h3: "text-[28px] font-extrabold leading-[1.12] tracking-[-0.02em] sm:text-[32px]",
  subheading: "text-2xl font-extrabold",
  cardTitle: "text-[21px] font-extrabold tracking-[-0.01em]",
  body: "text-base leading-7 sm:text-[16.5px] sm:leading-[1.6]",
  button: "inline-flex min-h-11 max-w-full items-center justify-center gap-[9px] rounded-xl border text-center font-semibold leading-[1.2] transition-all duration-150 active:scale-[0.98]",
  buttonMd: "px-4 py-3 text-[15px] sm:px-[22px] sm:text-base",
  buttonLg: "px-5 py-3.5 text-base sm:px-7 sm:py-4 sm:text-[17px]",
};
