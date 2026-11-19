import type { Article } from "@/content/blog/types";

export function readingMinutes(article: Article) {
  const text = article.blocks.flatMap((block) => {
    switch (block.type) {
      case "p": case "h2": case "h3": case "pullquote": return [block.text];
      case "ul": case "ol": return block.items;
      case "table": return [...block.head, ...block.rows.flat()];
      case "sources": return block.items.map((item) => item.label);
      case "faq": return block.items.flatMap((item) => [item.q, item.a]);
      case "cta": return [block.heading, block.text];
    }
  }).join(" ");
  return Math.ceil(text.trim().split(/\s+/).filter(Boolean).length / 220);
}
