import type { Block, Inline } from "@/content/blog/types";
import { BlogCta } from "./BlogCta";
import { InlineWhatsAppLink } from "./InlineWhatsAppLink";

function renderInline(text: Inline) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return parts.map((part, index) => {
    const bold = /^\*\*(.+)\*\*$/.exec(part);
    if (bold) return <strong className="font-semibold text-neutral-900" key={index}>{bold[1]}</strong>;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link && link[2] === "WHATSAPP_LINK_HELPER") {
      return <InlineWhatsAppLink key={index}>{link[1]}</InlineWhatsAppLink>;
    }
    if (link && link[2].startsWith("/")) {
      return <a className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-coral" href={link[2]} key={index}>{link[1]}</a>;
    }
    return part;
  });
}

function headingId(text: string) {
  return text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s-]+/g, "-");
}

export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return <div className="text-[1.125rem] leading-[1.8] text-neutral-800 sm:text-[1.25rem]">
    {blocks.map((block, index) => {
      switch (block.type) {
        case "p": return <p className="mt-7" key={index}>{renderInline(block.text)}</p>;
        case "h2": return <h2 className="mt-14 scroll-mt-24 text-2xl font-bold leading-snug tracking-tight text-neutral-900 sm:text-[1.75rem]" id={headingId(block.text)} key={index}>{block.text}</h2>;
        case "h3": return <h3 className="mt-9 text-xl font-semibold leading-snug text-neutral-900" key={index}>{block.text}</h3>;
        case "ul": case "ol": {
          const List = block.type === "ul" ? "ul" : "ol";
          return <List className={`mt-6 space-y-3 pl-6 marker:text-neutral-400 ${block.type === "ul" ? "list-disc" : "list-decimal"}`} key={index}>{block.items.map((item, i) => <li key={i}>{renderInline(item)}</li>)}</List>;
        }
        case "pullquote": return <blockquote className="my-10 border-l-[3px] border-neutral-900 pl-5 text-xl font-medium leading-snug text-neutral-900 sm:text-2xl" key={index}>{renderInline(block.text)}</blockquote>;
        case "table": return <div className="mt-8 max-w-full overflow-x-auto" key={index}><table className="w-full min-w-[560px] text-left text-base"><thead className="border-b border-neutral-300 text-sm font-semibold text-neutral-600"><tr>{block.head.map((cell) => <th className="py-3 pr-4" key={cell} scope="col">{cell}</th>)}</tr></thead><tbody>{block.rows.map((row, rowIndex) => <tr className="align-top border-b border-neutral-200" key={rowIndex}>{row.map((cell, cellIndex) => <td className="py-4 pr-4" key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
        case "sources": return <p className="mt-3 text-sm leading-relaxed text-neutral-600" key={index}><span className="font-medium">Sources:</span> {block.items.map((item, i) => <span key={item.label}>{i ? " · " : ""}{item.url ? <a className="underline underline-offset-2 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-coral" href={item.url} rel="noopener noreferrer" target="_blank">{item.label}</a> : item.label}</span>)}</p>;
        case "faq": return <div key={index}>{block.items.map((item) => <section key={item.q}><h3 className="mt-9 text-xl font-semibold leading-snug text-neutral-900">{item.q}</h3><p className="mt-2">{item.a}</p></section>)}</div>;
        case "cta": return <BlogCta heading={block.heading} text={block.text} key={index} />;
      }
    })}
  </div>;
}
