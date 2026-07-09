import * as prismic from "@prismicio/client";
import type { CmsAdapter } from "./types";
import { sanitizeRichText } from "./sanitize";
import { normalizeImage } from "./image-utils";
import { parseFieldMap, mapField } from "./field-map";

/* ---------- client setup ---------- */

const client = prismic.createClient(process.env.PRISMIC_REPOSITORY!, {
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
});

const articleType = process.env.PRISMIC_ARTICLE_TYPE ?? "article";
const fieldMap = parseFieldMap(process.env.PRISMIC_FIELD_MAP);

/* ---------- helpers ---------- */

function mf(name: string): string {
  return mapField(fieldMap, name);
}

/** Safely fetch all documents of a type; returns [] on error. */
async function safeFetchAllByType(
  type: string,
  params?: Parameters<typeof client.getAllByType>[1],
): Promise<unknown[]> {
  try {
    return await client.getAllByType(type, params);
  } catch {
    return [];
  }
}

/** Safely fetch a single document by UID; returns null on error. */
async function safeFetchByUID(
  type: string,
  uid: string,
): Promise<unknown | null> {
  try {
    return await client.getByUID(type, uid);
  } catch {
    return null;
  }
}

/* ---------- entry mappers ---------- */

function mapDocument(doc: Record<string, unknown>): unknown {
  const data = (doc.data ?? {}) as Record<string, unknown>;

  const bodyField = data[mf("body")];
  const bodyHtml =
    bodyField && Array.isArray(bodyField)
      ? sanitizeRichText(prismic.asHTML(bodyField as prismic.RichTextField))
      : "";

  const imgField = data[mf("image")] as Record<string, unknown> | null;
  const dims = imgField?.dimensions as Record<string, unknown> | null;

  const catRef = data[mf("category")] as Record<string, unknown> | null;
  const catData = catRef?.data as Record<string, unknown> | null;

  const authRef = data[mf("author")] as Record<string, unknown> | null;
  const authData = authRef?.data as Record<string, unknown> | null;

  return {
    id: String(doc.id ?? ""),
    headline: String(data[mf("headline")] ?? ""),
    slug: String(doc.uid ?? ""),
    teaser: String(data[mf("teaser")] ?? ""),
    body: bodyHtml,
    publicationDate: String(doc.first_publication_date ?? ""),
    updatedAt: String(doc.last_publication_date ?? ""),
    image: normalizeImage(
      imgField ? String(imgField.url ?? "") : null,
      imgField ? String(imgField.alt ?? "") : undefined,
      dims ? Number(dims.width ?? 0) : undefined,
      dims ? Number(dims.height ?? 0) : undefined,
    ),
    category: catData
      ? {
          id: String(catRef?.id ?? ""),
          name: String(catData.name ?? ""),
          slug: String(catRef?.uid ?? ""),
        }
      : { id: "", name: "", slug: "" },
    author: authData
      ? {
          id: String(authRef?.id ?? ""),
          name: String(authData.name ?? ""),
          slug: String(authRef?.uid ?? ""),
          avatar: String(
            (authData.avatar as Record<string, unknown>)?.url ?? "",
          ),
        }
      : { id: "", name: "", slug: "", avatar: "" },
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    readingTimeMinutes: Number(data[mf("readingTimeMinutes")] ?? 0),
    commentCount: 0,
    isPremium: data[mf("isPremium")] === true,
    paywall: String(data[mf("paywall")] ?? "free"),
    isLive: data[mf("isLive")] === true,
    isOpinion: data[mf("isOpinion")] === true,
    isFeatured: data[mf("isFeatured")] === true,
    isBreaking: data[mf("isBreaking")] === true,
    aiSummary: String(data[mf("aiSummary")] ?? ""),
    region: String(data[mf("region")] ?? ""),
    comments: [],
  };
}

function mapCategory(doc: Record<string, unknown>): unknown {
  const data = (doc.data ?? {}) as Record<string, unknown>;
  return {
    id: String(doc.id ?? ""),
    name: String(data.name ?? ""),
    slug: String(doc.uid ?? ""),
    description: String(data.description ?? ""),
    color: String(data.color ?? ""),
  };
}

function mapAuthor(doc: Record<string, unknown>): unknown {
  const data = (doc.data ?? {}) as Record<string, unknown>;
  const avatarField = data.avatar as Record<string, unknown> | null;
  return {
    id: String(doc.id ?? ""),
    name: String(data.name ?? ""),
    slug: String(doc.uid ?? ""),
    bio: String(data.bio ?? ""),
    avatar: avatarField ? String(avatarField.url ?? "") : "",
    role: String(data.role ?? ""),
  };
}

/* ---------- adapter ---------- */

const prismicAdapter: CmsAdapter = {
  name: "prismic",

  async fetchAllArticles(): Promise<unknown[]> {
    const docs = await client.getAllByType(articleType);
    return docs.map((d) =>
      mapDocument(d as unknown as Record<string, unknown>),
    );
  },

  async fetchArticleBySlug(slug: string): Promise<unknown | null> {
    const doc = await safeFetchByUID(articleType, slug);
    if (!doc) return null;
    return mapDocument(doc as Record<string, unknown>);
  },

  async fetchArticlesByCategory(categorySlug: string): Promise<unknown[]> {
    const cat = await safeFetchByUID("category", categorySlug);
    if (!cat) return [];
    const catId = String((cat as Record<string, unknown>).id ?? "");
    if (!catId) return [];

    const docs = await client.getAllByType(articleType, {
      filters: [prismic.filter.at(`my.${articleType}.category`, catId)],
    });
    return docs.map((d) =>
      mapDocument(d as unknown as Record<string, unknown>),
    );
  },

  async searchArticlesByQuery(query: string): Promise<unknown[]> {
    const docs = await client.getAllByType(articleType, {
      filters: [prismic.filter.fulltext("document", query)],
    });
    return docs.map((d) =>
      mapDocument(d as unknown as Record<string, unknown>),
    );
  },

  async fetchArticleSlugs(): Promise<unknown[]> {
    const docs = await client.getAllByType(articleType);
    return docs.map((d) => ({
      slug: d.uid,
      modified: d.last_publication_date,
    }));
  },

  async fetchAllCategories(): Promise<unknown[]> {
    const docs = await safeFetchAllByType("category");
    return docs.map((d) => mapCategory(d as Record<string, unknown>));
  },

  async fetchCategoryBySlug(slug: string): Promise<unknown | null> {
    const doc = await safeFetchByUID("category", slug);
    if (!doc) return null;
    return mapCategory(doc as Record<string, unknown>);
  },

  async fetchAllAuthors(): Promise<unknown[]> {
    const docs = await safeFetchAllByType("author");
    return docs.map((d) => mapAuthor(d as Record<string, unknown>));
  },

  async fetchAuthorBySlug(slug: string): Promise<unknown | null> {
    const doc = await safeFetchByUID("author", slug);
    if (!doc) return null;
    return mapAuthor(doc as Record<string, unknown>);
  },

  async fetchArticlesByAuthor(authorSlug: string): Promise<unknown[]> {
    const author = await safeFetchByUID("author", authorSlug);
    if (!author) return [];
    const authorId = String((author as Record<string, unknown>).id ?? "");
    if (!authorId) return [];

    const docs = await client.getAllByType(articleType, {
      filters: [prismic.filter.at(`my.${articleType}.author`, authorId)],
    });
    return docs.map((d) =>
      mapDocument(d as unknown as Record<string, unknown>),
    );
  },

  async fetchNewsticker(): Promise<unknown[]> {
    const docs = await safeFetchAllByType("newsticker", {
      orderings: [
        { field: "document.first_publication_date", direction: "desc" },
      ],
      pageSize: 20,
    });
    return docs.map((d) => {
      const doc = d as Record<string, unknown>;
      const data = (doc.data ?? {}) as Record<string, unknown>;
      return {
        id: String(doc.id ?? ""),
        type: "TimelineTeaser",
        topic: String(data.topic ?? ""),
        headline: {
          label: String(data.headline ?? ""),
          href: String(data.href ?? ""),
        },
        publicationDate: String(doc.first_publication_date ?? ""),
        isPremium: data.isPremium === true,
      };
    });
  },

  async fetchVideos(): Promise<unknown[]> {
    const docs = await safeFetchAllByType("video", {
      orderings: [
        { field: "document.first_publication_date", direction: "desc" },
      ],
    });
    return docs.map((d) => {
      const doc = d as Record<string, unknown>;
      const data = (doc.data ?? {}) as Record<string, unknown>;
      return {
        id: String(doc.id ?? ""),
        title: String(data.title ?? ""),
        url: String(data.url ?? ""),
        thumbnail: String(data.thumbnail ?? ""),
        duration: Number(data.duration ?? 0),
        publishedAt: String(doc.first_publication_date ?? ""),
      };
    });
  },

  async fetchNavigation(): Promise<unknown> {
    const docs = await safeFetchAllByType("navigation");
    if (docs.length === 0) return { items: [] };
    const doc = docs[0] as Record<string, unknown>;
    const data = (doc.data ?? {}) as Record<string, unknown>;
    return {
      items: Array.isArray(data.items) ? data.items : [],
    };
  },

  async fetchSiteConfig(): Promise<unknown> {
    const docs = await safeFetchAllByType("siteConfig");
    if (docs.length === 0) return {};
    const doc = docs[0] as Record<string, unknown>;
    return (doc.data ?? {}) as Record<string, unknown>;
  },

  async fetchBreakingNews(): Promise<unknown[]> {
    const docs = await safeFetchAllByType("breakingNews", {
      orderings: [
        { field: "document.first_publication_date", direction: "desc" },
      ],
      pageSize: 5,
    });
    return docs.map((d) => {
      const doc = d as Record<string, unknown>;
      const data = (doc.data ?? {}) as Record<string, unknown>;
      return {
        id: String(doc.id ?? ""),
        headline: String(data.headline ?? ""),
        text: String(data.text ?? ""),
        url: String(data.url ?? ""),
        severity: String(data.severity ?? "normal"),
        timestamp: String(doc.first_publication_date ?? ""),
      };
    });
  },

  async fetchQuiz(): Promise<unknown> {
    const docs = await safeFetchAllByType("quiz");
    if (docs.length === 0) return null;
    const doc = docs[0] as Record<string, unknown>;
    const data = (doc.data ?? {}) as Record<string, unknown>;
    const jsonStr = String(data.json ?? "{}");
    try {
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  },

  async fetchStockData(): Promise<unknown> {
    const docs = await safeFetchAllByType("stockData");
    if (docs.length === 0) return null;
    const doc = docs[0] as Record<string, unknown>;
    const data = (doc.data ?? {}) as Record<string, unknown>;
    const jsonStr = String(data.json ?? "{}");
    try {
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  },
};

export default prismicAdapter;
