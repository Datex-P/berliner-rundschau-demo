import type { CmsAdapter } from "./types";
import { sanitizeRichText } from "./sanitize";
import { normalizeImage } from "./image-utils";
import { parseFieldMap, mapField } from "./field-map";
import { safeFetch } from "./http";

// --- Config ---

const endpoint = process.env.HYGRAPH_ENDPOINT!;
const stage = process.env.HYGRAPH_STAGE ?? "PUBLISHED";
const articleModel = process.env.HYGRAPH_ARTICLE_MODEL ?? "Article";
const fieldMap = parseFieldMap(process.env.HYGRAPH_FIELD_MAP);

// "Article" -> "articles" (lowercase + s)
const queryName =
  articleModel.charAt(0).toLowerCase() + articleModel.slice(1) + "s";
// "Article" -> "articlesConnection"
const connectionName =
  articleModel.charAt(0).toLowerCase() + articleModel.slice(1) + "sConnection";
// "Article" -> "article" (lowercase, singular — for single-item queries)
const singleQueryName =
  articleModel.charAt(0).toLowerCase() + articleModel.slice(1);

// --- GraphQL helper ---

async function gqlQuery<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = process.env.HYGRAPH_ACCESS_TOKEN;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await safeFetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as {
    data: T;
    errors?: { message: string }[];
  };
  if (json.errors?.length) {
    throw new Error(
      `[hygraph] ${json.errors.map((e) => e.message).join(", ")}`,
    );
  }
  return json.data;
}

// --- Article fields fragment ---

const ARTICLE_FIELDS = `
  id
  ${mapField(fieldMap, "headline")}
  slug
  ${mapField(fieldMap, "teaser")}
  ${mapField(fieldMap, "body")} { html }
  createdAt
  updatedAt
  ${mapField(fieldMap, "image")} { url altText width height }
  ${mapField(fieldMap, "category")} { id name slug }
  ${mapField(fieldMap, "author")} { id name slug avatar { url } }
  ${mapField(fieldMap, "tags")}
  ${mapField(fieldMap, "readingTimeMinutes")}
  ${mapField(fieldMap, "isPremium")}
  ${mapField(fieldMap, "paywall")}
  ${mapField(fieldMap, "isLive")}
  ${mapField(fieldMap, "isOpinion")}
  ${mapField(fieldMap, "isFeatured")}
  ${mapField(fieldMap, "isBreaking")}
  ${mapField(fieldMap, "aiSummary")}
  ${mapField(fieldMap, "region")}
`;

// --- Record mappers ---

function mapRecord(
  record: Record<string, unknown>,
  fm: Record<string, string>,
): unknown {
  const body = record[mapField(fm, "body")] as Record<string, unknown> | null;
  const bodyHtml = body?.html ? sanitizeRichText(String(body.html)) : "";

  const img = record[mapField(fm, "image")] as Record<
    string,
    unknown
  > | null;
  const cat = record[mapField(fm, "category")] as Record<
    string,
    unknown
  > | null;
  const auth = record[mapField(fm, "author")] as Record<
    string,
    unknown
  > | null;
  const authAvatar = auth?.avatar as Record<string, unknown> | null;

  return {
    id: String(record.id ?? ""),
    headline: String(record[mapField(fm, "headline")] ?? ""),
    slug: String(record[mapField(fm, "slug")] ?? ""),
    teaser: String(record[mapField(fm, "teaser")] ?? ""),
    body: bodyHtml,
    publicationDate: String(record.createdAt ?? ""),
    updatedAt: String(record.updatedAt ?? ""),
    image: normalizeImage(
      img ? String(img.url ?? "") : null,
      img ? String(img.altText ?? img.alt ?? "") : undefined,
      img ? Number(img.width ?? 0) : undefined,
      img ? Number(img.height ?? 0) : undefined,
    ),
    category: cat
      ? {
          id: String(cat.id ?? ""),
          name: String(cat.name ?? ""),
          slug: String(cat.slug ?? ""),
        }
      : { id: "", name: "", slug: "" },
    author: auth
      ? {
          id: String(auth.id ?? ""),
          name: String(auth.name ?? ""),
          slug: String(auth.slug ?? ""),
          avatar: authAvatar ? String(authAvatar.url ?? "") : "",
        }
      : { id: "", name: "", slug: "", avatar: "" },
    tags: Array.isArray(record[mapField(fm, "tags")])
      ? record[mapField(fm, "tags")]
      : [],
    readingTimeMinutes: Number(
      record[mapField(fm, "readingTimeMinutes")] ?? 0,
    ),
    commentCount: 0,
    isPremium: record[mapField(fm, "isPremium")] === true,
    paywall: String(record[mapField(fm, "paywall")] ?? "free"),
    isLive: record[mapField(fm, "isLive")] === true,
    isOpinion: record[mapField(fm, "isOpinion")] === true,
    isFeatured: record[mapField(fm, "isFeatured")] === true,
    isBreaking: record[mapField(fm, "isBreaking")] === true,
    aiSummary: String(record[mapField(fm, "aiSummary")] ?? ""),
    region: String(record[mapField(fm, "region")] ?? ""),
    comments: [],
  };
}

function mapCategoryRecord(record: Record<string, unknown>): unknown {
  return {
    id: String(record.id ?? ""),
    name: String(record.name ?? ""),
    slug: String(record.slug ?? ""),
    path: `/${String(record.slug ?? "")}`,
    description: String(record.description ?? ""),
    color: String(record.color ?? ""),
    children: [],
    articleCount: 0,
  };
}

function mapAuthorRecord(record: Record<string, unknown>): unknown {
  const avatar = record.avatar as Record<string, unknown> | null;
  return {
    id: String(record.id ?? ""),
    name: String(record.name ?? ""),
    slug: String(record.slug ?? ""),
    avatar: avatar ? String(avatar.url ?? "") : "",
    bio: String(record.bio ?? ""),
    role: String(record.role ?? ""),
    socialLinks: {},
  };
}

// --- Adapter implementation ---

const hygraphAdapter: CmsAdapter = {
  name: "hygraph",

  async fetchAllArticles(): Promise<unknown[]> {
    const items: unknown[] = [];
    let skip = 0;
    const first = 100;
    const q = `
      query AllArticles($first: Int!, $skip: Int!, $stage: Stage!) {
        ${queryName}(first: $first, skip: $skip, stage: $stage, orderBy: createdAt_DESC) {
          ${ARTICLE_FIELDS}
        }
        ${connectionName}(stage: $stage) { aggregate { count } }
      }
    `;

    for (;;) {
      const result = await gqlQuery<Record<string, unknown>>(q, {
        first,
        skip,
        stage,
      });
      const batch = result[queryName];
      if (!Array.isArray(batch) || batch.length === 0) break;
      items.push(
        ...batch.map((r) => mapRecord(r as Record<string, unknown>, fieldMap)),
      );
      const conn = result[connectionName] as Record<string, unknown> | undefined;
      const agg = conn?.aggregate as Record<string, unknown> | undefined;
      const total = agg ? Number(agg.count ?? 0) : 0;
      skip += first;
      if (skip >= total) break;
    }

    return items;
  },

  async fetchArticleBySlug(slug: string): Promise<unknown | null> {
    const q = `
      query ArticleBySlug($slug: String!, $stage: Stage!) {
        ${singleQueryName}(where: { slug: $slug }, stage: $stage) {
          ${ARTICLE_FIELDS}
        }
      }
    `;
    const result = await gqlQuery<Record<string, unknown>>(q, { slug, stage });
    const record = result[singleQueryName] as Record<string, unknown> | null;
    return record ? mapRecord(record, fieldMap) : null;
  },

  async fetchArticlesByCategory(categorySlug: string): Promise<unknown[]> {
    const q = `
      query ArticlesByCategory($categorySlug: String!, $stage: Stage!) {
        ${queryName}(
          where: { category: { slug: $categorySlug } }
          stage: $stage
          first: 100
          orderBy: createdAt_DESC
        ) {
          ${ARTICLE_FIELDS}
        }
      }
    `;
    try {
      const result = await gqlQuery<Record<string, unknown>>(q, {
        categorySlug,
        stage,
      });
      const batch = result[queryName];
      if (!Array.isArray(batch)) return [];
      return batch.map((r) =>
        mapRecord(r as Record<string, unknown>, fieldMap),
      );
    } catch {
      // Fallback: fetch all and filter client-side
      const all = await this.fetchAllArticles();
      return (all as Record<string, unknown>[]).filter((a) => {
        const cat = a.category as Record<string, unknown> | undefined;
        return cat?.slug === categorySlug;
      });
    }
  },

  async searchArticlesByQuery(searchQuery: string): Promise<unknown[]> {
    const q = `
      query SearchArticles($searchQuery: String!, $stage: Stage!) {
        ${queryName}(
          where: { _search: $searchQuery }
          stage: $stage
          first: 20
          orderBy: createdAt_DESC
        ) {
          ${ARTICLE_FIELDS}
        }
      }
    `;
    try {
      const result = await gqlQuery<Record<string, unknown>>(q, {
        searchQuery,
        stage,
      });
      const batch = result[queryName];
      if (!Array.isArray(batch)) return [];
      return batch.map((r) =>
        mapRecord(r as Record<string, unknown>, fieldMap),
      );
    } catch {
      // Fallback: fetch all and filter client-side
      const all = await this.fetchAllArticles();
      const lower = searchQuery.toLowerCase();
      return (all as Record<string, unknown>[]).filter((a) => {
        const headline = String(a.headline ?? "").toLowerCase();
        const teaser = String(a.teaser ?? "").toLowerCase();
        return headline.includes(lower) || teaser.includes(lower);
      });
    }
  },

  async fetchArticleSlugs(): Promise<unknown[]> {
    const slugs: unknown[] = [];
    let skip = 0;
    const first = 100;
    const q = `
      query ArticleSlugs($first: Int!, $skip: Int!, $stage: Stage!) {
        ${queryName}(first: $first, skip: $skip, stage: $stage) {
          slug
        }
        ${connectionName}(stage: $stage) { aggregate { count } }
      }
    `;

    for (;;) {
      const result = await gqlQuery<Record<string, unknown>>(q, {
        first,
        skip,
        stage,
      });
      const batch = result[queryName];
      if (!Array.isArray(batch) || batch.length === 0) break;
      slugs.push(
        ...batch.map((r) => ({
          slug: String((r as Record<string, unknown>).slug ?? ""),
        })),
      );
      const conn = result[connectionName] as Record<string, unknown> | undefined;
      const agg = conn?.aggregate as Record<string, unknown> | undefined;
      const total = agg ? Number(agg.count ?? 0) : 0;
      skip += first;
      if (skip >= total) break;
    }

    return slugs;
  },

  async fetchAllCategories(): Promise<unknown[]> {
    try {
      const q = `
        query AllCategories($stage: Stage!) {
          categories(stage: $stage, first: 100) {
            id name slug description color
          }
        }
      `;
      const result = await gqlQuery<Record<string, unknown>>(q, { stage });
      const batch = result.categories;
      if (!Array.isArray(batch)) return [];
      return batch.map((r) =>
        mapCategoryRecord(r as Record<string, unknown>),
      );
    } catch {
      return [];
    }
  },

  async fetchCategoryBySlug(slug: string): Promise<unknown | null> {
    try {
      const q = `
        query CategoryBySlug($slug: String!, $stage: Stage!) {
          category(where: { slug: $slug }, stage: $stage) {
            id name slug description color
          }
        }
      `;
      const result = await gqlQuery<Record<string, unknown>>(q, {
        slug,
        stage,
      });
      const record = result.category as Record<string, unknown> | null;
      return record ? mapCategoryRecord(record) : null;
    } catch {
      return null;
    }
  },

  async fetchAllAuthors(): Promise<unknown[]> {
    try {
      const q = `
        query AllAuthors($stage: Stage!) {
          authors(stage: $stage, first: 100) {
            id name slug bio role avatar { url }
          }
        }
      `;
      const result = await gqlQuery<Record<string, unknown>>(q, { stage });
      const batch = result.authors;
      if (!Array.isArray(batch)) return [];
      return batch.map((r) =>
        mapAuthorRecord(r as Record<string, unknown>),
      );
    } catch {
      return [];
    }
  },

  async fetchAuthorBySlug(slug: string): Promise<unknown | null> {
    try {
      const q = `
        query AuthorBySlug($slug: String!, $stage: Stage!) {
          author(where: { slug: $slug }, stage: $stage) {
            id name slug bio role avatar { url }
          }
        }
      `;
      const result = await gqlQuery<Record<string, unknown>>(q, {
        slug,
        stage,
      });
      const record = result.author as Record<string, unknown> | null;
      return record ? mapAuthorRecord(record) : null;
    } catch {
      return null;
    }
  },

  async fetchArticlesByAuthor(authorSlug: string): Promise<unknown[]> {
    const q = `
      query ArticlesByAuthor($authorSlug: String!, $stage: Stage!) {
        ${queryName}(
          where: { author: { slug: $authorSlug } }
          stage: $stage
          first: 100
          orderBy: createdAt_DESC
        ) {
          ${ARTICLE_FIELDS}
        }
      }
    `;
    try {
      const result = await gqlQuery<Record<string, unknown>>(q, {
        authorSlug,
        stage,
      });
      const batch = result[queryName];
      if (!Array.isArray(batch)) return [];
      return batch.map((r) =>
        mapRecord(r as Record<string, unknown>, fieldMap),
      );
    } catch {
      // Fallback: fetch all and filter client-side
      const all = await this.fetchAllArticles();
      return (all as Record<string, unknown>[]).filter((a) => {
        const auth = a.author as Record<string, unknown> | undefined;
        return auth?.slug === authorSlug;
      });
    }
  },

  async fetchNewsticker(): Promise<unknown[]> {
    try {
      const q = `
        query AllNewstickers($stage: Stage!) {
          newstickers(stage: $stage, first: 20, orderBy: createdAt_DESC) {
            id type topic headline slug createdAt isPremium
          }
        }
      `;
      const result = await gqlQuery<Record<string, unknown>>(q, { stage });
      const batch = result.newstickers;
      if (!Array.isArray(batch)) return [];
      return batch.map((r) => {
        const rec = r as Record<string, unknown>;
        return {
          id: String(rec.id ?? ""),
          type: String(rec.type ?? ""),
          topic: String(rec.topic ?? ""),
          headline: {
            label: String(rec.headline ?? ""),
            href: `/${String(rec.slug ?? "")}`,
          },
          publicationDate: String(rec.createdAt ?? ""),
          isPremium: rec.isPremium === true,
        };
      });
    } catch {
      return [];
    }
  },

  async fetchVideos(): Promise<unknown[]> {
    try {
      const q = `
        query AllVideos($stage: Stage!) {
          videos(stage: $stage, first: 20, orderBy: createdAt_DESC) {
            id title videoUrl poster durationSeconds caption category createdAt
          }
        }
      `;
      const result = await gqlQuery<Record<string, unknown>>(q, { stage });
      const batch = result.videos;
      if (!Array.isArray(batch)) return [];
      return batch.map((r) => {
        const rec = r as Record<string, unknown>;
        const videoUrl = String(rec.videoUrl ?? "");
        return {
          id: String(rec.id ?? ""),
          title: String(rec.title ?? ""),
          sources: videoUrl
            ? [
                {
                  src: videoUrl,
                  extension: videoUrl.endsWith(".m3u8") ? "m3u8" : "mp4",
                },
              ]
            : [],
          poster: String(rec.poster ?? ""),
          durationSeconds: Number(rec.durationSeconds ?? 0),
          caption: String(rec.caption ?? ""),
          category: String(rec.category ?? ""),
          publishedAt: String(rec.createdAt ?? ""),
        };
      });
    } catch {
      return [];
    }
  },

  async fetchNavigation(): Promise<unknown> {
    try {
      const q = `
        query Navigation($stage: Stage!) {
          navigation(where: { id: "singleton" }, stage: $stage) {
            primaryMenuJson
            footerMenuJson
            socialLinksJson
          }
        }
      `;
      const result = await gqlQuery<Record<string, unknown>>(q, { stage });
      const nav = result.navigation as Record<string, unknown> | null;
      if (!nav)
        return { primaryMenu: [], footerMenu: [], socialLinks: [] };
      return {
        primaryMenu: nav.primaryMenuJson
          ? JSON.parse(String(nav.primaryMenuJson))
          : [],
        footerMenu: nav.footerMenuJson
          ? JSON.parse(String(nav.footerMenuJson))
          : [],
        socialLinks: nav.socialLinksJson
          ? JSON.parse(String(nav.socialLinksJson))
          : [],
      };
    } catch {
      return { primaryMenu: [], footerMenu: [], socialLinks: [] };
    }
  },

  async fetchSiteConfig(): Promise<unknown> {
    try {
      const q = `
        query SiteConfig($stage: Stage!) {
          siteConfig(where: { id: "singleton" }, stage: $stage) {
            title description url language tags
            socialLinksJson
            analyticsGtmId
          }
        }
      `;
      const result = await gqlQuery<Record<string, unknown>>(q, { stage });
      const cfg = result.siteConfig as Record<string, unknown> | null;
      if (!cfg) {
        return {
          title: "",
          description: "",
          url: "",
          language: "de",
          tags: [],
          socialLinks: [],
          analytics: { gtmId: "" },
        };
      }
      return {
        title: String(cfg.title ?? ""),
        description: String(cfg.description ?? ""),
        url: String(cfg.url ?? ""),
        language: String(cfg.language ?? "de"),
        tags: Array.isArray(cfg.tags) ? cfg.tags : [],
        socialLinks: cfg.socialLinksJson
          ? JSON.parse(String(cfg.socialLinksJson))
          : [],
        analytics: { gtmId: String(cfg.analyticsGtmId ?? "") },
      };
    } catch {
      return {
        title: "",
        description: "",
        url: "",
        language: "de",
        tags: [],
        socialLinks: [],
        analytics: { gtmId: "" },
      };
    }
  },

  async fetchBreakingNews(): Promise<unknown[]> {
    try {
      const q = `
        query AllBreakingNews($stage: Stage!) {
          breakingNewses(stage: $stage, first: 10, orderBy: createdAt_DESC) {
            id headline href severity createdAt expiresAt
          }
        }
      `;
      const result = await gqlQuery<Record<string, unknown>>(q, { stage });
      const batch = result.breakingNewses;
      if (!Array.isArray(batch)) return [];
      return batch.map((r) => {
        const rec = r as Record<string, unknown>;
        return {
          id: String(rec.id ?? ""),
          headline: String(rec.headline ?? ""),
          href: String(rec.href ?? ""),
          severity: String(rec.severity ?? "alert"),
          publishedAt: String(rec.createdAt ?? ""),
          expiresAt: rec.expiresAt ? String(rec.expiresAt) : undefined,
        };
      });
    } catch {
      return [];
    }
  },

  async fetchQuiz(): Promise<unknown> {
    try {
      const q = `
        query Quiz($stage: Stage!) {
          quiz(where: { id: "singleton" }, stage: $stage) {
            date title questionsJson streakRewardsJson
          }
        }
      `;
      const result = await gqlQuery<Record<string, unknown>>(q, { stage });
      const quiz = result.quiz as Record<string, unknown> | null;
      if (!quiz)
        return {
          dailyQuiz: { date: "", title: "", questions: [] },
          streakRewards: [],
        };
      return {
        dailyQuiz: {
          date: String(quiz.date ?? ""),
          title: String(quiz.title ?? ""),
          questions: quiz.questionsJson
            ? JSON.parse(String(quiz.questionsJson))
            : [],
        },
        streakRewards: quiz.streakRewardsJson
          ? JSON.parse(String(quiz.streakRewardsJson))
          : [],
      };
    } catch {
      return {
        dailyQuiz: { date: "", title: "", questions: [] },
        streakRewards: [],
      };
    }
  },

  async fetchStockData(): Promise<unknown> {
    try {
      const q = `
        query StockData($stage: Stage!) {
          stockData(where: { id: "singleton" }, stage: $stage) {
            indicesJson watchlistJson chartDataJson
          }
        }
      `;
      const result = await gqlQuery<Record<string, unknown>>(q, { stage });
      const stock = result.stockData as Record<string, unknown> | null;
      if (!stock) return { indices: [], watchlist: [], chartData: {} };
      return {
        indices: stock.indicesJson
          ? JSON.parse(String(stock.indicesJson))
          : [],
        watchlist: stock.watchlistJson
          ? JSON.parse(String(stock.watchlistJson))
          : [],
        chartData: stock.chartDataJson
          ? JSON.parse(String(stock.chartDataJson))
          : {},
      };
    } catch {
      return { indices: [], watchlist: [], chartData: {} };
    }
  },
};

export default hygraphAdapter;
