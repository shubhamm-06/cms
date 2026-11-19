export type Inline = string;
export type Block =
  | { type: "p"; text: Inline }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul" | "ol"; items: Inline[] }
  | { type: "pullquote"; text: Inline }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "sources"; items: { label: string; url?: string }[] }
  | { type: "faq"; items: { q: string; a: string }[] }
  | { type: "cta"; heading: string; text: string };

export type Article = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  category?: string;
  heroImage?: { src: string; alt: string };
  coverImage?: { src: string; alt: string };
  blocks: Block[];
};
