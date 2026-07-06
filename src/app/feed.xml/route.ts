import { getArticles } from "@/lib/data";
import { SITE_CONFIG } from "@/lib/config";
import { routes } from "@/lib/navigation";
import type { Article } from "@/types";

/** XML-escape CMS data to prevent injection */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<Response> {
  let articles: Article[] = [];
  try {
    articles = await getArticles();
  } catch {
    // CMS unavailable — empty feed fallback
  }

  const items = articles
    .slice(0, 20)
    .map(
      (article) => `
    <item>
      <title><![CDATA[${article.headline}]]></title>
      <link>${escapeXml(`${SITE_CONFIG.url}${routes.article(article.slug)}`)}</link>
      <description><![CDATA[${article.teaser}]]></description>
      <pubDate>${new Date(article.publicationDate).toUTCString()}</pubDate>
      <guid isPermaLink="true">${escapeXml(`${SITE_CONFIG.url}${routes.article(article.slug)}`)}</guid>
      <category>${escapeXml(article.category.name)}</category>
      <dc:creator>${escapeXml(article.author.name)}</dc:creator>
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_CONFIG.name)}</title>
    <link>${escapeXml(SITE_CONFIG.url)}</link>
    <description>${escapeXml(SITE_CONFIG.description)}</description>
    <language>de-DE</language>
    <atom:link href="${escapeXml(SITE_CONFIG.url)}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml.trim(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
