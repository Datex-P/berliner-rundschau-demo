// Runtime validation for API responses — guards against CMS schema drift
// All types in the mock dataset are correctly coded (no string-encoded booleans/numbers),
// so these functions primarily serve as safety nets for future CMS integration.
import type {
  Article,
  Category,
  Author,
  BreakingNews,
  NewstickerItem,
  Video,
  Navigation,
  SiteConfig,
  Quiz,
  StockData,
} from "@/types";

export function isRecord(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

function parseImage(raw: unknown): Article["image"] {
  if (!isRecord(raw)) {
    return { alt: "", fallbackSrc: "", crops: [], sizes: [] };
  }
  return {
    alt: String(raw.alt ?? ""),
    fallbackSrc: String(raw.fallbackSrc ?? ""),
    crops: Array.isArray(raw.crops)
      ? raw.crops.filter(isRecord).map((crop) => ({
          name: String(crop.name ?? ""),
          srcset: Array.isArray(crop.srcset)
            ? crop.srcset.filter(isRecord).map((entry) => ({
                src: String(entry.src ?? ""),
                imageWidth: String(entry.imageWidth ?? ""),
              }))
            : [],
        }))
      : [],
    sizes: Array.isArray(raw.sizes) ? raw.sizes.map(String) : [],
    caption: raw.caption ? String(raw.caption) : undefined,
    credit: raw.credit ? String(raw.credit) : undefined,
  };
}

function parseCategoryRef(raw: unknown): Article["category"] {
  if (!isRecord(raw)) {
    return { id: "", name: "", slug: "" };
  }
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? ""),
  };
}

function parseAuthorRef(raw: unknown): Article["author"] {
  if (!isRecord(raw)) {
    return { id: "", name: "", slug: "", avatar: "" };
  }
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? ""),
    avatar: String(raw.avatar ?? ""),
  };
}

function parsePaywall(raw: unknown): Article["paywall"] {
  if (raw === "paid" || raw === "metered") return raw;
  return "free";
}

function parseComments(raw: unknown): Article["comments"] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isRecord).map((c) => ({
    id: Number(c.id ?? 0),
    author: String(c.author ?? ""),
    text: String(c.text ?? ""),
    date: String(c.date ?? ""),
    likes: Number(c.likes ?? 0),
  }));
}

function parseSocialLinks(raw: unknown): Author["socialLinks"] {
  if (!isRecord(raw)) return undefined;
  return {
    twitter: raw.twitter ? String(raw.twitter) : undefined,
    linkedin: raw.linkedin ? String(raw.linkedin) : undefined,
    website: raw.website ? String(raw.website) : undefined,
  };
}

export function parseArticle(raw: Record<string, unknown>): Article {
  return {
    id: String(raw.id ?? ""),
    headline: String(raw.headline ?? ""),
    slug: String(raw.slug ?? ""),
    teaser: String(raw.teaser ?? ""),
    body: String(raw.body ?? ""),
    publicationDate: String(raw.publicationDate ?? ""),
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
    image: parseImage(raw.image),
    category: parseCategoryRef(raw.category),
    author: parseAuthorRef(raw.author),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    readingTimeMinutes: Number(raw.readingTimeMinutes ?? 0),
    commentCount: Number(raw.commentCount ?? 0),
    isPremium: raw.isPremium === true || raw.isPremium === "true",
    paywall: parsePaywall(raw.paywall),
    isLive: raw.isLive === true,
    isOpinion: raw.isOpinion === true,
    isFeatured: raw.isFeatured === true,
    isBreaking: raw.isBreaking === true,
    seoTitle: raw.seoTitle ? String(raw.seoTitle) : undefined,
    seoDescription: raw.seoDescription ? String(raw.seoDescription) : undefined,
    source: raw.source ? String(raw.source) : undefined,
    aiSummary: String(raw.aiSummary ?? ""),
    region: String(raw.region ?? ""),
    comments: parseComments(raw.comments),
  };
}

export function parseArticlesResponse(data: unknown): Article[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map(parseArticle);
}

export function parseCategory(raw: Record<string, unknown>): Category {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? ""),
    path: String(raw.path ?? ""),
    description: String(raw.description ?? ""),
    color: String(raw.color ?? ""),
    children: Array.isArray(raw.children)
      ? raw.children.filter(isRecord).map((child) => ({
          id: String(child.id ?? ""),
          name: String(child.name ?? ""),
          slug: String(child.slug ?? ""),
          path: String(child.path ?? ""),
          description: String(child.description ?? ""),
        }))
      : [],
    articleCount: Number(raw.articleCount ?? 0),
  };
}

export function parseCategoriesResponse(data: unknown): Category[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map(parseCategory);
}

export function parseAuthor(raw: Record<string, unknown>): Author {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? ""),
    avatar: String(raw.avatar ?? ""),
    bio: String(raw.bio ?? ""),
    role: String(raw.role ?? ""),
    socialLinks: parseSocialLinks(raw.socialLinks),
  };
}

export function parseAuthorsResponse(data: unknown): Author[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map(parseAuthor);
}

function isValidSlug(slug: string): boolean {
  return slug.trim() !== "" && !slug.includes("/");
}

export function parseSlugEntry(
  raw: Record<string, unknown>,
): { slug: string; modified: string } | null {
  const slug = String(raw.slug ?? "");
  if (!isValidSlug(slug)) return null;
  return { slug, modified: String(raw.modified ?? raw.updatedAt ?? "") };
}

export function parseSlugEntriesResponse(
  data: unknown,
): Array<{ slug: string; modified: string }> {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map(parseSlugEntry)
    .filter(
      (entry): entry is { slug: string; modified: string } => entry !== null,
    );
}

export function parseBreakingNews(raw: Record<string, unknown>): BreakingNews {
  const severity = raw.severity === "alert" ? "alert" : "breaking";
  return {
    id: String(raw.id ?? ""),
    headline: String(raw.headline ?? ""),
    href: String(raw.href ?? ""),
    severity,
    publishedAt: String(raw.publishedAt ?? ""),
    expiresAt: raw.expiresAt ? String(raw.expiresAt) : undefined,
  };
}

export function parseBreakingNewsResponse(data: unknown): BreakingNews[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map(parseBreakingNews);
}

export function parseNewstickerItem(
  raw: Record<string, unknown>,
): NewstickerItem {
  const headline = isRecord(raw.headline) ? raw.headline : {};
  return {
    id: String(raw.id ?? ""),
    type: String(raw.type ?? ""),
    topic: String(raw.topic ?? ""),
    headline: {
      label: String(headline.label ?? ""),
      href: String(headline.href ?? ""),
    },
    publicationDate: String(raw.publicationDate ?? ""),
    isPremium: raw.isPremium === true || raw.isPremium === "true",
  };
}

export function parseNewstickerResponse(data: unknown): NewstickerItem[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map(parseNewstickerItem);
}

function parseVideoSource(raw: unknown): Video["sources"] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isRecord).map((s) => ({
    src: String(s.src ?? ""),
    extension: s.extension === "mp4" ? ("mp4" as const) : ("m3u8" as const),
  }));
}

export function parseVideo(raw: Record<string, unknown>): Video {
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    sources: parseVideoSource(raw.sources),
    poster: String(raw.poster ?? ""),
    durationSeconds: Number(raw.durationSeconds ?? 0),
    caption: String(raw.caption ?? ""),
    category: String(raw.category ?? ""),
    publishedAt: String(raw.publishedAt ?? ""),
  };
}

export function parseVideosResponse(data: unknown): Video[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map(parseVideo);
}

function parseMenuItem(raw: unknown): Navigation["primaryMenu"][number] | null {
  if (!isRecord(raw)) return null;
  const ref = isRecord(raw.reference) ? raw.reference : {};
  const refType = ref.type === "EXTERNAL" ? "EXTERNAL" : "SECTION";
  const children = Array.isArray(raw.children)
    ? (raw.children
        .map(parseMenuItem)
        .filter(Boolean) as Navigation["primaryMenu"])
    : undefined;
  return {
    reference: {
      type: refType as "SECTION" | "EXTERNAL",
      href: String(ref.href ?? ""),
      label: String(ref.label ?? ""),
      isActive: ref.isActive === true ? true : undefined,
    },
    commercial: raw.commercial === true,
    children,
  };
}

function parseSocialLink(
  raw: unknown,
): Navigation["socialLinks"][number] | null {
  if (!isRecord(raw)) return null;
  return {
    platform: String(raw.platform ?? ""),
    url: String(raw.url ?? ""),
    label: String(raw.label ?? ""),
  };
}

export function parseNavigation(raw: Record<string, unknown>): Navigation {
  return {
    primaryMenu: Array.isArray(raw.primaryMenu)
      ? (raw.primaryMenu
          .map(parseMenuItem)
          .filter(Boolean) as Navigation["primaryMenu"])
      : [],
    footerMenu: Array.isArray(raw.footerMenu)
      ? (raw.footerMenu
          .map(parseMenuItem)
          .filter(Boolean) as Navigation["primaryMenu"])
      : [],
    socialLinks: Array.isArray(raw.socialLinks)
      ? (raw.socialLinks
          .map(parseSocialLink)
          .filter(Boolean) as Navigation["socialLinks"])
      : [],
  };
}

function parseSiteConfigSocialLink(
  raw: unknown,
): SiteConfig["socialLinks"][number] | null {
  if (!isRecord(raw)) return null;
  return {
    platform: String(raw.platform ?? ""),
    url: String(raw.url ?? ""),
  };
}

export function parseSiteConfig(raw: Record<string, unknown>): SiteConfig {
  const analytics = isRecord(raw.analytics) ? raw.analytics : {};
  return {
    title: String(raw.title ?? ""),
    description: String(raw.description ?? ""),
    url: String(raw.url ?? ""),
    language: String(raw.language ?? "de"),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    socialLinks: Array.isArray(raw.socialLinks)
      ? (raw.socialLinks
          .map(parseSiteConfigSocialLink)
          .filter(Boolean) as SiteConfig["socialLinks"])
      : [],
    analytics: { gtmId: String(analytics.gtmId ?? "") },
  };
}

function parseQuizQuestion(
  raw: unknown,
): Quiz["dailyQuiz"]["questions"][number] | null {
  if (!isRecord(raw)) return null;
  return {
    id: Number(raw.id ?? 0),
    question: String(raw.question ?? ""),
    options: Array.isArray(raw.options) ? raw.options.map(String) : [],
    correctIndex: Number(raw.correctIndex ?? 0),
    explanation: String(raw.explanation ?? ""),
  };
}

function parseStreakReward(raw: unknown): Quiz["streakRewards"][number] | null {
  if (!isRecord(raw)) return null;
  return {
    days: Number(raw.days ?? 0),
    badge: String(raw.badge ?? ""),
    emoji: String(raw.emoji ?? ""),
  };
}

export function parseQuiz(raw: Record<string, unknown>): Quiz {
  const daily = isRecord(raw.dailyQuiz) ? raw.dailyQuiz : {};
  return {
    dailyQuiz: {
      date: String(daily.date ?? ""),
      title: String(daily.title ?? ""),
      questions: Array.isArray(daily.questions)
        ? (daily.questions
            .map(parseQuizQuestion)
            .filter(Boolean) as Quiz["dailyQuiz"]["questions"])
        : [],
    },
    streakRewards: Array.isArray(raw.streakRewards)
      ? (raw.streakRewards
          .map(parseStreakReward)
          .filter(Boolean) as Quiz["streakRewards"])
      : [],
  };
}

function parseStockIndex(raw: unknown): StockData["indices"][number] | null {
  if (!isRecord(raw)) return null;
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    value: Number(raw.value ?? 0),
    change: Number(raw.change ?? 0),
    changePercent: Number(raw.changePercent ?? 0),
    currency: String(raw.currency ?? ""),
    sparkline: Array.isArray(raw.sparkline) ? raw.sparkline.map(Number) : [],
  };
}

function parseWatchlistItem(
  raw: unknown,
): StockData["watchlist"][number] | null {
  if (!isRecord(raw)) return null;
  return {
    id: String(raw.id ?? ""),
    symbol: String(raw.symbol ?? ""),
    name: String(raw.name ?? ""),
    price: Number(raw.price ?? 0),
    change: Number(raw.change ?? 0),
    changePercent: Number(raw.changePercent ?? 0),
    marketCap: String(raw.marketCap ?? ""),
    pe: raw.pe != null ? Number(raw.pe) : null,
    sector: String(raw.sector ?? ""),
  };
}

function parseChartData(
  raw: unknown,
): Record<string, Record<string, number[]>> {
  if (!isRecord(raw)) return {};
  const result: Record<string, Record<string, number[]>> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (isRecord(value)) {
      const inner: Record<string, number[]> = {};
      for (const [k, v] of Object.entries(value)) {
        inner[k] = Array.isArray(v) ? v.map(Number) : [];
      }
      result[key] = inner;
    }
  }
  return result;
}

export function parseStockData(raw: Record<string, unknown>): StockData {
  return {
    indices: Array.isArray(raw.indices)
      ? (raw.indices
          .map(parseStockIndex)
          .filter(Boolean) as StockData["indices"])
      : [],
    watchlist: Array.isArray(raw.watchlist)
      ? (raw.watchlist
          .map(parseWatchlistItem)
          .filter(Boolean) as StockData["watchlist"])
      : [],
    chartData: parseChartData(raw.chartData),
  };
}
