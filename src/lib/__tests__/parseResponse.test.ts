import { describe, it, expect } from "vitest";
import {
  parseArticle,
  parseArticlesResponse,
  parseCategory,
  parseCategoriesResponse,
  parseAuthor,
} from "@/lib/parseResponse";

describe("parseArticle", () => {
  it("parses a complete article record", () => {
    const raw = {
      id: "42",
      headline: "Testüberschrift",
      slug: "test-slug",
      teaser: "Kurzer Teaser",
      body: "<p>Inhalt</p>",
      publicationDate: "2026-06-01T10:00:00Z",
      updatedAt: "2026-06-02T12:00:00Z",
      image: { alt: "Bild", fallbackSrc: "/img.jpg", crops: [], sizes: [] },
      category: { id: "c1", name: "Politik", slug: "politik" },
      author: { id: "a1", name: "Max", slug: "max", avatar: "/a.jpg" },
      tags: ["berlin", "politik"],
      readingTimeMinutes: 5,
      commentCount: 12,
      isPremium: true,
      paywall: "paid" as const,
      isLive: true,
      isOpinion: false,
      isFeatured: true,
      isBreaking: false,
      seoTitle: "SEO Titel",
      seoDescription: "SEO Beschreibung",
      source: "dpa",
      aiSummary: "KI Zusammenfassung",
      region: "Berlin-Mitte",
      comments: [
        { id: 1, author: "Leser", text: "Gut", date: "2026-06-01", likes: 3 },
      ],
    };

    const result = parseArticle(raw);

    expect(result.id).toBe("42");
    expect(result.headline).toBe("Testüberschrift");
    expect(result.slug).toBe("test-slug");
    expect(result.isPremium).toBe(true);
    expect(result.paywall).toBe("paid");
    expect(result.readingTimeMinutes).toBe(5);
    expect(result.tags).toEqual(["berlin", "politik"]);
    expect(result.seoTitle).toBe("SEO Titel");
    expect(result.source).toBe("dpa");
    expect(result.comments).toHaveLength(1);
  });

  it("coerces missing fields to safe defaults", () => {
    const result = parseArticle({});

    expect(result.id).toBe("");
    expect(result.headline).toBe("");
    expect(result.slug).toBe("");
    expect(result.tags).toEqual([]);
    expect(result.readingTimeMinutes).toBe(0);
    expect(result.commentCount).toBe(0);
    expect(result.isPremium).toBe(false);
    expect(result.paywall).toBe("free");
    expect(result.isLive).toBe(false);
    expect(result.updatedAt).toBeUndefined();
    expect(result.seoTitle).toBeUndefined();
    expect(result.source).toBeUndefined();
    expect(result.comments).toEqual([]);
    expect(result.aiSummary).toBe("");
    expect(result.region).toBe("");
  });

  it("coerces string-encoded booleans for isPremium", () => {
    const result = parseArticle({ isPremium: "true" });
    expect(result.isPremium).toBe(true);

    const resultFalse = parseArticle({ isPremium: "false" });
    expect(resultFalse.isPremium).toBe(false);
  });

  it("coerces non-array tags to empty array", () => {
    const result = parseArticle({ tags: "not-an-array" });
    expect(result.tags).toEqual([]);
  });

  it("coerces numeric fields from strings", () => {
    const result = parseArticle({ readingTimeMinutes: "7", commentCount: "3" });
    expect(result.readingTimeMinutes).toBe(7);
    expect(result.commentCount).toBe(3);
  });
});

describe("parseArticlesResponse", () => {
  it("parses an array of raw articles", () => {
    const data = [
      { id: "1", headline: "Artikel 1", slug: "a1" },
      { id: "2", headline: "Artikel 2", slug: "a2" },
    ];

    const result = parseArticlesResponse(data);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("1");
    expect(result[1].headline).toBe("Artikel 2");
  });

  it("returns empty array for non-array input", () => {
    expect(parseArticlesResponse(null)).toEqual([]);
    expect(parseArticlesResponse("string")).toEqual([]);
    expect(parseArticlesResponse(42)).toEqual([]);
    expect(parseArticlesResponse(undefined)).toEqual([]);
  });
});

describe("parseCategory", () => {
  it("parses a complete category record", () => {
    const raw = {
      id: "c1",
      name: "Politik",
      slug: "politik",
      path: "/politik",
      description: "Politische Nachrichten",
      color: "#ff0000",
      children: [
        {
          id: "c2",
          name: "Bundestag",
          slug: "bundestag",
          path: "/politik/bundestag",
          description: "",
        },
      ],
      articleCount: 42,
    };

    const result = parseCategory(raw);

    expect(result.id).toBe("c1");
    expect(result.name).toBe("Politik");
    expect(result.slug).toBe("politik");
    expect(result.path).toBe("/politik");
    expect(result.color).toBe("#ff0000");
    expect(result.children).toHaveLength(1);
    expect(result.articleCount).toBe(42);
  });

  it("coerces missing fields to safe defaults", () => {
    const result = parseCategory({});

    expect(result.id).toBe("");
    expect(result.name).toBe("");
    expect(result.slug).toBe("");
    expect(result.children).toEqual([]);
    expect(result.articleCount).toBe(0);
  });
});

describe("parseCategoriesResponse", () => {
  it("parses an array of raw categories", () => {
    const data = [
      { id: "c1", name: "Politik", slug: "politik" },
      { id: "c2", name: "Sport", slug: "sport" },
    ];

    const result = parseCategoriesResponse(data);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Politik");
    expect(result[1].slug).toBe("sport");
  });

  it("returns empty array for non-array input", () => {
    expect(parseCategoriesResponse(null)).toEqual([]);
    expect(parseCategoriesResponse({})).toEqual([]);
  });
});

describe("parseAuthor", () => {
  it("parses a complete author record", () => {
    const raw = {
      id: "a1",
      name: "Maria Schmidt",
      slug: "maria-schmidt",
      avatar: "/avatars/maria.jpg",
      bio: "Politikredakteurin seit 2020",
      role: "Redakteurin",
      socialLinks: { twitter: "@maria", linkedin: "maria-s" },
    };

    const result = parseAuthor(raw);

    expect(result.id).toBe("a1");
    expect(result.name).toBe("Maria Schmidt");
    expect(result.slug).toBe("maria-schmidt");
    expect(result.bio).toBe("Politikredakteurin seit 2020");
    expect(result.role).toBe("Redakteurin");
    expect(result.socialLinks).toEqual({
      twitter: "@maria",
      linkedin: "maria-s",
    });
  });

  it("coerces missing fields to safe defaults", () => {
    const result = parseAuthor({});

    expect(result.id).toBe("");
    expect(result.name).toBe("");
    expect(result.slug).toBe("");
    expect(result.avatar).toBe("");
    expect(result.bio).toBe("");
    expect(result.role).toBe("");
  });
});
