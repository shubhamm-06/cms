"use client";

import Image from "next/image";
import type { MouseEvent } from "react";
import { goaStaysCopy, type GoaStayGroupId } from "@/src/features/goa-stays/goa-stays-copy";

/** Static class names so Tailwind sees each one: one row of up to four cards from `md`. */
const mdColumns = ["md:grid-cols-1", "md:grid-cols-1", "md:grid-cols-2", "md:grid-cols-3", "md:grid-cols-4"];

function scrollToGroup(event: MouseEvent<HTMLAnchorElement>, id: GoaStayGroupId) {
  const target = document.getElementById(id);
  if (!target) return;

  event.preventDefault();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  window.history.replaceState(null, "", `#${id}`);
}

/** `coverUrl` is the first cover photo in the group, or null for a text-only card. */
export function GoaStaysPicker({ groups }: { groups: { coverUrl: string | null; id: GoaStayGroupId }[] }) {
  if (groups.length === 0) return null;

  return (
    <section aria-labelledby="find-your-stay" className="px-4 pt-12 sm:px-6 sm:pt-14 md:px-8 lg:pt-16">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="text-[26px] font-extrabold tracking-[-0.02em] text-public-ink sm:text-[30px]" id="find-your-stay">
          {goaStaysCopy.picker.heading}
        </h2>
        <ul className={`mt-5 grid grid-cols-1 gap-3 md:gap-4 ${mdColumns[Math.min(groups.length, 4)]}`}>
          {groups.map(({ coverUrl, id }) => (
            <li className="min-w-0" key={id}>
              <a
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-public-hairline bg-white transition-colors hover:border-public-control hover:bg-public-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2"
                href={`#${id}`}
                onClick={(event) => scrollToGroup(event, id)}
              >
                {coverUrl ? (
                  <span className="relative block aspect-[16/9] w-full overflow-hidden md:aspect-[4/3]">
                    <Image
                      alt=""
                      className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      src={coverUrl}
                    />
                  </span>
                ) : null}
                <span className="flex flex-col p-5">
                  <span className="text-[17px] font-bold tracking-[-0.01em] text-public-ink">{goaStaysCopy.groups[id].title}</span>
                  <span className="mt-1 text-[15px] leading-6 text-public-body">{goaStaysCopy.groups[id].line}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
