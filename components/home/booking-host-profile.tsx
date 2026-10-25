"use client";

import Image from "next/image";
import { useState } from "react";
import { buildGuestHeaderWhatsAppMessage } from "@/src/features/catalogue/guest-whatsapp-message";
import { trackWhatsAppClick } from "@/src/lib/analytics";
import { HOST_PROFILE } from "@/src/lib/constants/host-profile";
import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";

const whatsappUrl = getPublicWhatsAppUrl(buildGuestHeaderWhatsAppMessage());

/** Uses the existing host data, photo fallback, and WhatsApp click tracking. */
export function BookingHostProfile() {
  const host = HOST_PROFILE;
  const [photoFailed, setPhotoFailed] = useState(false);
  const coHostFirstNames = host.coHosts.map((name) => name.split(" ")[0]);

  return (
    <div className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-x-4 gap-y-5 rounded-2xl border border-[#e7e5df] bg-white p-5 md:grid-cols-[180px_minmax(0,1fr)] md:gap-x-10 md:p-8">
      {photoFailed ? (
        <span aria-hidden="true" className="col-start-1 row-start-1 grid size-20 place-items-center rounded-full bg-[#f1efe9] text-2xl font-semibold text-[#5c5c57] md:row-span-4 md:h-56 md:w-[180px] md:rounded-xl">
          {host.name.slice(0, 1)}
        </span>
      ) : (
        <Image
          alt={`${host.name}, your host`}
          className="col-start-1 row-start-1 size-20 rounded-full object-cover md:row-span-4 md:h-56 md:w-[180px] md:rounded-xl"
          height={224}
          onError={() => setPhotoFailed(true)}
          sizes="(min-width: 768px) 180px, 80px"
          src={host.photoUrl}
          width={180}
        />
      )}

      <div className="col-start-2 row-start-1 min-w-0">
        <p className="text-[13px] uppercase tracking-widest text-[#5c5c57]">Your host</p>
        <h3 className="mt-1 text-[22px] font-semibold leading-tight text-[#1f1f1d] lg:text-2xl">{host.name}</h3>
      </div>
      <p className="col-span-2 max-w-[620px] text-base font-normal leading-relaxed text-[#2b2b28] md:col-span-1 md:col-start-2">{host.bio}</p>

      {/* Omit the host's 229 reviews / 4.97 rating: they conflict with the portfolio stats (150+ / 4.98). */}
      <ul className="col-span-2 flex max-w-[620px] flex-wrap gap-2 text-[13px] leading-5 text-[#5c5c57] md:col-span-1 md:col-start-2">
        {host.isSuperhost ? <li className="rounded-full bg-[#f1efe9] px-3 py-1">Superhost</li> : null}
        {coHostFirstNames.length > 0 ? (
          <li className="rounded-full bg-[#f1efe9] px-3 py-1">Co-hosted with {coHostFirstNames.join(" and ")}</li>
        ) : null}
        <li className="rounded-full bg-[#f1efe9] px-3 py-1"><span className="hidden md:inline">Usually replies </span><span className="md:hidden">Replies </span>{host.responseTime}</li>
      </ul>

      {whatsappUrl ? (
        <a
          className="col-span-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1f1f1d] px-5 py-3 text-sm font-semibold transition-colors hover:bg-[#3b3b37] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f1f1d] md:col-span-1 md:col-start-2 md:w-fit"
          href={whatsappUrl}
          onClick={() => trackWhatsAppClick("booking_host_profile")}
          rel="noopener noreferrer"
          target="_blank"
        >
          {/* The inner span keeps white text above the global anchor color rule. */}
          <span className="text-white">Say hi on WhatsApp</span>
          <svg aria-hidden="true" className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12h16m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
      ) : null}
    </div>
  );
}
