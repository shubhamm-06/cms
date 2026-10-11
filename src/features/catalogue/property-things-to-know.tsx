"use client";

import { Check, ChevronRight, MessageCircle, ScrollText, ShieldCheck, type LucideIcon } from "lucide-react";
import { createElement, useState } from "react";
import { ShowMoreDialog } from "@/components/ui/show-more-dialog";

/**
 * "Things to know" for `/property/[slug]`: three columns from `md`, stacked rows
 * with chevrons below it. Every block opens its full list in the shared dialog;
 * on desktop the column previews the first items and shows the button only
 * when there is more to read. Blocks with no items are not passed in.
 */

export type ThingsToKnowBlock = {
  icon: "enquiry" | "rules" | "safety";
  items: string[];
  showAllLabel: string;
  title: string;
};

const blockIcons: Record<ThingsToKnowBlock["icon"], LucideIcon> = {
  enquiry: MessageCircle,
  rules: ScrollText,
  safety: ShieldCheck,
};

const previewCount = 3;

function ItemList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li className="flex min-w-0 items-start gap-2.5" key={item}>
          <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-public-taupe" />
          <span className="min-w-0 text-[14.5px] leading-6 text-public-body [overflow-wrap:anywhere]">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Block({ block }: { block: ThingsToKnowBlock }) {
  const [open, setOpen] = useState(false);
  const icon = blockIcons[block.icon];

  return (
    <div className="min-w-0 border-b border-public-hairline md:border-b-0">
      {/* Mobile: the whole row opens the dialog. */}
      <button
        className="flex min-h-[72px] w-full items-center gap-3 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-public-coral md:hidden"
        onClick={() => setOpen(true)}
        type="button"
      >
        {createElement(icon, { "aria-hidden": true, className: "h-6 w-6 shrink-0 text-public-ink" })}
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-semibold text-public-ink">{block.title}</span>
          <span className="block truncate text-[14px] text-public-muted">{block.items[0]}</span>
        </span>
        <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-public-ink" />
      </button>

      {/* Desktop: a column with a preview. */}
      <div className="hidden md:block">
        {createElement(icon, { "aria-hidden": true, className: "mb-3 h-6 w-6 text-public-ink" })}
        <h3 className="mb-3 text-[16.5px] font-bold text-public-ink">{block.title}</h3>
        <ItemList items={block.items.slice(0, previewCount)} />
        {block.items.length > previewCount ? (
          <button
            className="mt-3 inline-flex min-h-11 items-center gap-1 rounded-lg text-[15px] font-semibold text-public-ink underline underline-offset-4 outline-none hover:text-public-coral-hover focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2"
            onClick={() => setOpen(true)}
            type="button"
          >
            {block.showAllLabel}
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <ShowMoreDialog onOpenChange={setOpen} open={open} title={block.title}>
        <ItemList items={block.items} />
      </ShowMoreDialog>
    </div>
  );
}

export function PropertyThingsToKnow({ blocks }: { blocks: ThingsToKnowBlock[] }) {
  if (blocks.length === 0) return null;

  return (
    <section aria-labelledby="things-to-know-heading">
      <h2
        className="mb-2 text-[21px] font-bold leading-tight tracking-[-0.01em] text-public-ink sm:text-[23px] md:mb-6"
        id="things-to-know-heading"
      >
        Things to know
      </h2>
      <div className="grid md:grid-cols-3 md:gap-8">
        {blocks.map((block) => (
          <Block block={block} key={block.title} />
        ))}
      </div>
    </section>
  );
}
