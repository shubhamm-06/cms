import {
  KeyRound,
  LifeBuoy,
  MessageCircle,
  PackageCheck,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * Guest-facing stay support. Every line is existing approved copy from the
 * homepage "Property operations" service card, so nothing here claims a service
 * CurateMyStay does not already provide. No pricing is shown, because none is
 * configured anywhere in the repository.
 *
 * This section has no CTA of its own; the shared floating WhatsApp button
 * carries the contact action on /booking.
 */
const staySupport: { icon: LucideIcon; title: string }[] = [
  { icon: MessageCircle, title: "Guest coordination: pre, in & post-stay" },
  { icon: KeyRound, title: "Check-in & check-out (or self check-in)" },
  { icon: Sparkles, title: "Housekeeping & deep cleans between stays" },
  { icon: PackageCheck, title: "Linen, toiletries & consumables restocking" },
  { icon: Wrench, title: "Minor repairs and on-call maintenance" },
  { icon: LifeBuoy, title: "24/7 guest support by our team" },
];

export function BookingGuestServices() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-[88px]">
        <div className="mx-auto max-w-[620px] text-center">
          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ff5a5f]">
            While you&rsquo;re here
          </div>
          <h2 className="mt-3.5 text-[28px] font-extrabold tracking-[-0.02em] text-[#222222] sm:text-[32px] md:text-4xl">
            We can do more than the room
          </h2>
          <p className="mt-3 text-[16px] leading-[1.6] text-[#717171] sm:text-[17px]">
            Every stay is looked after by our own team rather than an outsourced front desk. Message
            us if you need anything while you are here.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-[18px] sm:mt-11 sm:grid-cols-2 lg:grid-cols-3">
          {staySupport.map((item) => {
            const Icon = item.icon;

            return (
              <div
                className="flex min-w-0 items-center gap-4 rounded-2xl border border-[#ebebeb] bg-white p-5"
                key={item.title}
              >
                <span
                  aria-hidden="true"
                  className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[14px] bg-[#eaf3f5]"
                >
                  <Icon className="h-[26px] w-[26px] text-[#3c8399]" />
                </span>
                <span className="min-w-0 text-[15.5px] font-semibold leading-[1.35] text-[#222222]">
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
