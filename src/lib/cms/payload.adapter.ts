import type { CmsAdapter } from "./types";
import { sanitizeRichText } from "./sanitize";
import { normalizeImage } from "./image-utils";
import { parseFieldMap, mapField } from "./field-map";
import { safeFetch, sanitizeError } from "./http";

/* ---------- config ---------- */

const baseUrl = process.env.PAYLOAD_URL!.replace(/\/$/, "");
const collection = process.env.PAYLOAD_ARTICLE_COLLECTION ?? "articles";
const fieldMap = parseFieldMap(process.env.PAYLOAD_FIELD_MAP);

/** Shorthand for mapField with the module-level fieldMap. */
function mf(name: string): string {
  return mapField(fieldMap, name);
}

/* ---------- fetch helpers ---------- */

/** Build auth + accept headers for every Payload request. */
function headers(): Record<string, string> {
  const h: Record<string, string> = { Accept: "application/json" };
  const key = process.env.PAYLOAD_API_KEY;
  if (key) h["Authorization"] = `users API-Key ${key}`;
  return h;
}

/** Fetch a single Payload REST endpoint and parse JSON. */
async function payloadFetch<T>(path: string): Promise<T> {
  const res = await safeFetch(`${baseUrl}/api${path}`, { headers: headers() });
  return res.json() as Promise<T>;
}

/** Paginate through all documents of a Payload collection. */
async function fetchAllDocs(col: string, extraParams = ""): Promise<unknown[]> {
  const items: unknown[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const sep = extraParams ? `&${extraParams}` : "";
    const res = await payloadFetch<{ docs: unknown[]; totalPages: number }>(
      `/${col}?limit=100&page=${page}&depth=2${sep}`,
    );
    if (Array.isArray(res.docs)) items.push(...res.docs);
    totalPages = res.totalPages;
    page++;
  }

  return items;
}

/** Safely fetch all documents; returns [] on error. */
async function safeFetchAllDocs(
  col: string,
  extraParams = "",
): Promise<unknown[]> {
  try {
    return await fetchAllDocs(col, extraParams);
  } catch (err: unknown) {
    console.warn(
      `[payload] safeFetchAllDocs(${col}) failed: ${sanitizeError(err)}`,
    );
    return [];
  }
}

/** Safely fetch a single document by query; returns null on error or not found. */
async function safeFetchFirstDoc(
  col: string,
  extraParams = "",
): Promise<unknown | null> {
  try {
    const sep = extraParams ? `&${extraParams}` : "";
    const res = await payloadFetch<{ docs: unknown[] }>(
      `/${col}?limit=1&depth=2${sep}`,
    );
    return Array.isArray(res.docs) && res.docs.length > 0 ? res.docs[0] : null;
  } catch (err: unknown) {
    console.warn(
      `[payload] safeFetchFirstDoc(${col}) failed: ${sanitizeError(err)}`,
    );
    return null;
  }
}

/* ---------- Lexical rich text → HTML ---------- */

/** Convert a Lexical JSON node tree to an HTML string. */
function nodesToHtml(nodes: unknown[]): string {
  return nodes.map(nodeToHtml).join("");
}

/** Convert a single Lexical node to HTML. */
function nodeToHtml(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;
  const type = String(n.type ?? "");
  const children = Array.isArray(n.children) ? n.children : [];

  switch (type) {
    case "paragraph":
      return `<p>${nodesToHtml(children)}</p>`;
    case "heading": {
      const tag = String(n.tag ?? "h2");
      return `<${tag}>${nodesToHtml(children)}</${tag}>`;
    }
    case "text": {
      let text = String(n.text ?? "");
      const format = Number(n.format ?? 0);
      if (format & 1) text = `<strong>${text}</strong>`;
      if (format & 2) text = `<em>${text}</em>`;
      if (format & 4) text = `<s>${text}</s>`;
      if (format & 8) text = `<u>${text}</u>`;
      if (format & 16) text = `<code>${text}</code>`;
      return text;
    }
    case "list": {
      const tag = n.listType === "number" ? "ol" : "ul";
      return `<${tag}>${nodesToHtml(children)}</${tag}>`;
    }
    case "listitem":
      return `<li>${nodesToHtml(children)}</li>`;
    case "quote":
      return `<blockquote>${nodesToHtml(children)}</blockquote>`;
    case "link": {
      const url =
        typeof n.fields === "object" && n.fields
          ? String((n.fields as Record<string, unknown>).url ?? "")
          : String(n.url ?? "");
      return `<a href="${url}">${nodesToHtml(children)}</a>`;
    }
    case "upload": {
      const value = n.value as Record<string, unknown> | undefined;
      if (value) {
        const url = String(value.url ?? "");
        const alt = String(value.alt ?? "");
        return url ? `<img src="${url}" alt="${alt}">` : "";
      }
      return "";
    }
    case "horizontalrule":
      return "<hr>";
    case "linebreak":
      return "<br>";
    default:
      return nodesToHtml(children);
  }
}

/**
 * Convert Payload Lexical rich-text JSON to an HTML string.
 * Accepts a string (pass-through), a Lexical root object, or null/undefined.
 */
function lexicalToHtml(content: unknown): string {
  if (typeof content === "string") return content;
  if (!content || typeof content !== "object") return "";

  const root = (content as Record<string, unknown>).root;
  if (!root || typeof root !== "object") return "";

  const children = (root as Record<string, unknown>).children;
  if (!Array.isArray(children)) return "";

  return nodesToHtml(children);
}

/* ---------- URL helpers ---------- */

/** Prefix relative URLs with the Payload base URL. */
function resolveUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url.startsWith("http") ? url : `${baseUrl}${url}`;
}

/* ---------- item mappers ---------- */

/** Map a raw Payload document to the normalized article shape. */
function mapDoc(doc: Record<string, unknown>): unknown {
  const bodyField = doc[mf("body")];
  const bodyHtml = sanitizeRichText(lexicalToHtml(bodyField));

  // Image — resolved relation object with url, alt, width, height
  const imgField = doc[mf("image")] as Record<string, unknown> | null;
  const imgUrl = imgField?.url ? resolveUrl(String(imgField.url)) : null;

  // Category — resolved relation
  const cat = doc[mf("category")] as Record<string, unknown> | null;

  // Author — resolved relation
  const auth = doc[mf("author")] as Record<string, unknown> | null;
  const authAvatar = auth?.avatar as Record<string, unknown> | null;
  const avatarUrl = authAvatar?.url ? resolveUrl(String(authAvatar.url)) : "";

  // Tags — may be string[] or object[] with .name / .tag
  const rawTags = doc[mf("tags")];
  const tags = Array.isArray(rawTags)
    ? rawTags.map((t: unknown) =>
        typeof t === "string"
          ? t
          : String(
              (t as Record<string, unknown>).name ??
                (t as Record<string, unknown>).tag ??
                "",
            ),
      )
    : [];

  return {
    id: String(doc.id ?? ""),
    headline: String(doc[mf("headline")] ?? doc[mf("title")] ?? ""),
    slug: String(doc[mf("slug")] ?? ""),
    teaser: String(doc[mf("teaser")] ?? ""),
    body: bodyHtml,
    publicationDate: String(doc.publishedAt ?? doc.createdAt ?? ""),
    updatedAt: String(doc.updatedAt ?? ""),
    image: normalizeImage(
      imgUrl,
      imgField ? String(imgField.alt ?? "") : undefined,
      imgField ? Number(imgField.width ?? 0) : undefined,
      imgField ? Number(imgField.height ?? 0) : undefined,
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
          avatar: avatarUrl,
        }
      : { id: "", name: "", slug: "", avatar: "" },
    tags,
    readingTimeMinutes: Number(doc[mf("readingTimeMinutes")] ?? 0),
    commentCount: 0,
    isPremium: doc[mf("isPremium")] === true,
    paywall: String(doc[mf("paywall")] ?? "free"),
    isLive: doc[mf("isLive")] === true,
    isOpinion: doc[mf("isOpinion")] === true,
    isFeatured: doc[mf("isFeatured")] === true,
    isBreaking: doc[mf("isBreaking")] === true,
    aiSummary: String(doc[mf("aiSummary")] ?? ""),
    region: String(doc[mf("region")] ?? ""),
    comments: [],
  };
}

/** Map a raw Payload category document. */
function mapCategory(doc: Record<string, unknown>): unknown {
  return {
    id: String(doc.id ?? ""),
    name: String(doc.name ?? ""),
    slug: String(doc.slug ?? ""),
    description: String(doc.description ?? ""),
    color: String(doc.color ?? ""),
  };
}

/** Map a raw Payload author document. */
function mapAuthor(doc: Record<string, unknown>): unknown {
  const avatarField = doc.avatar as Record<string, unknown> | null;
  const avatarUrl = avatarField?.url ? resolveUrl(String(avatarField.url)) : "";

  return {
    id: String(doc.id ?? ""),
    name: String(doc.name ?? ""),
    slug: String(doc.slug ?? ""),
    bio: String(doc.bio ?? ""),
    avatar: avatarUrl,
    role: String(doc.role ?? ""),
  };
}

/* ---------- adapter ---------- */

const payloadAdapter: CmsAdapter = {
  name: "payload",

  async fetchAllArticles(): Promise<unknown[]> {
    const docs = await fetchAllDocs(collection, "sort=-createdAt");
    return docs.map((d) => mapDoc(d as Record<string, unknown>));
  },

  async fetchArticleBySlug(slug: string): Promise<unknown | null> {
    const doc = await safeFetchFirstDoc(
      collection,
      `where[${mf("slug")}][equals]=${encodeURIComponent(slug)}`,
    );
    if (!doc) return null;
    return mapDoc(doc as Record<string, unknown>);
  },

  async fetchArticlesByCategory(categorySlug: string): Promise<unknown[]> {
    const docs = await safeFetchAllDocs(
      collection,
      `where[${mf("category")}.slug][equals]=${encodeURIComponent(categorySlug)}&sort=-createdAt`,
    );
    return docs.map((d) => mapDoc(d as Record<string, unknown>));
  },

  async searchArticlesByQuery(query: string): Promise<unknown[]> {
    const encoded = encodeURIComponent(query);
    const docs = await safeFetchAllDocs(
      collection,
      `where[or][0][${mf("headline")}][like]=${encoded}&where[or][1][${mf("teaser")}][like]=${encoded}&sort=-createdAt`,
    );
    return docs.map((d) => mapDoc(d as Record<string, unknown>));
  },

  async fetchArticleSlugs(): Promise<unknown[]> {
    const docs = await fetchAllDocs(collection, "sort=-createdAt");
    return docs.map((d) => {
      const doc = d as Record<string, unknown>;
      return {
        slug: String(doc[mf("slug")] ?? ""),
        updatedAt: String(doc.updatedAt ?? ""),
      };
    });
  },

  async fetchAllCategories(): Promise<unknown[]> {
    const docs = await safeFetchAllDocs("categories", "sort=name");
    return docs.map((d) => mapCategory(d as Record<string, unknown>));
  },

  async fetchCategoryBySlug(slug: string): Promise<unknown | null> {
    const doc = await safeFetchFirstDoc(
      "categories",
      `where[slug][equals]=${encodeURIComponent(slug)}`,
    );
    if (!doc) return null;
    return mapCategory(doc as Record<string, unknown>);
  },

  async fetchAllAuthors(): Promise<unknown[]> {
    const docs = await safeFetchAllDocs("authors", "sort=name");
    return docs.map((d) => mapAuthor(d as Record<string, unknown>));
  },

  async fetchAuthorBySlug(slug: string): Promise<unknown | null> {
    const doc = await safeFetchFirstDoc(
      "authors",
      `where[slug][equals]=${encodeURIComponent(slug)}`,
    );
    if (!doc) return null;
    return mapAuthor(doc as Record<string, unknown>);
  },

  async fetchArticlesByAuthor(authorSlug: string): Promise<unknown[]> {
    const docs = await safeFetchAllDocs(
      collection,
      `where[${mf("author")}.slug][equals]=${encodeURIComponent(authorSlug)}&sort=-createdAt`,
    );
    return docs.map((d) => mapDoc(d as Record<string, unknown>));
  },

  async fetchNewsticker(): Promise<unknown[]> {
    const docs = await safeFetchAllDocs(
      "newsticker",
      "sort=-createdAt&limit=20",
    );
    return docs.map((d) => {
      const doc = d as Record<string, unknown>;
      return {
        id: String(doc.id ?? ""),
        headline: String(doc.headline ?? ""),
        text: String(doc.text ?? ""),
        timestamp: String(doc.createdAt ?? ""),
        url: String(doc.url ?? ""),
      };
    });
  },

  async fetchVideos(): Promise<unknown[]> {
    const docs = await safeFetchAllDocs("videos", "sort=-createdAt");
    return docs.map((d) => {
      const doc = d as Record<string, unknown>;
      return {
        id: String(doc.id ?? ""),
        title: String(doc.title ?? ""),
        url: String(doc.url ?? ""),
        thumbnail: String(doc.thumbnail ?? ""),
        duration: Number(doc.duration ?? 0),
        publishedAt: String(doc.createdAt ?? ""),
      };
    });
  },

  async fetchNavigation(): Promise<unknown> {
    const doc = await safeFetchFirstDoc("navigation");
    if (!doc) return { items: [] };
    const nav = doc as Record<string, unknown>;
    return {
      items: Array.isArray(nav.items) ? nav.items : [],
    };
  },

  async fetchSiteConfig(): Promise<unknown> {
    const doc = await safeFetchFirstDoc("site-config");
    if (!doc) return {};
    return doc;
  },

  async fetchBreakingNews(): Promise<unknown[]> {
    const docs = await safeFetchAllDocs(
      "breaking-news",
      "sort=-createdAt&limit=5",
    );
    return docs.map((d) => {
      const doc = d as Record<string, unknown>;
      return {
        id: String(doc.id ?? ""),
        headline: String(doc.headline ?? ""),
        text: String(doc.text ?? ""),
        url: String(doc.url ?? ""),
        severity: String(doc.severity ?? "normal"),
        timestamp: String(doc.createdAt ?? ""),
      };
    });
  },

  async fetchQuiz(): Promise<unknown> {
    const doc = await safeFetchFirstDoc("quiz", "sort=-createdAt");
    if (!doc) return null;
    const quiz = doc as Record<string, unknown>;
    return {
      id: String(quiz.id ?? ""),
      title: String(quiz.title ?? ""),
      questions: Array.isArray(quiz.questions) ? quiz.questions : [],
    };
  },

  async fetchStockData(): Promise<unknown> {
    const doc = await safeFetchFirstDoc("stock-data", "sort=-updatedAt");
    if (!doc) return null;
    const stock = doc as Record<string, unknown>;
    return {
      stocks: Array.isArray(stock.stocks) ? stock.stocks : [],
      updatedAt: String(stock.updatedAt ?? ""),
    };
  },
};

export default payloadAdapter;
