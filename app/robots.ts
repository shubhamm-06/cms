import type { MetadataRoute } from "next";
import { siteOrigin } from "@/app/seo";
import { publicCrawlerAgents, publicCrawlerDisallow } from "@/src/lib/constants/crawlers";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: publicCrawlerDisallow,
      },
      ...publicCrawlerAgents.map((userAgent) => ({ userAgent, allow: "/", disallow: publicCrawlerDisallow })),
    ],
    sitemap: `${siteOrigin}/sitemap.xml`,
  };
}
