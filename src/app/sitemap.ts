import type { MetadataRoute } from "next";
import { getArticleSlugs, getCategories } from "@/lib/data";
import { SITE_CONFIG } from "@/lib/config";
import { routes } from "@/lib/navigation";
import type { Category } from "@/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articleSlugs: Array<{ slug: string; modified: string }> = [];
  let categories: Category[] = [];

  try {
    [articleSlugs, categories] = await Promise.all([
      getArticleSlugs(),
      getCategories(),
    ]);
  } catch {
    // Build-time fallback — CMS unavailable
  }

  const articleEntries: MetadataRoute.Sitemap = articleSlugs.map((a) => ({
    url: `${SITE_CONFIG.url}${routes.article(a.slug)}`,
    lastModified: a.modified,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_CONFIG.url}${routes.category(category.slug)}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [
    {
      url: SITE_CONFIG.url,
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${SITE_CONFIG.url}/suche`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...categoryEntries,
    ...articleEntries,
  ];
}
