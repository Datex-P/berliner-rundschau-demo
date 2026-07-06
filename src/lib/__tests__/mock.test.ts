import { describe, it, expect } from "vitest";
import {
  fetchAllArticles,
  fetchArticleBySlug,
  fetchArticlesByCategory,
  fetchAllCategories,
  fetchCategoryBySlug,
  fetchAllAuthors,
  fetchAuthorBySlug,
  fetchArticlesByAuthor,
  fetchNewsticker,
  fetchVideos,
  fetchNavigation,
  fetchSiteConfig,
  searchArticlesByQuery,
  fetchBreakingNews,
  fetchQuiz,
  fetchStockData,
  fetchArticleSlugs,
} from "@/lib/mock";

describe("fetchAllArticles", () => {
  it("gibt ein Array von Artikeln zurück", () => {
    const articles = fetchAllArticles();
    expect(articles.length).toBeGreaterThan(0);
    expect(articles[0]).toHaveProperty("headline");
    expect(articles[0]).toHaveProperty("slug");
    expect(articles[0]).toHaveProperty("category");
  });

  it("gibt eine Kopie zurück, keine Referenz", () => {
    const a = fetchAllArticles();
    const b = fetchAllArticles();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

describe("fetchArticleBySlug", () => {
  it("findet einen Artikel per Slug", () => {
    const article = fetchArticleBySlug("berlins-neue-verkehrsstrategie");
    expect(article).not.toBeNull();
    expect(article!.headline).toContain("Verkehrsstrategie");
  });

  it("gibt null zurück für unbekannten Slug", () => {
    expect(fetchArticleBySlug("nicht-vorhanden")).toBeNull();
  });
});

describe("fetchArticlesByCategory", () => {
  it("filtert Artikel nach Kategorie-Slug", () => {
    const articles = fetchArticlesByCategory("politik");
    expect(articles.length).toBeGreaterThan(0);
    articles.forEach((a) => {
      expect(a.category.slug).toBe("politik");
    });
  });

  it("gibt leeres Array für unbekannte Kategorie zurück", () => {
    expect(fetchArticlesByCategory("xyz")).toEqual([]);
  });
});

describe("fetchAllCategories", () => {
  it("gibt alle Kategorien mit Pflichtfeldern zurück", () => {
    const categories = fetchAllCategories();
    expect(categories.length).toBeGreaterThan(0);
    categories.forEach((c) => {
      expect(c).toHaveProperty("id");
      expect(c).toHaveProperty("name");
      expect(c).toHaveProperty("slug");
      expect(c).toHaveProperty("path");
    });
  });
});

describe("fetchCategoryBySlug", () => {
  it("findet Kategorie per Slug", () => {
    const cat = fetchCategoryBySlug("wirtschaft");
    expect(cat).not.toBeNull();
    expect(cat!.name).toBe("Wirtschaft");
  });

  it("gibt null zurück für unbekannten Slug", () => {
    expect(fetchCategoryBySlug("unbekannt")).toBeNull();
  });
});

describe("fetchAllAuthors", () => {
  it("gibt Autoren mit Bio und Rolle zurück", () => {
    const authors = fetchAllAuthors();
    expect(authors.length).toBeGreaterThan(0);
    authors.forEach((a) => {
      expect(a.name).toBeTruthy();
      expect(a.bio).toBeTruthy();
      expect(a.role).toBeTruthy();
    });
  });
});

describe("fetchAuthorBySlug", () => {
  it("findet Autor per Slug", () => {
    const author = fetchAuthorBySlug("anna-schmidt");
    expect(author).not.toBeNull();
    expect(author!.name).toBe("Anna Schmidt");
  });

  it("gibt null zurück für unbekannten Slug", () => {
    expect(fetchAuthorBySlug("unbekannt")).toBeNull();
  });
});

describe("fetchArticlesByAuthor", () => {
  it("filtert Artikel nach Autor-Slug", () => {
    const articles = fetchArticlesByAuthor("anna-schmidt");
    expect(articles.length).toBeGreaterThan(0);
    articles.forEach((a) => {
      expect(a.author.slug).toBe("anna-schmidt");
    });
  });

  it("gibt leeres Array für unbekannten Autor zurück", () => {
    expect(fetchArticlesByAuthor("xyz")).toEqual([]);
  });
});

describe("fetchNewsticker", () => {
  it("gibt Newsticker-Items mit headline-Objekten zurück", () => {
    const items = fetchNewsticker();
    expect(items.length).toBeGreaterThan(0);
    items.forEach((item) => {
      expect(item.headline).toHaveProperty("label");
      expect(item.headline).toHaveProperty("href");
    });
  });
});

describe("fetchVideos", () => {
  it("gibt Videos mit Sources und Poster zurück", () => {
    const videos = fetchVideos();
    expect(videos.length).toBeGreaterThan(0);
    videos.forEach((v) => {
      expect(v.sources.length).toBeGreaterThan(0);
      expect(v.poster).toBeTruthy();
      expect(v.durationSeconds).toBeGreaterThan(0);
    });
  });
});

describe("fetchNavigation", () => {
  it("gibt Navigation mit primary- und footer-Menü zurück", () => {
    const nav = fetchNavigation();
    expect(nav.primaryMenu.length).toBeGreaterThan(0);
    expect(nav.footerMenu.length).toBeGreaterThan(0);
    expect(nav.socialLinks.length).toBeGreaterThan(0);
  });

  it("enthält korrekte MenuReference-Struktur", () => {
    const nav = fetchNavigation();
    const firstItem = nav.primaryMenu[0];
    expect(firstItem.reference).toHaveProperty("type");
    expect(firstItem.reference).toHaveProperty("href");
    expect(firstItem.reference).toHaveProperty("label");
  });
});

describe("fetchSiteConfig", () => {
  it("gibt SiteConfig mit allen Pflichtfeldern zurück", () => {
    const config = fetchSiteConfig();
    expect(config.title).toBe("Berliner Rundschau");
    expect(config.language).toBe("de-DE");
    expect(config.url).toContain("berliner-rundschau");
    expect(config.socialLinks.length).toBeGreaterThan(0);
  });
});

describe("searchArticlesByQuery", () => {
  it("findet Artikel per Headline", () => {
    const results = searchArticlesByQuery("Verkehrsstrategie");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].headline).toContain("Verkehrsstrategie");
  });

  it("findet Artikel per Tag", () => {
    const results = searchArticlesByQuery("BVG");
    expect(results.length).toBeGreaterThan(0);
  });

  it("sucht case-insensitive", () => {
    const upper = searchArticlesByQuery("VERKEHR");
    const lower = searchArticlesByQuery("verkehr");
    expect(upper.length).toBe(lower.length);
  });

  it("gibt leeres Array für keine Treffer zurück", () => {
    expect(searchArticlesByQuery("xyznonexistent")).toEqual([]);
  });
});

describe("fetchBreakingNews", () => {
  it("gibt Breaking News mit severity zurück", () => {
    const news = fetchBreakingNews();
    expect(news.length).toBeGreaterThan(0);
    news.forEach((n) => {
      expect(["breaking", "alert"]).toContain(n.severity);
      expect(n.headline).toBeTruthy();
    });
  });
});

describe("fetchQuiz", () => {
  it("gibt Quiz mit Fragen und Rewards zurück", () => {
    const quiz = fetchQuiz();
    expect(quiz.dailyQuiz.questions.length).toBeGreaterThan(0);
    expect(quiz.streakRewards.length).toBeGreaterThan(0);
    quiz.dailyQuiz.questions.forEach((q) => {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.correctIndex).toBeLessThan(q.options.length);
    });
  });
});

describe("fetchStockData", () => {
  it("gibt Indices und Watchlist zurück", () => {
    const data = fetchStockData();
    expect(data.indices.length).toBeGreaterThan(0);
    expect(data.watchlist.length).toBeGreaterThan(0);
    data.indices.forEach((idx) => {
      expect(idx.name).toBeTruthy();
      expect(typeof idx.value).toBe("number");
    });
  });
});

describe("fetchArticleSlugs", () => {
  it("gibt Slugs mit modified-Datum zurück", () => {
    const slugs = fetchArticleSlugs();
    expect(slugs.length).toBeGreaterThan(0);
    slugs.forEach((s) => {
      expect(s.slug).toBeTruthy();
      expect(s.modified).toBeTruthy();
    });
  });

  it("verwendet updatedAt wenn vorhanden, sonst publicationDate", () => {
    const slugs = fetchArticleSlugs();
    const first = slugs[0];
    expect(first.modified).toBeTruthy();
    expect(new Date(first.modified).getTime()).not.toBeNaN();
  });
});
