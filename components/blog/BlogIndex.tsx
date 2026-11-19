import Image from "next/image";
import Link from "next/link";

export type BlogIndexArticle = {
  slug: string;
  title: string;
  description: string;
  coverImage?: { src: string; alt: string };
  publishedAt: string;
  readingTime: number;
};

export function BlogIndex({ articles }: { articles: BlogIndexArticle[] }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
      <section aria-label="All articles" className="mt-8 grid gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg" key={article.slug}>
            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
              {article.coverImage ? (
                <Image
                  alt={article.coverImage.alt}
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  src={article.coverImage.src}
                />
              ) : (
                <Image
                  alt=""
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 object-contain opacity-40"
                  height={48}
                  src="/logo.png"
                  width={48}
                />
              )}
            </div>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <p className="text-xs text-neutral-500">{article.readingTime} min read</p>
              <h2 className="mt-3 text-xl font-bold leading-snug text-neutral-900">
                <Link className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-coral" href={`/blog/${article.slug}`}>
                  {article.title}
                </Link>
              </h2>
              <p className="mt-3 line-clamp-3 text-base leading-relaxed text-neutral-600">{article.description}</p>
              <span aria-hidden="true" className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-neutral-900">
                Read article
                <svg className="h-4 w-4 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                </svg>
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
