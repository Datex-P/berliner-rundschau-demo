import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

/* ---------- mock safeFetch BEFORE importing the adapter ---------- */

const mockSafeFetch = vi.fn();
vi.mock("../http", () => ({
  safeFetch: (...args: unknown[]) => mockSafeFetch(...args),
  sanitizeError: (err: unknown) => String(err),
}));

/* Mock sanitize to pass through (tested separately) */
vi.mock("../sanitize", () => ({
  sanitizeRichText: (html: string) => html,
}));

/* Mock image-utils to pass through */
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

/* ---------- env vars (module-level reads) ---------- */

vi.stubEnv("STRAPI_URL", "http://localhost:1337");
vi.stubEnv("STRAPI_API_TOKEN", "test-token");
vi.stubEnv("STRAPI_VERSION", "v5");

/* ---------- import adapter after mocks + env ---------- */

import type { CmsAdapter } from "../types";

/* We use a dynamic import so the module reads our stubbed env vars. */
let adapter: CmsAdapter;

beforeEach(async () => {
  mockSafeFetch.mockReset();
  /* Re-import to pick up env vars each time */
  vi.resetModules();

  /* Re-apply mocks after resetModules */
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

  const mod = await import("../strapi.adapter");
  adapter = mod.default;
});

/* ---------- helpers ---------- */

function mockJsonResponse(data: unknown) {
  return Promise.resolve({
    json: () => Promise.resolve(data),
    ok: true,
    status: 200,
  });
}

/** Build a minimal Strapi v5 article with blocks body. */
function makeStrapiArticle(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    headline: "Test Headline",
    slug: "test-headline",
    teaser: "A short teaser",
    body: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "Hello world" }],
      },
    ],
    publishedAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-16T10:00:00Z",
    image: {
      url: "/uploads/hero.jpg",
      alternativeText: "Hero",
      width: 1200,
      height: 800,
    },
    category: { id: 5, name: "Politik", slug: "politik" },
    author: { id: 3, name: "Max Mustermann", slug: "max-mustermann" },
    tags: [{ name: "Berlin" }, { name: "News" }],
    readingTimeMinutes: 4,
    isPremium: false,
    paywall: "free",
    isLive: false,
    isOpinion: false,
    isFeatured: true,
    isBreaking: false,
    aiSummary: "Summary text",
    region: "Berlin",
    ...overrides,
  };
}

/** Wrap articles in Strapi list response with pagination. */
function strapiListResponse(items: unknown[], pageCount = 1) {
  return {
    data: items,
    meta: { pagination: { pageCount } },
  };
}

/* ================================================================== */
/*  1. Rich Text: blocksToHtml + childrenToHtml (tested indirectly)   */
/* ================================================================== */

describe("rich text conversion (via adapter output)", () => {
  it("converts paragraph with bold text to HTML", async () => {
    const article = makeStrapiArticle({
      body: [
        {
          type: "paragraph",
          children: [
            { type: "text", text: "Normal " },
            { type: "text", text: "bold", bold: true },
            { type: "text", text: " text" },
          ],
        },
      ],
    });
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    expect(mapped.body).toBe("<p>Normal <strong>bold</strong> text</p>");
  });

  it("converts heading with level to HTML", async () => {
    const article = makeStrapiArticle({
      body: [
        {
          type: "heading",
          level: 3,
          children: [{ type: "text", text: "Section Title" }],
        },
      ],
    });
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    expect(mapped.body).toBe("<h3>Section Title</h3>");
  });

  it("converts ordered list to HTML", async () => {
    const article = makeStrapiArticle({
      body: [
        {
          type: "list",
          format: "ordered",
          children: [
            { type: "list-item", children: [{ type: "text", text: "First" }] },
            { type: "list-item", children: [{ type: "text", text: "Second" }] },
          ],
        },
      ],
    });
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    expect(mapped.body).toBe("<ol><li>First</li><li>Second</li></ol>");
  });

  it("converts blockquote to HTML", async () => {
    const article = makeStrapiArticle({
      body: [
        {
          type: "quote",
          children: [{ type: "text", text: "Famous quote" }],
        },
      ],
    });
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    expect(mapped.body).toBe("<blockquote>Famous quote</blockquote>");
  });

  it("converts image block to HTML", async () => {
    const article = makeStrapiArticle({
      body: [
        {
          type: "image",
          image: {
            url: "https://cdn.example.com/photo.jpg",
            alternativeText: "A photo",
          },
        },
      ],
    });
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    expect(mapped.body).toBe(
      '<img src="https://cdn.example.com/photo.jpg" alt="A photo">',
    );
  });

  it("converts link with children to HTML", async () => {
    const article = makeStrapiArticle({
      body: [
        {
          type: "paragraph",
          children: [
            {
              type: "link",
              url: "https://example.com",
              children: [{ type: "text", text: "Click here" }],
            },
          ],
        },
      ],
    });
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    expect(mapped.body).toBe(
      '<p><a href="https://example.com">Click here</a></p>',
    );
  });

  it("converts code block to HTML", async () => {
    const article = makeStrapiArticle({
      body: [
        {
          type: "code",
          children: [{ type: "text", text: "const x = 1;" }],
        },
      ],
    });
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    expect(mapped.body).toBe("<pre><code>const x = 1;</code></pre>");
  });

  it("passes through plain string body unchanged", async () => {
    const article = makeStrapiArticle({
      body: "<p>Already HTML</p>",
    });
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    expect(mapped.body).toBe("<p>Already HTML</p>");
  });

  it("converts inline formatting: italic, underline, strikethrough, code", async () => {
    const article = makeStrapiArticle({
      body: [
        {
          type: "paragraph",
          children: [
            { type: "text", text: "italic", italic: true },
            { type: "text", text: " " },
            { type: "text", text: "underline", underline: true },
            { type: "text", text: " " },
            { type: "text", text: "strike", strikethrough: true },
            { type: "text", text: " " },
            { type: "text", text: "code", code: true },
          ],
        },
      ],
    });
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    expect(mapped.body).toBe(
      "<p><em>italic</em> <u>underline</u> <s>strike</s> <code>code</code></p>",
    );
  });

  it("returns empty string for non-array, non-string body", async () => {
    const article = makeStrapiArticle({
      body: 42,
    });
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    expect(mapped.body).toBe("");
  });
});

/* ================================================================== */
/*  2. v4 / v5 unwrapping                                            */
/* ================================================================== */

describe("v4/v5 unwrapping", () => {
  it("v4 — flattens attributes wrapper", async () => {
    /* Reset modules with v4 env */
    vi.resetModules();
    vi.stubEnv("STRAPI_VERSION", "v4");
    vi.stubEnv("STRAPI_URL", "http://localhost:1337");
    vi.stubEnv("STRAPI_API_TOKEN", "test-token");

    vi.doMock("server-only", () => ({}));
    vi.doMock("../http", () => ({
      safeFetch: (...args: unknown[]) => mockSafeFetch(...args),
      sanitizeError: (err: unknown) => String(err),
    }));
    vi.doMock("../sanitize", () => ({
      sanitizeRichText: (html: string) => html,
    }));
    vi.doMock("../image-utils", () => ({
      normalizeImage: (src: string | null | undefined, alt?: string) => ({
        alt: alt ?? "",
        fallbackSrc: src ?? "",
        crops: [],
        sizes: [],
      }),
    }));

    const v4Mod = await import("../strapi.adapter");
    const v4Adapter = v4Mod.default;

    const v4Article = {
      id: 10,
      attributes: {
        headline: "V4 Article",
        slug: "v4-article",
        teaser: "V4 teaser",
        body: "<p>V4 body</p>",
        publishedAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-02T00:00:00Z",
        image: null,
        category: null,
        author: null,
        tags: [],
      },
    };

    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([v4Article])),
    );

    const results = await v4Adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    expect(mapped.headline).toBe("V4 Article");
    expect(mapped.slug).toBe("v4-article");
    expect(mapped.id).toBe("10");
  });

  it("v5 — no unwrapping needed for flat items", async () => {
    const article = makeStrapiArticle({ headline: "V5 Flat" });
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    expect(mapped.headline).toBe("V5 Flat");
  });
});

/* ================================================================== */
/*  3. Pagination                                                     */
/* ================================================================== */

describe("pagination", () => {
  it("fetches multiple pages until pageCount is reached", async () => {
    const page1Article = makeStrapiArticle({ id: 1, slug: "article-1" });
    const page2Article = makeStrapiArticle({ id: 2, slug: "article-2" });

    mockSafeFetch
      .mockReturnValueOnce(
        mockJsonResponse({
          data: [page1Article],
          meta: { pagination: { pageCount: 2 } },
        }),
      )
      .mockReturnValueOnce(
        mockJsonResponse({
          data: [page2Article],
          meta: { pagination: { pageCount: 2 } },
        }),
      );

    const results = await adapter.fetchAllArticles();
    expect(results).toHaveLength(2);
    expect(mockSafeFetch).toHaveBeenCalledTimes(2);

    /* Verify page params in the URLs */
    const firstUrl = mockSafeFetch.mock.calls[0][0] as string;
    const secondUrl = mockSafeFetch.mock.calls[1][0] as string;
    expect(firstUrl).toContain("pagination[page]=1");
    expect(secondUrl).toContain("pagination[page]=2");
  });

  it("handles single page without extra fetches", async () => {
    const article = makeStrapiArticle();
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article], 1)),
    );

    await adapter.fetchAllArticles();
    expect(mockSafeFetch).toHaveBeenCalledTimes(1);
  });
});

/* ================================================================== */
/*  4. Adapter methods                                                */
/* ================================================================== */

describe("fetchAllArticles", () => {
  it("maps all fields correctly", async () => {
    const article = makeStrapiArticle();
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    expect(results).toHaveLength(1);

    const mapped = results[0] as Record<string, unknown>;
    expect(mapped.id).toBe("1");
    expect(mapped.headline).toBe("Test Headline");
    expect(mapped.slug).toBe("test-headline");
    expect(mapped.teaser).toBe("A short teaser");
    expect(mapped.publicationDate).toBe("2026-01-15T10:00:00Z");
    expect(mapped.updatedAt).toBe("2026-01-16T10:00:00Z");
    expect(mapped.readingTimeMinutes).toBe(4);
    expect(mapped.isPremium).toBe(false);
    expect(mapped.isFeatured).toBe(true);
    expect(mapped.region).toBe("Berlin");
    expect(mapped.aiSummary).toBe("Summary text");
    expect(mapped.tags).toEqual(["Berlin", "News"]);
    expect(mapped.commentCount).toBe(0);
    expect(mapped.comments).toEqual([]);
  });

  it("maps category correctly", async () => {
    const article = makeStrapiArticle();
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    expect(mapped.category).toEqual({
      id: "5",
      name: "Politik",
      slug: "politik",
    });
  });

  it("maps author correctly", async () => {
    const article = makeStrapiArticle();
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    expect(mapped.author).toEqual({
      id: "3",
      name: "Max Mustermann",
      slug: "max-mustermann",
      avatar: "",
    });
  });

  it("maps image with absolute URL", async () => {
    const article = makeStrapiArticle();
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    const image = mapped.image as Record<string, unknown>;
    expect(image.fallbackSrc).toBe("http://localhost:1337/uploads/hero.jpg");
    expect(image.alt).toBe("Hero");
  });

  it("handles null category gracefully", async () => {
    const article = makeStrapiArticle({ category: null });
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    expect(mapped.category).toEqual({ id: "", name: "", slug: "" });
  });

  it("handles null author gracefully", async () => {
    const article = makeStrapiArticle({ author: null });
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    expect(mapped.author).toEqual({ id: "", name: "", slug: "", avatar: "" });
  });

  it("handles string tags array", async () => {
    const article = makeStrapiArticle({ tags: ["Berlin", "Sport"] });
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    expect(mapped.tags).toEqual(["Berlin", "Sport"]);
  });

  it("includes sort=publishedAt:desc in query", async () => {
    mockSafeFetch.mockReturnValue(mockJsonResponse(strapiListResponse([])));

    await adapter.fetchAllArticles();
    const url = mockSafeFetch.mock.calls[0][0] as string;
    expect(url).toContain("sort=publishedAt:desc");
  });
});

describe("fetchArticleBySlug", () => {
  it("uses slug filter in query", async () => {
    const article = makeStrapiArticle({ slug: "my-article" });
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const result = await adapter.fetchArticleBySlug("my-article");
    expect(result).not.toBeNull();

    const url = mockSafeFetch.mock.calls[0][0] as string;
    expect(url).toContain("filters[slug][$eq]=my-article");
    expect(url).toContain("pagination[pageSize]=1");
  });

  it("returns null when no article found", async () => {
    mockSafeFetch.mockReturnValue(mockJsonResponse(strapiListResponse([])));

    const result = await adapter.fetchArticleBySlug("nonexistent");
    expect(result).toBeNull();
  });

  it("returns null on fetch error", async () => {
    mockSafeFetch.mockRejectedValue(new Error("Network error"));

    const result = await adapter.fetchArticleBySlug("some-slug");
    expect(result).toBeNull();
  });

  it("encodes special characters in slug", async () => {
    mockSafeFetch.mockReturnValue(mockJsonResponse(strapiListResponse([])));

    await adapter.fetchArticleBySlug("slug with spaces");
    const url = mockSafeFetch.mock.calls[0][0] as string;
    expect(url).toContain("slug%20with%20spaces");
  });
});

describe("searchArticlesByQuery", () => {
  it("uses containsi filter for search", async () => {
    const article = makeStrapiArticle({ headline: "Berlin News" });
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.searchArticlesByQuery("Berlin");
    expect(results).toHaveLength(1);

    const url = mockSafeFetch.mock.calls[0][0] as string;
    expect(url).toContain("filters[headline][$containsi]=Berlin");
  });

  it("returns empty array on error", async () => {
    mockSafeFetch.mockRejectedValue(new Error("Search failed"));

    const results = await adapter.searchArticlesByQuery("test");
    expect(results).toEqual([]);
  });
});

describe("fetchAllCategories", () => {
  it("maps category fields correctly", async () => {
    const categories = [
      {
        id: 1,
        name: "Politik",
        slug: "politik",
        description: "Politische Nachrichten",
        color: "#ff0000",
      },
      {
        id: 2,
        name: "Sport",
        slug: "sport",
        description: "Sportnachrichten",
        color: "#00ff00",
      },
    ];
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse(categories)),
    );

    const results = await adapter.fetchAllCategories();
    expect(results).toHaveLength(2);

    const first = results[0] as Record<string, unknown>;
    expect(first).toEqual({
      id: "1",
      name: "Politik",
      slug: "politik",
      description: "Politische Nachrichten",
      color: "#ff0000",
    });
  });

  it("uses categories collection with sort", async () => {
    mockSafeFetch.mockReturnValue(mockJsonResponse(strapiListResponse([])));

    await adapter.fetchAllCategories();
    const url = mockSafeFetch.mock.calls[0][0] as string;
    expect(url).toContain("/categories");
    expect(url).toContain("sort=name:asc");
  });
});

describe("fetchNewsticker", () => {
  it("returns empty array on error", async () => {
    mockSafeFetch.mockRejectedValue(new Error("Ticker down"));

    const results = await adapter.fetchNewsticker();
    expect(results).toEqual([]);
  });

  it("maps newsticker items", async () => {
    const items = [
      {
        id: 1,
        headline: "Breaking",
        text: "Something happened",
        publishedAt: "2026-07-01T12:00:00Z",
        url: "/breaking",
      },
    ];
    mockSafeFetch.mockReturnValue(mockJsonResponse(strapiListResponse(items)));

    const results = await adapter.fetchNewsticker();
    expect(results).toHaveLength(1);
    const first = results[0] as Record<string, unknown>;
    expect(first.headline).toBe("Breaking");
    expect(first.text).toBe("Something happened");
    expect(first.url).toBe("/breaking");
  });
});

/* ================================================================== */
/*  5. Auth header                                                    */
/* ================================================================== */

describe("auth header", () => {
  it("includes Bearer token in requests", async () => {
    mockSafeFetch.mockReturnValue(mockJsonResponse(strapiListResponse([])));

    await adapter.fetchAllArticles();

    const options = mockSafeFetch.mock.calls[0][1] as Record<string, unknown>;
    const headers = options.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer test-token");
    expect(headers.Accept).toBe("application/json");
  });
});

/* ================================================================== */
/*  6. Additional adapter methods                                     */
/* ================================================================== */

describe("fetchArticlesByCategory", () => {
  it("filters by category slug", async () => {
    const article = makeStrapiArticle();
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchArticlesByCategory("politik");
    expect(results).toHaveLength(1);

    const url = mockSafeFetch.mock.calls[0][0] as string;
    expect(url).toContain("filters[category][slug][$eq]=politik");
  });
});

describe("fetchArticleSlugs", () => {
  it("returns slug and updatedAt for each article", async () => {
    const articles = [
      { id: 1, slug: "article-1", updatedAt: "2026-01-01T00:00:00Z" },
      { id: 2, slug: "article-2", updatedAt: "2026-01-02T00:00:00Z" },
    ];
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse(articles)),
    );

    const results = await adapter.fetchArticleSlugs();
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      slug: "article-1",
      updatedAt: "2026-01-01T00:00:00Z",
    });
    expect(results[1]).toEqual({
      slug: "article-2",
      updatedAt: "2026-01-02T00:00:00Z",
    });
  });
});

describe("fetchNavigation", () => {
  it("returns items from navigation", async () => {
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(
        strapiListResponse([{ id: 1, items: [{ label: "Home", url: "/" }] }]),
      ),
    );

    const result = (await adapter.fetchNavigation()) as Record<string, unknown>;
    expect(result.items).toEqual([{ label: "Home", url: "/" }]);
  });

  it("returns empty items when no navigation found", async () => {
    mockSafeFetch.mockReturnValue(mockJsonResponse(strapiListResponse([])));

    const result = (await adapter.fetchNavigation()) as Record<string, unknown>;
    expect(result.items).toEqual([]);
  });
});

describe("fetchSiteConfig", () => {
  it("returns site config object", async () => {
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(
        strapiListResponse([
          { id: 1, siteName: "Berliner Rundschau", language: "de" },
        ]),
      ),
    );

    const result = (await adapter.fetchSiteConfig()) as Record<string, unknown>;
    expect(result.siteName).toBe("Berliner Rundschau");
  });

  it("returns empty object when no config found", async () => {
    mockSafeFetch.mockReturnValue(mockJsonResponse(strapiListResponse([])));

    const result = await adapter.fetchSiteConfig();
    expect(result).toEqual({});
  });
});

describe("adapter name", () => {
  it("has name 'strapi'", () => {
    expect(adapter.name).toBe("strapi");
  });
});

/* ================================================================== */
/*  7. Image URL resolution                                           */
/* ================================================================== */

describe("image URL resolution", () => {
  it("makes relative image URLs absolute", async () => {
    const article = makeStrapiArticle({
      image: { url: "/uploads/photo.jpg", alternativeText: "Photo" },
    });
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    const image = mapped.image as Record<string, unknown>;
    expect(image.fallbackSrc).toBe("http://localhost:1337/uploads/photo.jpg");
  });

  it("preserves absolute image URLs", async () => {
    const article = makeStrapiArticle({
      image: {
        url: "https://cdn.example.com/photo.jpg",
        alternativeText: "Photo",
      },
    });
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    const image = mapped.image as Record<string, unknown>;
    expect(image.fallbackSrc).toBe("https://cdn.example.com/photo.jpg");
  });

  it("handles null image field", async () => {
    const article = makeStrapiArticle({ image: null });
    mockSafeFetch.mockReturnValue(
      mockJsonResponse(strapiListResponse([article])),
    );

    const results = await adapter.fetchAllArticles();
    const mapped = results[0] as Record<string, unknown>;
    const image = mapped.image as Record<string, unknown>;
    expect(image.fallbackSrc).toBe("");
  });
});
