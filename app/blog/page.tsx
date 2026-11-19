import type { Metadata } from "next";
import { GuestHeader } from "@/components/home/guest-header";
import { PublicFooter } from "@/components/home/public-footer";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { getAllArticles } from "@/content/blog";
import { siteOrigin } from "@/app/seo";
import { readingMinutes } from "./reading-time";

export const metadata: Metadata = { title: { absolute: "Goa Stay Guides and Travel Tips | CurateMyStay" }, description: "Practical guides for planning a villa stay in Goa, from booking tips to the best things to do.", alternates: { canonical: `${siteOrigin}/blog` }, robots: { index: true, follow: true }, openGraph: { type: "website", url: `${siteOrigin}/blog`, title: "Goa Stay Guides and Travel Tips | CurateMyStay", description: "Practical guides for planning a villa stay in Goa, from booking tips to the best things to do." }, twitter: { card: "summary_large_image", title: "Goa Stay Guides and Travel Tips | CurateMyStay", description: "Practical guides for planning a villa stay in Goa, from booking tips to the best things to do." } };

function serialize(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c"); }

export default function BlogPage() {
  const articles = getAllArticles();
  const collection = { "@context": "https://schema.org", "@type": "CollectionPage", name: "Goa Stay Guides and Travel Tips | CurateMyStay", mainEntity: { "@type": "ItemList", itemListElement: articles.map((article, index) => ({ "@type": "ListItem", position: index + 1, name: article.title, url: `${siteOrigin}/blog/${article.slug}` })) } };
  return <main className="min-h-screen bg-white font-sans text-neutral-900 antialiased"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(collection) }} /><GuestHeader page="booking" /><header className="mx-auto max-w-3xl px-5 pt-12 text-center sm:pt-16"><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Goa stay guides</h1><p className="mt-3 text-lg text-neutral-500">Practical tips for planning a villa stay in Goa.</p></header><BlogIndex articles={articles.map((article) => ({ slug: article.slug, title: article.title, description: article.description, coverImage: article.coverImage, publishedAt: article.publishedAt, readingTime: readingMinutes(article) }))} /><PublicFooter analyticsLocation="blog_index" /></main>;
}
