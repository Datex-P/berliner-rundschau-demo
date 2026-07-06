import { vi, describe, it, expect, afterEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

const mockArticles = [
  { id: "1", slug: "test-article", headline: "Testartikel" },
];
const mockCategories = [{ id: "c1", slug: "politik", name: "Politik" }];
const mockAuthors = [
  { id: "a1", slug: "max-mustermann", name: "Max Mustermann" },
];

vi.mock("../mock", () => ({
  fetchAllArticles: vi.fn(() => Promise.resolve(mockArticles)),
  fetchArticleBySlug: vi.fn((slug: string) =>
    Promise.resolve(slug === "test-article" ? mockArticles[0] : null),
  ),
  fetchArticlesByCategory: vi.fn(() => Promise.resolve(mockArticles)),
  fetchAllCategories: vi.fn(() => Promise.resolve(mockCategories)),
  fetchCategoryBySlug: vi.fn((slug: string) =>
    Promise.resolve(slug === "politik" ? mockCategories[0] : null),
  ),
  fetchAllAuthors: vi.fn(() => Promise.resolve(mockAuthors)),
  fetchAuthorBySlug: vi.fn((slug: string) =>
    Promise.resolve(slug === "max-mustermann" ? mockAuthors[0] : null),
  ),
  fetchArticlesByAuthor: vi.fn(() => Promise.resolve(mockArticles)),
  fetchBreakingNews: vi.fn(() => Promise.resolve([])),
  fetchNewsticker: vi.fn(() => Promise.resolve([])),
  fetchQuiz: vi.fn(() =>
    Promise.resolve({
      dailyQuiz: { date: "2026-06-28", title: "Quiz", questions: [] },
      streakRewards: [],
    }),
  ),
  fetchStockData: vi.fn(() =>
    Promise.resolve({ indices: [], watchlist: [], chartData: {} }),
  ),
  fetchVideos: vi.fn(() => Promise.resolve([])),
  fetchNavigation: vi.fn(() =>
    Promise.resolve({ primaryMenu: [], footerMenu: [], socialLinks: [] }),
  ),
  fetchSiteConfig: vi.fn(() =>
    Promise.resolve({
      title: "Test",
      description: "Test",
      url: "https://test.de",
      language: "de",
      tags: [],
      socialLinks: [],
      analytics: { gtmId: "" },
    }),
  ),
  searchArticlesByQuery: vi.fn(() => Promise.resolve(mockArticles)),
  fetchArticleSlugs: vi.fn(() =>
    Promise.resolve([{ slug: "test-article", modified: "2026-06-28" }]),
  ),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Data Access Layer", () => {
  describe("getArticles", () => {
    it("gibt alle Artikel zurück", async () => {
      const { getArticles } = await import("../data");
      const articles = await getArticles();

      expect(articles).toHaveLength(1);
      expect(articles[0].slug).toBe("test-article");
    });
  });

  describe("getArticleBySlug", () => {
    it("gibt Artikel für gültigen Slug zurück", async () => {
      const { getArticleBySlug } = await import("../data");
      const article = await getArticleBySlug("test-article");

      expect(article).not.toBeNull();
      expect(article?.headline).toBe("Testartikel");
    });

    it("gibt null für unbekannten Slug zurück", async () => {
      const { getArticleBySlug } = await import("../data");
      const article = await getArticleBySlug("non-existent");

      expect(article).toBeNull();
    });
  });

  describe("getArticlesByCategory", () => {
    it("gibt Artikel für Kategorie-Slug zurück", async () => {
      const { getArticlesByCategory } = await import("../data");
      const articles = await getArticlesByCategory("politik");

      expect(articles).toHaveLength(1);
    });
  });

  describe("getCategories", () => {
    it("gibt alle Kategorien zurück", async () => {
      const { getCategories } = await import("../data");
      const categories = await getCategories();

      expect(categories).toHaveLength(1);
      expect(categories[0].name).toBe("Politik");
    });
  });

  describe("getCategoryBySlug", () => {
    it("gibt Kategorie für gültigen Slug zurück", async () => {
      const { getCategoryBySlug } = await import("../data");
      const category = await getCategoryBySlug("politik");

      expect(category).not.toBeNull();
      expect(category?.name).toBe("Politik");
    });

    it("gibt null für unbekannten Slug zurück", async () => {
      const { getCategoryBySlug } = await import("../data");
      const category = await getCategoryBySlug("unknown");

      expect(category).toBeNull();
    });
  });

  describe("getAuthors", () => {
    it("gibt alle Autoren zurück", async () => {
      const { getAuthors } = await import("../data");
      const authors = await getAuthors();

      expect(authors).toHaveLength(1);
      expect(authors[0].name).toBe("Max Mustermann");
    });
  });

  describe("getAuthorBySlug", () => {
    it("gibt Autor für gültigen Slug zurück", async () => {
      const { getAuthorBySlug } = await import("../data");
      const author = await getAuthorBySlug("max-mustermann");

      expect(author).not.toBeNull();
      expect(author?.name).toBe("Max Mustermann");
    });

    it("gibt null für unbekannten Slug zurück", async () => {
      const { getAuthorBySlug } = await import("../data");
      const author = await getAuthorBySlug("nobody");

      expect(author).toBeNull();
    });
  });

  describe("searchArticles", () => {
    it("gibt Suchergebnisse zurück", async () => {
      const { searchArticles } = await import("../data");
      const results = await searchArticles("test");

      expect(results).toHaveLength(1);
    });

    it("beschneidet Query auf maximal 100 Zeichen und normalisiert", async () => {
      const { searchArticlesByQuery } = await import("../mock");
      const { searchArticles } = await import("../data");

      const longQuery = "A".repeat(200);
      await searchArticles(longQuery);

      expect(searchArticlesByQuery).toHaveBeenCalledWith("a".repeat(100));
    });
  });

  describe("getBreakingNewsItems", () => {
    it("gibt Breaking-News-Array zurück", async () => {
      const { getBreakingNewsItems } = await import("../data");
      const news = await getBreakingNewsItems();

      expect(Array.isArray(news)).toBe(true);
    });
  });

  describe("getNewstickerItems", () => {
    it("gibt Newsticker-Array zurück", async () => {
      const { getNewstickerItems } = await import("../data");
      const items = await getNewstickerItems();

      expect(Array.isArray(items)).toBe(true);
    });
  });

  describe("getVideos", () => {
    it("gibt Video-Array zurück", async () => {
      const { getVideos } = await import("../data");
      const videos = await getVideos();

      expect(Array.isArray(videos)).toBe(true);
    });
  });

  describe("getNavigation", () => {
    it("gibt Navigation mit primaryMenu und footerMenu zurück", async () => {
      const { getNavigation } = await import("../data");
      const nav = await getNavigation();

      expect(nav).toHaveProperty("primaryMenu");
      expect(nav).toHaveProperty("footerMenu");
      expect(nav).toHaveProperty("socialLinks");
    });
  });

  describe("getSiteConfig", () => {
    it("gibt SiteConfig mit Pflichtfeldern zurück", async () => {
      const { getSiteConfig } = await import("../data");
      const config = await getSiteConfig();

      expect(config.title).toBe("Test");
      expect(config.url).toBe("https://test.de");
      expect(config).toHaveProperty("analytics");
    });
  });

  describe("getArticleSlugs", () => {
    it("gibt Slug-Array mit modified-Datum zurück", async () => {
      const { getArticleSlugs } = await import("../data");
      const slugs = await getArticleSlugs();

      expect(slugs).toHaveLength(1);
      expect(slugs[0]).toHaveProperty("slug", "test-article");
      expect(slugs[0]).toHaveProperty("modified");
    });
  });

  describe("getQuizData", () => {
    it("gibt Quiz-Daten mit dailyQuiz zurück", async () => {
      const { getQuizData } = await import("../data");
      const quiz = await getQuizData();

      expect(quiz).toHaveProperty("dailyQuiz");
      expect(quiz.dailyQuiz.title).toBe("Quiz");
    });
  });

  describe("getStockData", () => {
    it("gibt Börsendaten mit indices und watchlist zurück", async () => {
      const { getStockData } = await import("../data");
      const stocks = await getStockData();

      expect(stocks).toHaveProperty("indices");
      expect(stocks).toHaveProperty("watchlist");
      expect(stocks).toHaveProperty("chartData");
    });
  });
});
