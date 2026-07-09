import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

/* ---------- mock safeFetch BEFORE importing the adapter ---------- */

const mockSafeFetch = vi.fn();
vi.mock("../http", () => ({
  safeFetch: (...args: unknown[]) => mockSafeFetch(...args),
  sanitizeError: (err: unknown) => String(err),
}));

vi.mock("../sanitize", () => ({
  sanitizeRichText: (html: string) => html,
}));

vi.mock("../image-utils", () => ({
  normalizeImage: (
    src: string | null | undefined,
    alt?: string,
    width?: number,
    height?: number,
  ) => ({
    alt: alt ?? "",
    fallbackSrc: src ?? "",
    crops: src
      ? [
          {
            name: "default",
            srcset: [{ src, imageWidth: width ? `${width}w` : "1200w" }],
          },
        ]
      : [],
    sizes: src ? ["(max-width: 768px) 100vw", "800px"] : [],
  }),
}));

/* ---------- env vars ---------- */

vi.stubEnv("TYPO3_URL", "http://localhost:8080");
vi.stubEnv("CMS_ADAPTER", "typo3");

/* ---------- import adapter after mocks + env ---------- */

import type { CmsAdapter } from "../types";

let adapter: CmsAdapter;

function jsonResponse(data: unknown) {
  return { json: () => Promise.resolve(data), status: 200, ok: true };
}

function makeNewsPage(items: unknown[], colPos = "colPos0") {
  return {
    content: {
      [colPos]: [
        {
          type: "news_pi1",
          content: { data: { list: items } },
        },
      ],
    },
  };
}

function makeLegacyNewsPage(items: unknown[], colPos = "colPos0") {
  return {
    [colPos]: [
      {
        CType: "list",
        list_type: "news_pi1",
        data: { list: items },
      },
    ],
  };
}

function makeNewsItem(overrides: Record<string, unknown> = {}) {
  return {
    uid: 1,
    title: "Test-Artikel",
    pathSegment: "test-artikel",
    teaser: "Ein Teaser",
    bodytext: "<p>Body</p>",
    datetime: "Jul 02 2026",
    tstamp: "Jul 03 2026",
    media: [
      {
        publicUrl: "/fileadmin/test.jpg",
        properties: { alternative: "Alt Text", width: 800, height: 600 },
      },
    ],
    categories: [{ id: 10, title: "Politik" }],
    metaData: {
      keywords: "berlin,news",
      description: "",
      alternativeTitle: "",
    },
    author: { author: "Max Mustermann", authorEmail: "" },
    ...overrides,
  };
}

beforeEach(async () => {
  mockSafeFetch.mockReset();
  vi.resetModules();

  vi.doMock("server-only", () => ({}));
  vi.doMock("../http", () => ({
    safeFetch: (...args: unknown[]) => mockSafeFetch(...args),
    sanitizeError: (err: unknown) => String(err),
  }));
  vi.doMock("../sanitize", () => ({
    sanitizeRichText: (html: string) => html,
  }));
  vi.doMock("../image-utils", () => ({
    normalizeImage: (
      src: string | null | undefined,
      alt?: string,
      width?: number,
      height?: number,
    ) => ({
      alt: alt ?? "",
      fallbackSrc: src ?? "",
      crops: src
        ? [
            {
              name: "default",
              srcset: [{ src, imageWidth: width ? `${width}w` : "1200w" }],
            },
          ]
        : [],
      sizes: src ? ["(max-width: 768px) 100vw", "800px"] : [],
    }),
  }));

  vi.stubEnv("TYPO3_URL", "http://localhost:8080");
  vi.stubEnv("CMS_ADAPTER", "typo3");

  const mod = await import("../typo3.adapter");
  adapter = mod.default;
});

/* ========== News-Extraktion ========== */

describe("news extraction", () => {
  it("extracts news from data.list", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(makeNewsPage([makeNewsItem()])),
    );
    const articles = await adapter.fetchAllArticles();
    expect(articles).toHaveLength(1);
  });

  it("extracts news from content.data.items", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse({
        content: {
          colPos0: [
            {
              type: "news_pi1",
              content: { data: { items: [makeNewsItem()] } },
            },
          ],
        },
      }),
    );
    const articles = await adapter.fetchAllArticles();
    expect(articles).toHaveLength(1);
  });

  it("extracts from legacy top-level colPos with CType=list", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(makeLegacyNewsPage([makeNewsItem()])),
    );
    const articles = await adapter.fetchAllArticles();
    expect(articles).toHaveLength(1);
  });

  it("extracts news from element.items fallback", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse({
        content: {
          colPos0: [
            {
              type: "news_pi1",
              items: [makeNewsItem()],
            },
          ],
        },
      }),
    );
    const articles = await adapter.fetchAllArticles();
    expect(articles).toHaveLength(1);
  });

  it("returns empty for non-news content type", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse({
        content: {
          colPos0: [{ type: "text", content: {} }],
        },
      }),
    );
    const articles = await adapter.fetchAllArticles();
    expect(articles).toHaveLength(0);
  });

  it("skips non-news list_type elements", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse({
        colPos0: [
          {
            CType: "list",
            list_type: "events_pi1",
            data: { list: [makeNewsItem()] },
          },
        ],
      }),
    );
    const articles = await adapter.fetchAllArticles();
    expect(articles).toHaveLength(0);
  });
});

/* ========== Artikel-Mapping ========== */

describe("article mapping", () => {
  it("maps all fields correctly", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(makeNewsPage([makeNewsItem()])),
    );
    const articles = (await adapter.fetchAllArticles()) as Record<
      string,
      unknown
    >[];
    const article = articles[0];

    expect(article.id).toBe("1");
    expect(article.headline).toBe("Test-Artikel");
    expect(article.slug).toBe("test-artikel");
    expect(article.teaser).toBe("Ein Teaser");
    expect(article.body).toBe("<p>Body</p>");
    expect(article.tags).toEqual(["berlin", "news"]);
    expect(article.commentCount).toBe(0);
    expect(article.isPremium).toBe(false);
    expect(article.paywall).toBe("free");
    expect(article.readingTimeMinutes).toBe(0);
    expect(article.comments).toEqual([]);
  });

  it("parses formatted date string to ISO", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(makeNewsPage([makeNewsItem({ datetime: "Jul 02 2026" })])),
    );
    const articles = (await adapter.fetchAllArticles()) as Record<
      string,
      unknown
    >[];
    expect(articles[0].publicationDate).toBe(
      new Date("Jul 02 2026").toISOString(),
    );
  });

  it("maps unix timestamp to ISO", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(makeNewsPage([makeNewsItem({ datetime: 1700000000 })])),
    );
    const articles = (await adapter.fetchAllArticles()) as Record<
      string,
      unknown
    >[];
    expect(articles[0].publicationDate).toBe(
      new Date(1700000000 * 1000).toISOString(),
    );
  });

  it("handles datetime: 0 as empty string", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(makeNewsPage([makeNewsItem({ datetime: 0 })])),
    );
    const articles = (await adapter.fetchAllArticles()) as Record<
      string,
      unknown
    >[];
    expect(articles[0].publicationDate).toBe("");
  });

  it("handles datetime: undefined as empty string", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(makeNewsPage([makeNewsItem({ datetime: undefined })])),
    );
    const articles = (await adapter.fetchAllArticles()) as Record<
      string,
      unknown
    >[];
    expect(articles[0].publicationDate).toBe("");
  });

  it("maps media image correctly", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(makeNewsPage([makeNewsItem()])),
    );
    const articles = (await adapter.fetchAllArticles()) as Record<
      string,
      unknown
    >[];
    const img = articles[0].image as Record<string, unknown>;
    expect(img.fallbackSrc).toBe("/cms-proxy/fileadmin/test.jpg");
    expect(img.alt).toBe("Alt Text");
  });

  it("falls back to falMedia for legacy format", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(
        makeNewsPage([
          makeNewsItem({
            media: undefined,
            falMedia: [
              {
                publicUrl: "/fileadmin/legacy.jpg",
                properties: { alternative: "Legacy" },
              },
            ],
          }),
        ]),
      ),
    );
    const articles = (await adapter.fetchAllArticles()) as Record<
      string,
      unknown
    >[];
    const img = articles[0].image as Record<string, unknown>;
    expect(img.fallbackSrc).toBe("/cms-proxy/fileadmin/legacy.jpg");
  });

  it("handles author as object (headless_news format)", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(
        makeNewsPage([
          makeNewsItem({
            author: { author: "Maria Schmidt", authorEmail: "m@test.de" },
          }),
        ]),
      ),
    );
    const articles = (await adapter.fetchAllArticles()) as Record<
      string,
      unknown
    >[];
    const author = articles[0].author as Record<string, unknown>;
    expect(author.name).toBe("Maria Schmidt");
    expect(author.slug).toBe("maria-schmidt");
  });

  it("handles author as string (legacy format)", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(makeNewsPage([makeNewsItem({ author: "Max Mustermann" })])),
    );
    const articles = (await adapter.fetchAllArticles()) as Record<
      string,
      unknown
    >[];
    const author = articles[0].author as Record<string, unknown>;
    expect(author.name).toBe("Max Mustermann");
  });

  it("handles empty author object", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(
        makeNewsPage([
          makeNewsItem({ author: { author: "", authorEmail: "" } }),
        ]),
      ),
    );
    const articles = (await adapter.fetchAllArticles()) as Record<
      string,
      unknown
    >[];
    const author = articles[0].author as Record<string, unknown>;
    expect(author.name).toBe("");
    expect(author.id).toBe("");
  });

  it("sanitizes teaser HTML", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(
        makeNewsPage([makeNewsItem({ teaser: "<b>Bold</b> text" })]),
      ),
    );
    const articles = (await adapter.fetchAllArticles()) as Record<
      string,
      unknown
    >[];
    expect(articles[0].teaser).toBe("<b>Bold</b> text");
  });
});

/* ========== URL-Handling ========== */

describe("URL handling", () => {
  it("converts relative URL to absolute", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(
        makeNewsPage([
          makeNewsItem({
            media: [
              {
                publicUrl: "/fileadmin/img.jpg",
                properties: { alternative: "" },
              },
            ],
          }),
        ]),
      ),
    );
    const articles = (await adapter.fetchAllArticles()) as Record<
      string,
      unknown
    >[];
    const img = articles[0].image as Record<string, unknown>;
    expect(img.fallbackSrc).toBe("/cms-proxy/fileadmin/img.jpg");
  });

  it("keeps absolute URL as-is", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(
        makeNewsPage([
          makeNewsItem({
            media: [
              {
                publicUrl: "https://cdn.example.com/img.jpg",
                properties: { alternative: "" },
              },
            ],
          }),
        ]),
      ),
    );
    const articles = (await adapter.fetchAllArticles()) as Record<
      string,
      unknown
    >[];
    const img = articles[0].image as Record<string, unknown>;
    expect(img.fallbackSrc).toBe("https://cdn.example.com/img.jpg");
  });

  it("handles protocol-relative URL", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(
        makeNewsPage([
          makeNewsItem({
            media: [
              {
                publicUrl: "//cdn.example.com/img.jpg",
                properties: { alternative: "" },
              },
            ],
          }),
        ]),
      ),
    );
    const articles = (await adapter.fetchAllArticles()) as Record<
      string,
      unknown
    >[];
    const img = articles[0].image as Record<string, unknown>;
    expect(img.fallbackSrc).toBe("https://cdn.example.com/img.jpg");
  });

  it("handles null publicUrl", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(
        makeNewsPage([
          makeNewsItem({
            media: [{ publicUrl: null, properties: {} }],
          }),
        ]),
      ),
    );
    const articles = (await adapter.fetchAllArticles()) as Record<
      string,
      unknown
    >[];
    const img = articles[0].image as Record<string, unknown>;
    expect(img.fallbackSrc).toBe("");
  });
});

/* ========== Kategorie-Deduplizierung ========== */

describe("category deduplication", () => {
  it("deduplicates categories by id with article count", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(
        makeNewsPage([
          makeNewsItem({ categories: [{ id: 1, title: "Politik" }] }),
          makeNewsItem({
            uid: 2,
            categories: [{ id: 1, title: "Politik" }],
          }),
          makeNewsItem({
            uid: 3,
            categories: [{ id: 2, title: "Sport" }],
          }),
        ]),
      ),
    );
    const categories = (await adapter.fetchAllCategories()) as Record<
      string,
      unknown
    >[];
    expect(categories).toHaveLength(2);
    const politik = categories.find((c) => c.name === "Politik") as Record<
      string,
      unknown
    >;
    expect(politik.articleCount).toBe(2);
    expect(politik.slug).toBe("politik");
  });

  it("generates correct slugs for categories", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(
        makeNewsPage([
          makeNewsItem({
            categories: [{ id: 1, title: "Wirtschaft & Finanzen" }],
          }),
        ]),
      ),
    );
    const categories = (await adapter.fetchAllCategories()) as Record<
      string,
      unknown
    >[];
    expect(categories[0].slug).toBe("wirtschaft-finanzen");
  });

  it("handles items without categories", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(makeNewsPage([makeNewsItem({ categories: undefined })])),
    );
    const categories = await adapter.fetchAllCategories();
    expect(categories).toHaveLength(0);
  });
});

/* ========== Author-Deduplizierung ========== */

describe("author deduplication", () => {
  it("deduplicates authors by name", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(
        makeNewsPage([
          makeNewsItem({
            author: { author: "Max Mustermann", authorEmail: "" },
          }),
          makeNewsItem({
            uid: 2,
            author: { author: "Max Mustermann", authorEmail: "" },
          }),
          makeNewsItem({
            uid: 3,
            author: { author: "Erika Musterfrau", authorEmail: "" },
          }),
        ]),
      ),
    );
    const authors = (await adapter.fetchAllAuthors()) as Record<
      string,
      unknown
    >[];
    expect(authors).toHaveLength(2);
    expect(authors[0].bio).toBe("");
    expect(authors[0].role).toBe("");
  });

  it("returns full author shape", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(
        makeNewsPage([
          makeNewsItem({
            author: { author: "Max Mustermann", authorEmail: "" },
          }),
        ]),
      ),
    );
    const authors = (await adapter.fetchAllAuthors()) as Record<
      string,
      unknown
    >[];
    expect(authors[0]).toEqual({
      id: "max-mustermann",
      name: "Max Mustermann",
      slug: "max-mustermann",
      avatar: "",
      bio: "",
      role: "",
    });
  });
});

/* ========== Client-seitige Suche ========== */

describe("search", () => {
  it("matches headline case-insensitively", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(
        makeNewsPage([
          makeNewsItem({ title: "Berlin plant Neues" }),
          makeNewsItem({ uid: 2, title: "Sport heute" }),
        ]),
      ),
    );
    const results = await adapter.searchArticlesByQuery("berlin");
    expect(results).toHaveLength(1);
  });

  it("matches teaser", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(
        makeNewsPage([
          makeNewsItem({ title: "News", teaser: "Berlin plant Neues" }),
        ]),
      ),
    );
    const results = await adapter.searchArticlesByQuery("berlin");
    expect(results).toHaveLength(1);
  });

  it("is case-insensitive", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(makeNewsPage([makeNewsItem({ title: "BERLIN News" })])),
    );
    const results = await adapter.searchArticlesByQuery("berlin");
    expect(results).toHaveLength(1);
  });
});

/* ========== Navigation ========== */

describe("navigation", () => {
  it("maps nav items correctly", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse({
        navigation: [
          {
            title: "Start",
            link: "/",
            active: 1,
            current: 0,
            children: [{ title: "Sub", link: "/sub" }],
          },
        ],
      }),
    );
    const nav = (await adapter.fetchNavigation()) as Record<string, unknown>;
    const menu = nav.primaryMenu as Array<Record<string, unknown>>;
    expect(menu).toHaveLength(1);
    const ref = menu[0].reference as Record<string, unknown>;
    expect(ref.label).toBe("Start");
    expect(ref.isActive).toBe(true);
    const children = menu[0].children as Array<Record<string, unknown>>;
    expect(children).toHaveLength(1);
  });

  it("returns defaultNavigation on error", async () => {
    mockSafeFetch.mockRejectedValue(new Error("Network error"));
    const nav = (await adapter.fetchNavigation()) as Record<string, unknown>;
    const menu = nav.primaryMenu as unknown[];
    expect(menu.length).toBeGreaterThan(0);
    expect(nav.footerMenu).toBeDefined();
  });
});

/* ========== SiteConfig ========== */

describe("siteConfig", () => {
  it("maps site config correctly", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse({
        title: "Meine Seite",
        meta: { description: "Beschreibung" },
      }),
    );
    const config = (await adapter.fetchSiteConfig()) as Record<string, unknown>;
    expect(config.title).toBe("Meine Seite");
    expect(config.description).toBe("Beschreibung");
    expect(config.language).toBe("de");
  });

  it("returns defaultSiteConfig on error", async () => {
    mockSafeFetch.mockRejectedValue(new Error("Network error"));
    const config = (await adapter.fetchSiteConfig()) as Record<string, unknown>;
    expect(config.title).toBe("Berliner Rundschau");
  });
});

/* ========== fetchArticleBySlug Fallback ========== */

describe("fetchArticleBySlug", () => {
  it("returns article from slug route", async () => {
    mockSafeFetch.mockResolvedValue(
      jsonResponse(
        makeNewsPage([makeNewsItem({ pathSegment: "mein-artikel" })]),
      ),
    );
    const article = (await adapter.fetchArticleBySlug(
      "mein-artikel",
    )) as Record<string, unknown>;
    expect(article).not.toBeNull();
    expect(article.slug).toBe("mein-artikel");
  });

  it("falls back to full list on 404", async () => {
    let callCount = 0;
    mockSafeFetch.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(new Error("HTTP 404 Not Found"));
      }
      return Promise.resolve(
        jsonResponse(
          makeNewsPage([
            makeNewsItem({ pathSegment: "mein-artikel" }),
            makeNewsItem({ uid: 2, pathSegment: "anderer-artikel" }),
          ]),
        ),
      );
    });
    const article = (await adapter.fetchArticleBySlug(
      "mein-artikel",
    )) as Record<string, unknown>;
    expect(article).not.toBeNull();
    expect(article.slug).toBe("mein-artikel");
    expect(callCount).toBe(2);
  });
});

/* ========== MAX_NEWS_ITEMS Cap ========== */

describe("MAX_NEWS_ITEMS cap", () => {
  it("caps at 500 items with warning", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const items = Array.from({ length: 600 }, (_, i) =>
      makeNewsItem({ uid: i, pathSegment: `article-${i}` }),
    );
    mockSafeFetch.mockResolvedValue(jsonResponse(makeNewsPage(items)));
    const articles = await adapter.fetchAllArticles();
    expect(articles).toHaveLength(500);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("600 news items found, capping at 500"),
    );
    warnSpy.mockRestore();
  });
});

/* ========== Config Parsing ========== */

describe("config parsing", () => {
  it("parses valid JSON array for TYPO3_CONTENT_PAGES", async () => {
    vi.resetModules();
    vi.doMock("server-only", () => ({}));
    vi.doMock("../http", () => ({
      safeFetch: (...args: unknown[]) => mockSafeFetch(...args),
      sanitizeError: (err: unknown) => String(err),
    }));
    vi.doMock("../sanitize", () => ({
      sanitizeRichText: (html: string) => html,
    }));
    vi.doMock("../image-utils", () => ({
      normalizeImage: (src: string | null | undefined) => ({
        alt: "",
        fallbackSrc: src ?? "",
        crops: [],
        sizes: [],
      }),
    }));

    vi.stubEnv("TYPO3_URL", "http://localhost:8080");
    vi.stubEnv("CMS_ADAPTER", "typo3");
    vi.stubEnv("TYPO3_CONTENT_PAGES", '["/", "/about"]');

    mockSafeFetch.mockResolvedValue(
      jsonResponse({ title: "Test", navigation: [] }),
    );
    const mod = await import("../typo3.adapter");
    const result = await mod.default.fetchSiteConfig();
    expect(result).toBeDefined();
  });

  it("falls back to default on invalid JSON", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.resetModules();
    vi.doMock("server-only", () => ({}));
    vi.doMock("../http", () => ({
      safeFetch: (...args: unknown[]) => mockSafeFetch(...args),
      sanitizeError: (err: unknown) => String(err),
    }));
    vi.doMock("../sanitize", () => ({
      sanitizeRichText: (html: string) => html,
    }));
    vi.doMock("../image-utils", () => ({
      normalizeImage: (src: string | null | undefined) => ({
        alt: "",
        fallbackSrc: src ?? "",
        crops: [],
        sizes: [],
      }),
    }));

    vi.stubEnv("TYPO3_URL", "http://localhost:8080");
    vi.stubEnv("CMS_ADAPTER", "typo3");
    vi.stubEnv("TYPO3_CONTENT_PAGES", "not-json");

    mockSafeFetch.mockResolvedValue(
      jsonResponse(makeNewsPage([makeNewsItem()])),
    );
    const mod = await import("../typo3.adapter");
    const articles = await mod.default.fetchAllArticles();
    expect(articles).toHaveLength(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("not valid JSON"),
    );
    warnSpy.mockRestore();
  });

  it("filters non-string values from TYPO3_CONTENT_PAGES", async () => {
    vi.resetModules();
    vi.doMock("server-only", () => ({}));
    vi.doMock("../http", () => ({
      safeFetch: (...args: unknown[]) => mockSafeFetch(...args),
      sanitizeError: (err: unknown) => String(err),
    }));
    vi.doMock("../sanitize", () => ({
      sanitizeRichText: (html: string) => html,
    }));
    vi.doMock("../image-utils", () => ({
      normalizeImage: (src: string | null | undefined) => ({
        alt: "",
        fallbackSrc: src ?? "",
        crops: [],
        sizes: [],
      }),
    }));

    vi.stubEnv("TYPO3_URL", "http://localhost:8080");
    vi.stubEnv("CMS_ADAPTER", "typo3");
    vi.stubEnv("TYPO3_CONTENT_PAGES", '["/", 123, null]');

    mockSafeFetch.mockResolvedValue(
      jsonResponse({ title: "Test", navigation: [] }),
    );
    const mod = await import("../typo3.adapter");
    const result = await mod.default.fetchSiteConfig();
    expect(result).toBeDefined();
  });
});

/* ========== Error Handling ========== */

describe("error handling", () => {
  it("propagates errors from essential methods", async () => {
    mockSafeFetch.mockRejectedValue(new Error("Server down"));
    await expect(adapter.fetchAllArticles()).rejects.toThrow();
  });

  it("non-essential methods return defaults on error", async () => {
    mockSafeFetch.mockRejectedValue(new Error("Server down"));
    const nav = await adapter.fetchNavigation();
    expect(nav).toBeDefined();
    const config = await adapter.fetchSiteConfig();
    expect(config).toBeDefined();
  });
});

/* ========== Non-essential stubs ========== */

describe("non-essential stubs", () => {
  it("returns mock data for non-essential endpoints", async () => {
    const ticker = await adapter.fetchNewsticker();
    expect(Array.isArray(ticker)).toBe(true);
    const videos = await adapter.fetchVideos();
    expect(Array.isArray(videos)).toBe(true);
    const breaking = await adapter.fetchBreakingNews();
    expect(Array.isArray(breaking)).toBe(true);
    const quiz = await adapter.fetchQuiz();
    expect(quiz).toBeDefined();
    const stock = await adapter.fetchStockData();
    expect(stock).toBeDefined();
  });
});

/* ========== Adapter name ========== */

describe("adapter identity", () => {
  it("has name 'typo3'", () => {
    expect(adapter.name).toBe("typo3");
  });
});
