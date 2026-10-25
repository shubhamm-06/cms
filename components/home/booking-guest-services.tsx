import {
  KeyRound,
  LifeBuoy,
  MessageCircle,
  PackageCheck,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/** Existing approved support copy and data shape, rendered as plain lists. */
const staySupport: { icon: LucideIcon; title: string }[] = [
  { icon: MessageCircle, title: "Guest coordination: pre, in & post-stay" },
  { icon: KeyRound, title: "Check-in & check-out (or self check-in)" },
  { icon: Sparkles, title: "Housekeeping & deep cleans between stays" },
  { icon: PackageCheck, title: "Linen, toiletries & consumables restocking" },
  { icon: Wrench, title: "Minor repairs and on-call maintenance" },
  { icon: LifeBuoy, title: "24/7 guest support by our team" },
];

const supportGroups = [
  { label: "For you", items: [staySupport[0], staySupport[1], staySupport[5]] },
  { label: "For the place", items: [staySupport[2], staySupport[3], staySupport[4]] },
];

export function BookingGuestServices() {
  return (
    <section aria-labelledby="guest-services-title" className="bg-white text-[#1f1f1d] [font-family:var(--font-homepage)]">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <div className="grid items-start gap-10 border-t border-[#e3e0d8] py-14 lg:grid-cols-[5fr_7fr] lg:gap-20 lg:py-24">
          <div className="min-w-0">
            <h2 id="guest-services-title" className="text-[28px] font-bold leading-[1.12] tracking-tight lg:text-4xl">
              We can do more than the room
            </h2>
            <p className="mt-6 max-w-[400px] text-base leading-relaxed text-[#4a4a45] lg:text-[17px]">
              Every stay is looked after by our own team rather than an outsourced front desk. Message us if you need anything while you are here.
            </p>
          </div>

          <div className="grid min-w-0 gap-8 md:grid-cols-2 md:gap-12">
            {supportGroups.map((group) => (
              <div key={group.label}>
                <h3 className="pb-4 text-lg font-semibold">{group.label}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li className="border-t border-[#e3e0d8] py-3.5 text-base leading-relaxed text-[#2b2b28] lg:py-4" key={item.title}>
                      {item.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
