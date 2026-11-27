import type { MetadataRoute } from "next";
import { siteOrigin } from "@/app/seo";
import { propertySeo } from "@/src/lib/property-seo";
import { loadPublicCatalogue } from "@/src/features/catalogue/public-catalogue-data";
import { getAllSlugs, getArticle } from "@/content/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalogue = await loadPublicCatalogue();
  const propertySlugs = catalogue.failed
    ? Object.keys(propertySeo)
    : catalogue.properties.map((property) => property.slug);
  const uniquePropertySlugs = [...new Set(propertySlugs.filter(Boolean))];

  return [
    { url: `${siteOrigin}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    {
      url: siteOrigin,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteOrigin}/property-management-proposal`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteOrigin}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteOrigin}/property-management-goa`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteOrigin}/case-studies`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteOrigin}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://curatemystay.net/privacy-policy",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${siteOrigin}/booking`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteOrigin}/goa-villa-stays`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteOrigin}/corporate-offsite-villas-goa`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...uniquePropertySlugs.map((slug) => ({
      url: new URL(`/property/${slug}`, siteOrigin).href,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...getAllSlugs().map((slug) => ({
      url: new URL(`/blog/${slug}`, siteOrigin).href,
      lastModified: getArticle(slug)?.updatedAt,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
