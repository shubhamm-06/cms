import { lastMinuteGoaNewYearArticle } from "./last-minute-villa-goa-new-year-2027";
import { topThingsToDoInGoaArticle } from "./top-5-things-to-do-in-goa";
import type { Article } from "./types";

const articles: Article[] = [lastMinuteGoaNewYearArticle, topThingsToDoInGoaArticle];

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getAllSlugs() {
  return articles.map((article) => article.slug);
}

export function getAllArticles() {
  return [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
