import { describe, it, expect, vi, afterEach } from "vitest";
import type { Article } from "@/types";

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/data", () => ({
  getArticles: vi.fn(),
}));

function createArticle(overrides: Partial<Article> = {}): Article {
  return {
    id: "art1",
    headline: "Testartikel Überschrift",
    slug: "testartikel",
    teaser: "Ein Teaser-Text.",
    body: "<p>Body</p>",
    publicationDate: "2026-06-01T10:00:00Z",
    image: { alt: "Bild", fallbackSrc: "/img/f.jpg", crops: [], sizes: [] },
    category: { id: "c1", name: "Politik", slug: "politik" },
    author: {
      id: "a1",
      name: "Max Mustermann",
      slug: "max-mustermann",
      avatar: "/a.jpg",
    },
    tags: ["test"],
    readingTimeMinutes: 3,
    commentCount: 0,
    isPremium: false,
    paywall: "free",
    isLive: false,
    isOpinion: false,
    isFeatured: false,
    isBreaking: false,
    aiSummary: "Zusammenfassung",
    region: "Berlin",
    comments: [],
    ...overrides,
  };
}

describe("GET /feed.xml", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("gibt valides RSS-XML mit Content-Type zurück", async () => {
    const { getArticles } = await import("@/lib/data");
    vi.mocked(getArticles).mockResolvedValue([createArticle()]);

    const { GET } = await import("../route");
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/xml; charset=utf-8",
    );

    const xml = await response.text();
    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain("<rss");
    expect(xml).toContain("Berliner Rundschau");
  });

  it("enthält Artikel-Daten im Feed", async () => {
    const { getArticles } = await import("@/lib/data");
    vi.mocked(getArticles).mockResolvedValue([
      createArticle({
        headline: "Breaking News Berlin",
        slug: "breaking-berlin",
      }),
    ]);

    const { GET } = await import("../route");
    const response = await GET();
    const xml = await response.text();

    expect(xml).toContain("Breaking News Berlin");
    expect(xml).toContain("/artikel/breaking-berlin");
    expect(xml).toContain("<dc:creator>Max Mustermann</dc:creator>");
    expect(xml).toContain("<category>Politik</category>");
  });

  it("begrenzt auf maximal 20 Artikel", async () => {
    const { getArticles } = await import("@/lib/data");
    const articles = Array.from({ length: 25 }, (_, i) =>
      createArticle({
        id: `art${i}`,
        slug: `artikel-${i}`,
        headline: `Artikel ${i}`,
      }),
    );
    vi.mocked(getArticles).mockResolvedValue(articles);

    const { GET } = await import("../route");
    const response = await GET();
    const xml = await response.text();

    const itemCount = (xml.match(/<item>/g) ?? []).length;
    expect(itemCount).toBe(20);
  });

  it("setzt Cache-Control-Header", async () => {
    const { getArticles } = await import("@/lib/data");
    vi.mocked(getArticles).mockResolvedValue([]);

    const { GET } = await import("../route");
    const response = await GET();

    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=3600, s-maxage=3600",
    );
  });

  it("gibt leeren Feed ohne Fehler zurück wenn keine Artikel", async () => {
    const { getArticles } = await import("@/lib/data");
    vi.mocked(getArticles).mockResolvedValue([]);

    const { GET } = await import("../route");
    const response = await GET();
    const xml = await response.text();

    expect(response.status).toBe(200);
    expect(xml).toContain("<channel>");
    expect(xml).not.toContain("<item>");
  });
});
