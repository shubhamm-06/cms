import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Figtree } from "next/font/google";
import { getAllSlugs, getArticle } from "@/content/blog";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ShareBar } from "@/components/blog/ShareBar";
import { GuestHeader } from "@/components/home/guest-header";
import { PublicFooter } from "@/components/home/public-footer";
import { business } from "@/src/lib/business";
import { ogImage, twitterImage } from "@/app/seo";

const blogFont = Figtree({ display: "swap", subsets: ["latin"], variable: "--font-homepage" });
const articlePath = (slug: string) => `${business.url}/blog/${slug}`;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const url = articlePath(article.slug);
  return {
    title: { absolute: article.seoTitle },
    description: article.description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { type: "article", url, title: article.seoTitle, description: article.description, publishedTime: article.publishedAt, modifiedTime: article.updatedAt, siteName: business.name, images: [ogImage] },
    twitter: { card: "summary_large_image", title: article.seoTitle, description: article.description, images: [twitterImage] },
  };
}

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function readingMinutes(article: NonNullable<ReturnType<typeof getArticle>>) {
  const blockText = article.blocks.flatMap((block) => {
    switch (block.type) {
      case "p": case "h2": case "h3": case "pullquote": return [block.text];
      case "ul": case "ol": return block.items;
      case "table": return [...block.head, ...block.rows.flat()];
      case "sources": return block.items.map((item) => item.label);
      case "faq": return block.items.flatMap((item) => [item.q, item.a]);
      case "cta": return [block.heading, block.text];
    }
  });
  const text = blockText.join(" ");
  return Math.ceil(wordCount(text.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")) / 220);
}

function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const canonical = articlePath(article.slug);
  const faq = article.blocks.find((block) => block.type === "faq");
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, datePublished: article.publishedAt, dateModified: article.updatedAt, author: { "@type": "Organization", name: "CurateMyStay" }, publisher: { "@type": "Organization", name: "CurateMyStay", logo: { "@type": "ImageObject", url: `${business.url}/logo.png` } }, mainEntityOfPage: canonical, url: canonical },
    ...(faq?.type === "faq" ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.items.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }] : []),
  ];
  const published = new Date(`${article.publishedAt}T00:00:00`);
  const dateLabel = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(published);
  const minutes = readingMinutes(article);

  return <div className={`${blogFont.variable} cms-homepage`}>
    <ReadingProgress />
    {jsonLd.map((data) => <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} key={data["@type"]} type="application/ld+json" />)}
    <main className="min-h-screen bg-white font-sans text-neutral-900 antialiased">
      <GuestHeader page="blog" />
      <article className="mx-auto w-full max-w-[680px] px-5 pb-24 sm:px-6">
        <header className="pt-10 sm:pt-16">
          <Link className="mb-5 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900" href="/blog"><span aria-hidden="true">←</span>All articles</Link>
          <h1 className="text-[2rem] font-bold leading-[1.15] tracking-tight text-neutral-900 sm:text-5xl">{article.title}</h1>
          <p className="mt-4 text-lg leading-snug text-neutral-600 sm:text-xl">{article.description}</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <Image alt="" aria-hidden="true" className="h-10 w-10 rounded-full object-contain" height={40} src="/logo.png" width={40} />
            <span className="font-medium">{article.author}</span><span className="text-neutral-600">{minutes} min read</span><span aria-hidden="true" className="text-neutral-500">·</span><time className="text-neutral-600" dateTime={article.publishedAt}>{dateLabel}</time>
          </div>
          <div className="mt-5"><ShareBar /></div>
        </header>
        {article.heroImage ? <figure className="mt-8"><Image alt={article.heroImage.alt} className="w-full rounded-lg" height={420} src={article.heroImage.src} width={680} /><figcaption className="mt-2 text-sm text-neutral-600" /></figure> : null}
        <div className="mt-2"><ArticleBody blocks={article.blocks} /></div>
        <div className="mt-10"><ShareBar /></div>
      </article>
      <PublicFooter analyticsLocation="blog_article_end" />
    </main>
  </div>;
}
