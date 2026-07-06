import { describe, it, expect, vi, afterEach } from "vitest";
import type { Category, Article } from "@/types";

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/data", () => ({
  getCategoryBySlug: vi.fn(),
  getArticlesByCategory: vi.fn(),
  getCategories: vi.fn(),
}));

const mockCategory: Category = {
  id: "c1",
  name: "Politik",
  slug: "politik",
  path: "/kategorie/politik",
  description: "Aktuelle politische Nachrichten aus Berlin.",
  color: "#b91c1c",
  children: [],
  articleCount: 5,
};

const mockArticle: Article = {
  id: "art1",
  headline: "Koalitionsverhandlungen in Berlin",
  slug: "koalitionsverhandlungen-berlin",
  teaser: "Die Parteien verhandeln über eine neue Koalition.",
  body: "<p>Inhalt</p>",
  publicationDate: "2026-06-15T08:00:00Z",
  image: {
    alt: "Bundestag",
    fallbackSrc: "/img/bundestag.jpg",
    crops: [],
    sizes: [],
  },
  category: { id: "c1", name: "Politik", slug: "politik" },
  author: {
    id: "a1",
    name: "Anna Schmidt",
    slug: "anna-schmidt",
    avatar: "/avatars/anna.jpg",
  },
  tags: ["berlin", "politik"],
  readingTimeMinutes: 4,
  commentCount: 12,
  isPremium: false,
  paywall: "free",
  isLive: false,
  isOpinion: false,
  isFeatured: false,
  isBreaking: false,
  aiSummary: "Zusammenfassung der Verhandlungen",
  region: "Berlin",
  comments: [],
};

describe("CategoryPage — generateMetadata", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("gibt Kategorie-Metadaten zurück wenn Kategorie existiert", async () => {
    const { getCategoryBySlug } = await import("@/lib/data");
    vi.mocked(getCategoryBySlug).mockResolvedValue(mockCategory);

    const { generateMetadata } = await import("../page");
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "politik" }),
    });

    expect(meta.title).toBe("Politik");
    expect(meta.description).toBe(
      "Aktuelle politische Nachrichten aus Berlin.",
    );
    expect(meta.openGraph?.title).toContain("Politik");
  });

  it("nutzt Fallback-Beschreibung wenn Kategorie keine hat", async () => {
    const { getCategoryBySlug } = await import("@/lib/data");
    const categoryWithoutDesc = { ...mockCategory, description: "" };
    vi.mocked(getCategoryBySlug).mockResolvedValue(categoryWithoutDesc);

    const { generateMetadata } = await import("../page");
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "politik" }),
    });

    expect(meta.description).toBe("Alle Artikel in Politik");
    expect(meta.openGraph?.description).toBe("Alle Artikel in Politik");
  });

  it("gibt Fallback-Titel zurück wenn Kategorie nicht existiert", async () => {
    const { getCategoryBySlug } = await import("@/lib/data");
    vi.mocked(getCategoryBySlug).mockResolvedValue(null);

    const { generateMetadata } = await import("../page");
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "unbekannt" }),
    });

    expect(meta.title).toBe("Kategorie nicht gefunden");
  });
});

describe("CategoryPage — generateStaticParams", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("gibt Slug-Array für alle Kategorien zurück", async () => {
    const { getCategories } = await import("@/lib/data");
    vi.mocked(getCategories).mockResolvedValue([
      mockCategory,
      {
        ...mockCategory,
        id: "c2",
        slug: "wirtschaft",
        name: "Wirtschaft",
        path: "/kategorie/wirtschaft",
      },
    ]);

    const { generateStaticParams } = await import("../page");
    const params = await generateStaticParams();

    expect(params).toEqual([{ slug: "politik" }, { slug: "wirtschaft" }]);
    expect(params).toHaveLength(2);
  });
});

describe("CategoryPage — Server Component", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("ruft notFound() auf wenn Kategorie nicht existiert", async () => {
    const { getCategoryBySlug, getArticlesByCategory } =
      await import("@/lib/data");
    vi.mocked(getCategoryBySlug).mockResolvedValue(null);
    vi.mocked(getArticlesByCategory).mockResolvedValue([]);

    const { default: CategoryPage } = await import("../page");

    await expect(
      CategoryPage({ params: Promise.resolve({ slug: "unbekannt" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("löst ohne Fehler auf wenn Kategorie und Artikel existieren", async () => {
    const { getCategoryBySlug, getArticlesByCategory } =
      await import("@/lib/data");
    vi.mocked(getCategoryBySlug).mockResolvedValue(mockCategory);
    vi.mocked(getArticlesByCategory).mockResolvedValue([
      mockArticle,
      {
        ...mockArticle,
        id: "art2",
        slug: "artikel-zwei",
        headline: "Zweiter Artikel",
      },
    ]);

    const { default: CategoryPage } = await import("../page");

    await expect(
      CategoryPage({ params: Promise.resolve({ slug: "politik" }) }),
    ).resolves.toBeDefined();
  });

  it("löst ohne Fehler auf bei leerer Artikelliste", async () => {
    const { getCategoryBySlug, getArticlesByCategory } =
      await import("@/lib/data");
    vi.mocked(getCategoryBySlug).mockResolvedValue(mockCategory);
    vi.mocked(getArticlesByCategory).mockResolvedValue([]);

    const { default: CategoryPage } = await import("../page");

    await expect(
      CategoryPage({ params: Promise.resolve({ slug: "politik" }) }),
    ).resolves.toBeDefined();
  });

  it("ruft Daten parallel ab mit Promise.all", async () => {
    const { getCategoryBySlug, getArticlesByCategory } =
      await import("@/lib/data");
    vi.mocked(getCategoryBySlug).mockResolvedValue(mockCategory);
    vi.mocked(getArticlesByCategory).mockResolvedValue([mockArticle]);

    const { default: CategoryPage } = await import("../page");
    await CategoryPage({ params: Promise.resolve({ slug: "politik" }) });

    expect(getCategoryBySlug).toHaveBeenCalledWith("politik");
    expect(getArticlesByCategory).toHaveBeenCalledWith("politik");
  });
});
