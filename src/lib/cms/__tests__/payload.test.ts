import { describe, it, expect, vi, beforeEach } from "vitest";

// Set env vars via vi.hoisted so they exist before module-level code runs
const mockSafeFetch = vi.hoisted(() => {
  process.env.PAYLOAD_URL = "http://localhost:3000";
  process.env.PAYLOAD_API_KEY = "test-api-key";
  return vi.fn();
});

vi.mock("server-only", () => ({}));

// Mock safeFetch BEFORE importing the adapter
vi.mock("../http", () => ({
  safeFetch: (...args: unknown[]) => mockSafeFetch(...args),
  sanitizeError: (err: unknown) => String(err),
}));

// Mock sanitizeRichText as identity so we can test lexical output directly
vi.mock("../sanitize", () => ({
  sanitizeRichText: (html: string) => html,
}));

// Import adapter AFTER mocks and env are set up
import payloadAdapter from "../payload.adapter";

/* ---------- helpers ---------- */

interface MockResponse {
  json: () => Promise<unknown>;
  ok: boolean;
  status: number;
}

function mockJsonResponse(data: unknown): Promise<MockResponse> {
  return Promise.resolve({
    json: () => Promise.resolve(data),
    ok: true,
    status: 200,
  });
}

/** Wrap a Lexical node tree in the standard root envelope. */
function lexicalRoot(children: unknown[]): unknown {
  return { root: { children } };
}

/** Create a minimal Payload article doc for testing mapDoc. */
function makeArticleDoc(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: "art-1",
    headline: "Test Headline",
    slug: "test-headline",
    teaser: "A short teaser",
    body: lexicalRoot([
      { type: "paragraph", children: [{ type: "text", text: "Hello World" }] },
    ]),
    publishedAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-16T12:00:00Z",
    createdAt: "2026-01-15T10:00:00Z",
    image: {
      url: "/media/hero.jpg",
      alt: "Hero image",
      width: 1200,
      height: 800,
    },
    category: { id: "cat-1", name: "Politik", slug: "politik" },
    author: {
      id: "auth-1",
      name: "Max Muster",
      slug: "max-muster",
      avatar: { url: "/media/avatar.jpg" },
    },
    tags: ["berlin", "news"],
    readingTimeMinutes: 5,
    isPremium: false,
    paywall: "free",
    isLive: true,
    isOpinion: false,
    isFeatured: true,
    isBreaking: false,
    aiSummary: "AI summary text",
    region: "berlin",
    ...overrides,
  };
}

/* ---------- tests ---------- */

describe("Payload CMS Adapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* -------- Lexical rich text -> HTML -------- */

  describe("Lexical to HTML (through adapter output)", () => {
    it("converts a paragraph node to <p> tags", async () => {
      const doc = makeArticleDoc({
        body: lexicalRoot([
          { type: "paragraph", children: [{ type: "text", text: "Hello" }] },
        ]),
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      expect(article.body).toBe("<p>Hello</p>");
    });

    it("converts a heading node with tag to correct HTML", async () => {
      const doc = makeArticleDoc({
        body: lexicalRoot([
          {
            type: "heading",
            tag: "h3",
            children: [{ type: "text", text: "Section Title" }],
          },
        ]),
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      expect(article.body).toBe("<h3>Section Title</h3>");
    });

    it("applies bold format bitmask (1) with <strong>", async () => {
      const doc = makeArticleDoc({
        body: lexicalRoot([
          {
            type: "paragraph",
            children: [{ type: "text", text: "Bold", format: 1 }],
          },
        ]),
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      expect(article.body).toBe("<p><strong>Bold</strong></p>");
    });

    it("applies italic format bitmask (2) with <em>", async () => {
      const doc = makeArticleDoc({
        body: lexicalRoot([
          {
            type: "paragraph",
            children: [{ type: "text", text: "Italic", format: 2 }],
          },
        ]),
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      expect(article.body).toBe("<p><em>Italic</em></p>");
    });

    it("applies combined bold+italic format bitmask (3)", async () => {
      const doc = makeArticleDoc({
        body: lexicalRoot([
          {
            type: "paragraph",
            children: [{ type: "text", text: "Both", format: 3 }],
          },
        ]),
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      expect(article.body).toBe("<p><em><strong>Both</strong></em></p>");
    });

    it("applies strikethrough format bitmask (4) with <s>", async () => {
      const doc = makeArticleDoc({
        body: lexicalRoot([
          {
            type: "paragraph",
            children: [{ type: "text", text: "Struck", format: 4 }],
          },
        ]),
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      expect(article.body).toBe("<p><s>Struck</s></p>");
    });

    it("applies code format bitmask (16) with <code>", async () => {
      const doc = makeArticleDoc({
        body: lexicalRoot([
          {
            type: "paragraph",
            children: [{ type: "text", text: "snippet", format: 16 }],
          },
        ]),
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      expect(article.body).toBe("<p><code>snippet</code></p>");
    });

    it("converts an ordered list", async () => {
      const doc = makeArticleDoc({
        body: lexicalRoot([
          {
            type: "list",
            listType: "number",
            children: [
              {
                type: "listitem",
                children: [{ type: "text", text: "First" }],
              },
              {
                type: "listitem",
                children: [{ type: "text", text: "Second" }],
              },
            ],
          },
        ]),
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      expect(article.body).toBe("<ol><li>First</li><li>Second</li></ol>");
    });

    it("converts an unordered list", async () => {
      const doc = makeArticleDoc({
        body: lexicalRoot([
          {
            type: "list",
            listType: "bullet",
            children: [
              {
                type: "listitem",
                children: [{ type: "text", text: "Item A" }],
              },
            ],
          },
        ]),
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      expect(article.body).toBe("<ul><li>Item A</li></ul>");
    });

    it("converts a blockquote node", async () => {
      const doc = makeArticleDoc({
        body: lexicalRoot([
          {
            type: "quote",
            children: [{ type: "text", text: "Famous words" }],
          },
        ]),
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      expect(article.body).toBe("<blockquote>Famous words</blockquote>");
    });

    it("converts a link node with fields.url", async () => {
      const doc = makeArticleDoc({
        body: lexicalRoot([
          {
            type: "paragraph",
            children: [
              {
                type: "link",
                fields: { url: "https://example.com" },
                children: [{ type: "text", text: "Click here" }],
              },
            ],
          },
        ]),
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      expect(article.body).toBe(
        '<p><a href="https://example.com">Click here</a></p>',
      );
    });

    it("converts an upload (image) node", async () => {
      const doc = makeArticleDoc({
        body: lexicalRoot([
          {
            type: "upload",
            value: { url: "/media/inline.jpg", alt: "Inline photo" },
          },
        ]),
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      expect(article.body).toBe(
        '<img src="/media/inline.jpg" alt="Inline photo">',
      );
    });

    it("converts a horizontal rule node", async () => {
      const doc = makeArticleDoc({
        body: lexicalRoot([{ type: "horizontalrule" }]),
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      expect(article.body).toBe("<hr>");
    });

    it("converts a linebreak node", async () => {
      const doc = makeArticleDoc({
        body: lexicalRoot([
          {
            type: "paragraph",
            children: [
              { type: "text", text: "Line one" },
              { type: "linebreak" },
              { type: "text", text: "Line two" },
            ],
          },
        ]),
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      expect(article.body).toBe("<p>Line one<br>Line two</p>");
    });

    it("passes through string content unchanged", async () => {
      const doc = makeArticleDoc({
        body: "<p>Already HTML</p>",
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      expect(article.body).toBe("<p>Already HTML</p>");
    });
  });

  /* -------- Pagination -------- */

  describe("pagination", () => {
    it("loops through multiple pages via fetchAllDocs", async () => {
      const page1Doc = makeArticleDoc({ id: "art-1", slug: "article-1" });
      const page2Doc = makeArticleDoc({ id: "art-2", slug: "article-2" });

      mockSafeFetch
        .mockReturnValueOnce(
          mockJsonResponse({ docs: [page1Doc], totalPages: 2 }),
        )
        .mockReturnValueOnce(
          mockJsonResponse({ docs: [page2Doc], totalPages: 2 }),
        );

      const articles = await payloadAdapter.fetchAllArticles();
      expect(articles).toHaveLength(2);
      expect((articles[0] as Record<string, unknown>).id).toBe("art-1");
      expect((articles[1] as Record<string, unknown>).id).toBe("art-2");
      expect(mockSafeFetch).toHaveBeenCalledTimes(2);

      // Verify page parameter increments
      const firstCallUrl = mockSafeFetch.mock.calls[0][0] as string;
      const secondCallUrl = mockSafeFetch.mock.calls[1][0] as string;
      expect(firstCallUrl).toContain("page=1");
      expect(secondCallUrl).toContain("page=2");
    });
  });

  /* -------- Adapter methods -------- */

  describe("fetchAllArticles", () => {
    it("maps all document fields correctly", async () => {
      const doc = makeArticleDoc();
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      expect(articles).toHaveLength(1);

      const article = articles[0] as Record<string, unknown>;
      expect(article.id).toBe("art-1");
      expect(article.headline).toBe("Test Headline");
      expect(article.slug).toBe("test-headline");
      expect(article.teaser).toBe("A short teaser");
      expect(article.publicationDate).toBe("2026-01-15T10:00:00Z");
      expect(article.updatedAt).toBe("2026-01-16T12:00:00Z");
      expect(article.readingTimeMinutes).toBe(5);
      expect(article.isPremium).toBe(false);
      expect(article.isLive).toBe(true);
      expect(article.isFeatured).toBe(true);
      expect(article.isBreaking).toBe(false);
      expect(article.aiSummary).toBe("AI summary text");
      expect(article.region).toBe("berlin");
      expect(article.tags).toEqual(["berlin", "news"]);

      // Category
      const category = article.category as Record<string, unknown>;
      expect(category.id).toBe("cat-1");
      expect(category.name).toBe("Politik");
      expect(category.slug).toBe("politik");

      // Author
      const author = article.author as Record<string, unknown>;
      expect(author.id).toBe("auth-1");
      expect(author.name).toBe("Max Muster");
      expect(author.slug).toBe("max-muster");
    });
  });

  describe("fetchArticleBySlug", () => {
    it("queries with where[slug][equals] parameter", async () => {
      const doc = makeArticleDoc({ slug: "my-article" });
      mockSafeFetch.mockReturnValue(mockJsonResponse({ docs: [doc] }));

      const article = await payloadAdapter.fetchArticleBySlug("my-article");
      expect(article).not.toBeNull();

      const callUrl = mockSafeFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain("where[slug][equals]=my-article");
      expect(callUrl).toContain("limit=1");
    });

    it("returns null when no document is found", async () => {
      mockSafeFetch.mockReturnValue(mockJsonResponse({ docs: [] }));

      const article = await payloadAdapter.fetchArticleBySlug("nonexistent");
      expect(article).toBeNull();
    });
  });

  describe("searchArticlesByQuery", () => {
    it("queries with where[or] for headline and teaser", async () => {
      const doc = makeArticleDoc({ headline: "Berlin News" });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const results = await payloadAdapter.searchArticlesByQuery("Berlin");
      expect(results).toHaveLength(1);

      const callUrl = mockSafeFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain("where[or][0][headline][like]=Berlin");
      expect(callUrl).toContain("where[or][1][teaser][like]=Berlin");
    });

    it("encodes special characters in the query", async () => {
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [], totalPages: 1 }),
      );

      await payloadAdapter.searchArticlesByQuery("Berlin & Brandenburg");

      const callUrl = mockSafeFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain(encodeURIComponent("Berlin & Brandenburg"));
    });
  });

  describe("fetchAllCategories", () => {
    it("maps category fields correctly", async () => {
      const catDoc = {
        id: "cat-1",
        name: "Politik",
        slug: "politik",
        description: "Politische Nachrichten",
        color: "#ff0000",
      };
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [catDoc], totalPages: 1 }),
      );

      const categories = await payloadAdapter.fetchAllCategories();
      expect(categories).toHaveLength(1);

      const cat = categories[0] as Record<string, unknown>;
      expect(cat.id).toBe("cat-1");
      expect(cat.name).toBe("Politik");
      expect(cat.slug).toBe("politik");
      expect(cat.description).toBe("Politische Nachrichten");
      expect(cat.color).toBe("#ff0000");
    });
  });

  describe("fetchNewsticker", () => {
    it("returns empty array on error (non-essential)", async () => {
      mockSafeFetch.mockRejectedValue(new Error("Network error"));

      const result = await payloadAdapter.fetchNewsticker();
      expect(result).toEqual([]);
    });

    it("maps newsticker documents correctly", async () => {
      const tickerDoc = {
        id: "tick-1",
        headline: "Eilmeldung",
        text: "Breaking text",
        createdAt: "2026-01-15T10:00:00Z",
        url: "https://example.com/news",
      };
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [tickerDoc], totalPages: 1 }),
      );

      const result = await payloadAdapter.fetchNewsticker();
      expect(result).toHaveLength(1);

      const ticker = result[0] as Record<string, unknown>;
      expect(ticker.id).toBe("tick-1");
      expect(ticker.headline).toBe("Eilmeldung");
      expect(ticker.text).toBe("Breaking text");
      expect(ticker.url).toBe("https://example.com/news");
    });
  });

  /* -------- URL resolution -------- */

  describe("URL resolution", () => {
    it("prefixes relative image URLs with the base URL", async () => {
      const doc = makeArticleDoc({
        image: {
          url: "/media/photo.jpg",
          alt: "Photo",
          width: 800,
          height: 600,
        },
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      const image = article.image as Record<string, unknown>;
      expect(image.fallbackSrc).toBe("http://localhost:3000/media/photo.jpg");
    });

    it("leaves absolute image URLs unchanged", async () => {
      const doc = makeArticleDoc({
        image: {
          url: "https://cdn.example.com/photo.jpg",
          alt: "CDN Photo",
          width: 800,
          height: 600,
        },
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      const image = article.image as Record<string, unknown>;
      expect(image.fallbackSrc).toBe("https://cdn.example.com/photo.jpg");
    });

    it("prefixes relative author avatar URLs with the base URL", async () => {
      const doc = makeArticleDoc({
        author: {
          id: "auth-1",
          name: "Test Author",
          slug: "test-author",
          avatar: { url: "/media/avatar.png" },
        },
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      const author = article.author as Record<string, unknown>;
      expect(author.avatar).toBe("http://localhost:3000/media/avatar.png");
    });
  });

  /* -------- Auth headers -------- */

  describe("authentication", () => {
    it("includes users API-Key header when PAYLOAD_API_KEY is set", async () => {
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [], totalPages: 1 }),
      );

      await payloadAdapter.fetchAllArticles();

      const callOptions = mockSafeFetch.mock.calls[0][1] as Record<
        string,
        unknown
      >;
      const headers = callOptions.headers as Record<string, string>;
      expect(headers["Authorization"]).toBe("users API-Key test-api-key");
      expect(headers["Accept"]).toBe("application/json");
    });
  });

  /* -------- Additional adapter methods -------- */

  describe("fetchArticleSlugs", () => {
    it("returns slug and updatedAt for each article", async () => {
      const doc = makeArticleDoc({
        slug: "slug-1",
        updatedAt: "2026-01-16T12:00:00Z",
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const slugs = await payloadAdapter.fetchArticleSlugs();
      expect(slugs).toHaveLength(1);

      const entry = slugs[0] as Record<string, unknown>;
      expect(entry.slug).toBe("slug-1");
      expect(entry.updatedAt).toBe("2026-01-16T12:00:00Z");
    });
  });

  describe("fetchArticlesByCategory", () => {
    it("queries with category.slug filter", async () => {
      const doc = makeArticleDoc();
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchArticlesByCategory("politik");

      const callUrl = mockSafeFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain("where[category.slug][equals]=politik");
    });
  });

  describe("fetchNavigation", () => {
    it("returns items from the navigation document", async () => {
      const navDoc = {
        items: [
          { label: "Home", url: "/" },
          { label: "Politik", url: "/politik" },
        ],
      };
      mockSafeFetch.mockReturnValue(mockJsonResponse({ docs: [navDoc] }));

      const nav = (await payloadAdapter.fetchNavigation()) as Record<
        string,
        unknown
      >;
      const items = nav.items as unknown[];
      expect(items).toHaveLength(2);
    });

    it("returns empty items when no navigation document exists", async () => {
      mockSafeFetch.mockReturnValue(mockJsonResponse({ docs: [] }));

      const nav = (await payloadAdapter.fetchNavigation()) as Record<
        string,
        unknown
      >;
      expect(nav.items).toEqual([]);
    });
  });

  describe("fetchBreakingNews", () => {
    it("maps breaking news fields correctly", async () => {
      const breakingDoc = {
        id: "bn-1",
        headline: "Eilmeldung",
        text: "Details hier",
        url: "/breaking/1",
        severity: "high",
        createdAt: "2026-01-15T10:00:00Z",
      };
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [breakingDoc], totalPages: 1 }),
      );

      const result = await payloadAdapter.fetchBreakingNews();
      expect(result).toHaveLength(1);

      const news = result[0] as Record<string, unknown>;
      expect(news.id).toBe("bn-1");
      expect(news.headline).toBe("Eilmeldung");
      expect(news.severity).toBe("high");
    });
  });

  /* -------- Edge cases -------- */

  describe("edge cases", () => {
    it("handles missing category gracefully", async () => {
      const doc = makeArticleDoc({ category: null });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      const category = article.category as Record<string, unknown>;
      expect(category.id).toBe("");
      expect(category.name).toBe("");
      expect(category.slug).toBe("");
    });

    it("handles missing author gracefully", async () => {
      const doc = makeArticleDoc({ author: null });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      const author = article.author as Record<string, unknown>;
      expect(author.id).toBe("");
      expect(author.name).toBe("");
      expect(author.avatar).toBe("");
    });

    it("handles object tags with name property", async () => {
      const doc = makeArticleDoc({
        tags: [{ name: "berlin" }, { tag: "news" }],
      });
      mockSafeFetch.mockReturnValue(
        mockJsonResponse({ docs: [doc], totalPages: 1 }),
      );

      const articles = await payloadAdapter.fetchAllArticles();
      const article = articles[0] as Record<string, unknown>;
      expect(article.tags).toEqual(["berlin", "news"]);
    });

    it("adapter name is payload", () => {
      expect(payloadAdapter.name).toBe("payload");
    });
  });
});
