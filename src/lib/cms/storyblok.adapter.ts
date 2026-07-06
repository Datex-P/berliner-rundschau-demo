import StoryblokClient from "storyblok-js-client";
import { renderRichText } from "@storyblok/richtext";
import type { CmsAdapter } from "./types";
import { sanitizeRichText } from "./sanitize";
import { normalizeImage } from "./image-utils";
import { parseFieldMap, mapField } from "./field-map";

/* ---------- client setup ---------- */

const client = new StoryblokClient({
  accessToken: process.env.STORYBLOK_ACCESS_TOKEN!,
  region: "eu",
});

const version = (process.env.STORYBLOK_VERSION ?? "published") as
  "published" | "draft";
const articleType = process.env.STORYBLOK_ARTICLE_TYPE ?? "article";
const fieldMap = parseFieldMap(process.env.STORYBLOK_FIELD_MAP);

/* ---------- helpers ---------- */

/** Shorthand for mapField with the module-level fieldMap. */
function mf(name: string): string {
  return mapField(fieldMap, name);
}

/** Paginate through all stories of a content type. */
async function fetchAllStories(
  contentType: string,
  extraParams?: Record<string, unknown>,
): Promise<unknown[]> {
  const items: unknown[] = [];
  let page = 1;
  const perPage = 100;
  let total = Infinity;

  while (items.length < total) {
    const res = await client.get("cdn/stories", {
      content_type: contentType,
      version,
      per_page: perPage,
      page,
      ...extraParams,
    });
    items.push(...res.data.stories);
    total = res.total;
    page++;
  }

  return items;
}

/** Safely fetch all stories; returns [] when the content type does not exist. */
async function safeFetchAll(
  contentType: string,
  extraParams?: Record<string, unknown>,
): Promise<unknown[]> {
  try {
    return await fetchAllStories(contentType, extraParams);
  } catch {
    return [];
  }
}

/** Safely fetch a single story by slug (full path). Returns null if not found. */
async function safeFetchStory(slug: string): Promise<unknown | null> {
  try {
    const res = await client.get(`cdn/stories/${slug}`, { version });
    return res.data.story ?? null;
  } catch {
    return null;
  }
}

/** Safely fetch stories and return the first one, or null. */
async function safeFetchFirst(
  contentType: string,
  extraParams?: Record<string, unknown>,
): Promise<unknown | null> {
  const items = await safeFetchAll(contentType, {
    ...extraParams,
    per_page: 1,
  });
  return items[0] ?? null;
}

/* ---------- field access helpers ---------- */

function content(story: unknown): Record<string, unknown> {
  return (
    ((story as Record<string, unknown>)?.content as Record<string, unknown>) ??
    {}
  );
}

function storyField(story: unknown, key: string): unknown {
  return (story as Record<string, unknown>)?.[key];
}

/* ---------- entry mappers ---------- */

function mapStory(story: unknown): unknown {
  const s = story as Record<string, unknown>;
  const c = content(story);

  const bodyField = c[mf("body")];
  // renderRichText expects the Storyblok richtext JSON object
  const bodyHtml = bodyField
    ? sanitizeRichText(
        renderRichText(bodyField as Parameters<typeof renderRichText>[0]),
      )
    : "";

  const imgField = c[mf("image")] as Record<string, unknown> | null;
  const catField = c[mf("category")] as Record<string, unknown> | null;
  const authField = c[mf("author")] as Record<string, unknown> | null;

  return {
    id: String(s.uuid ?? ""),
    headline: String(c[mf("headline")] ?? ""),
    slug: String(s.slug ?? ""),
    teaser: String(c[mf("teaser")] ?? ""),
    body: bodyHtml,
    publicationDate: String(s.published_at ?? s.created_at ?? ""),
    updatedAt: String(s.updated_at ?? ""),
    image:
      imgField && typeof imgField === "object" && "filename" in imgField
        ? normalizeImage(
            String((imgField as Record<string, unknown>).filename ?? ""),
            String((imgField as Record<string, unknown>).alt ?? ""),
          )
        : normalizeImage(typeof imgField === "string" ? imgField : null),
    category: catField
      ? {
          id: String(
            (catField as Record<string, unknown>).uuid ??
              (catField as Record<string, unknown>)._uid ??
              "",
          ),
          name: String((catField as Record<string, unknown>).name ?? ""),
          slug: String((catField as Record<string, unknown>).slug ?? ""),
        }
      : { id: "", name: "", slug: "" },
    author: authField
      ? {
          id: String(
            (authField as Record<string, unknown>).uuid ??
              (authField as Record<string, unknown>)._uid ??
              "",
          ),
          name: String((authField as Record<string, unknown>).name ?? ""),
          slug: String((authField as Record<string, unknown>).slug ?? ""),
          avatar: "",
        }
      : { id: "", name: "", slug: "", avatar: "" },
    tags: Array.isArray(s.tag_list) ? s.tag_list : [],
    readingTimeMinutes: Number(c[mf("readingTimeMinutes")] ?? 0),
    commentCount: 0,
    isPremium: c[mf("isPremium")] === true,
    paywall: String(c[mf("paywall")] ?? "free"),
    isLive: c[mf("isLive")] === true,
    isOpinion: c[mf("isOpinion")] === true,
    isFeatured: c[mf("isFeatured")] === true,
    isBreaking: c[mf("isBreaking")] === true,
    aiSummary: String(c[mf("aiSummary")] ?? ""),
    region: String(c[mf("region")] ?? ""),
    comments: [],
  };
}

function mapCategory(story: unknown): unknown {
  const s = story as Record<string, unknown>;
  const c = content(story);
  return {
    id: String(s.uuid ?? ""),
    name: String(c.name ?? s.name ?? ""),
    slug: String(s.slug ?? ""),
    description: String(c.description ?? ""),
    color: String(c.color ?? ""),
  };
}

function mapAuthor(story: unknown): unknown {
  const s = story as Record<string, unknown>;
  const c = content(story);
  const avatarField = c.avatar as Record<string, unknown> | null;
  const avatarUrl =
    avatarField && typeof avatarField === "object" && "filename" in avatarField
      ? String((avatarField as Record<string, unknown>).filename ?? "")
      : "";

  return {
    id: String(s.uuid ?? ""),
    name: String(c.name ?? s.name ?? ""),
    slug: String(s.slug ?? ""),
    bio: String(c.bio ?? ""),
    avatar: avatarUrl,
    role: String(c.role ?? ""),
  };
}

/* ---------- adapter ---------- */

const storyblokAdapter: CmsAdapter = {
  name: "storyblok",

  async fetchAllArticles(): Promise<unknown[]> {
    const stories = await fetchAllStories(articleType);
    return stories.map(mapStory);
  },

  async fetchArticleBySlug(slug: string): Promise<unknown | null> {
    /* Try direct slug fetch first, fall back to content_type filter */
    const story = await safeFetchStory(slug);
    if (story) return mapStory(story);

    const items = await safeFetchAll(articleType, {
      "filter_query[slug][is]": slug,
      per_page: 1,
    });
    return items.length > 0 ? mapStory(items[0]) : null;
  },

  async fetchArticlesByCategory(categorySlug: string): Promise<unknown[]> {
    const items = await safeFetchAll(articleType, {
      "filter_query[category][is]": categorySlug,
    });
    return items.map(mapStory);
  },

  async searchArticlesByQuery(query: string): Promise<unknown[]> {
    const items = await safeFetchAll(articleType, { search_term: query });
    return items.map(mapStory);
  },

  async fetchArticleSlugs(): Promise<unknown[]> {
    const stories = await fetchAllStories(articleType);
    return stories.map((story) => ({
      slug: String(storyField(story, "slug") ?? ""),
      updatedAt: String(storyField(story, "updated_at") ?? ""),
    }));
  },

  async fetchAllCategories(): Promise<unknown[]> {
    const items = await safeFetchAll("category");
    return items.map(mapCategory);
  },

  async fetchCategoryBySlug(slug: string): Promise<unknown | null> {
    const story = await safeFetchStory(slug);
    if (story) return mapCategory(story);

    const items = await safeFetchAll("category", {
      "filter_query[slug][is]": slug,
      per_page: 1,
    });
    return items.length > 0 ? mapCategory(items[0]) : null;
  },

  async fetchAllAuthors(): Promise<unknown[]> {
    const items = await safeFetchAll("author");
    return items.map(mapAuthor);
  },

  async fetchAuthorBySlug(slug: string): Promise<unknown | null> {
    const story = await safeFetchStory(slug);
    if (story) return mapAuthor(story);

    const items = await safeFetchAll("author", {
      "filter_query[slug][is]": slug,
      per_page: 1,
    });
    return items.length > 0 ? mapAuthor(items[0]) : null;
  },

  async fetchArticlesByAuthor(authorSlug: string): Promise<unknown[]> {
    const items = await safeFetchAll(articleType, {
      "filter_query[author][is]": authorSlug,
    });
    return items.map(mapStory);
  },

  async fetchNewsticker(): Promise<unknown[]> {
    const items = await safeFetchAll("newsticker", {
      sort_by: "created_at:desc",
      per_page: 20,
    });
    return items.map((story) => {
      const c = content(story);
      return {
        id: String(storyField(story, "uuid") ?? ""),
        headline: String(c.headline ?? ""),
        text: String(c.text ?? ""),
        timestamp: String(storyField(story, "created_at") ?? ""),
        url: String(c.url ?? ""),
      };
    });
  },

  async fetchVideos(): Promise<unknown[]> {
    const items = await safeFetchAll("video", {
      sort_by: "created_at:desc",
    });
    return items.map((story) => {
      const c = content(story);
      return {
        id: String(storyField(story, "uuid") ?? ""),
        title: String(c.title ?? ""),
        url: String(c.url ?? ""),
        thumbnail: String(c.thumbnail ?? ""),
        duration: Number(c.duration ?? 0),
        publishedAt: String(storyField(story, "created_at") ?? ""),
      };
    });
  },

  async fetchNavigation(): Promise<unknown> {
    const story = await safeFetchFirst("navigation");
    if (!story) return { items: [] };
    const c = content(story);
    return {
      items: Array.isArray(c.items) ? c.items : [],
    };
  },

  async fetchSiteConfig(): Promise<unknown> {
    const story = await safeFetchFirst("siteConfig");
    if (!story) return {};
    return content(story);
  },

  async fetchBreakingNews(): Promise<unknown[]> {
    const items = await safeFetchAll("breakingNews", {
      sort_by: "created_at:desc",
      per_page: 5,
    });
    return items.map((story) => {
      const c = content(story);
      return {
        id: String(storyField(story, "uuid") ?? ""),
        headline: String(c.headline ?? ""),
        text: String(c.text ?? ""),
        url: String(c.url ?? ""),
        severity: String(c.severity ?? "normal"),
        timestamp: String(storyField(story, "created_at") ?? ""),
      };
    });
  },

  async fetchQuiz(): Promise<unknown> {
    const story = await safeFetchFirst("quiz");
    if (!story) return null;
    const c = content(story);
    return {
      id: String(storyField(story, "uuid") ?? ""),
      title: String(c.title ?? ""),
      questions: Array.isArray(c.questions) ? c.questions : [],
    };
  },

  async fetchStockData(): Promise<unknown> {
    const story = await safeFetchFirst("stockData");
    if (!story) return null;
    const c = content(story);
    return {
      stocks: Array.isArray(c.stocks) ? c.stocks : [],
      updatedAt: String(storyField(story, "updated_at") ?? ""),
    };
  },
};

export default storyblokAdapter;
