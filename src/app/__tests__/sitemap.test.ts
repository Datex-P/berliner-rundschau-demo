import { describe, it, expect, vi, afterEach } from "vitest";
import type { Article, Category } from "@/types";

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

vi.mock("server-only", () => ({}));

const mockArticles: Partial<Article>[] = [
  {
    slug: "berlin-marathon",
    updatedAt: "2026-06-20T10:00:00Z",
    publicationDate: "2026-06-15T08:00:00Z",
    isFeatured: true,
  },
  {
    slug: "bundestag-debatte",
    publicationDate: "2026-06-10T12:00:00Z",
    isFeatured: false,
  },
];

const mockCategories: Partial<Category>[] = [
  { slug: "politik" },
  { slug: "sport" },
];

const mockArticleSlugs = mockArticles.map((a) => ({
  slug: a.slug!,
  modified: a.updatedAt ?? a.publicationDate ?? "",
}));

vi.mock("@/lib/data", () => ({
  getArticles: vi.fn(() => Promise.resolve(mockArticles)),
  getArticleSlugs: vi.fn(() => Promise.resolve(mockArticleSlugs)),
  getCategories: vi.fn(() => Promise.resolve(mockCategories)),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("sitemap", () => {
  it("enthaelt die Homepage mit hoechster Prioritaet", async () => {
    const sitemap = (await import("@/app/sitemap")).default;
    const result = await sitemap();
    const home = result.find((e) => e.url === "https://berliner-rundschau.de");
    expect(home).toBeDefined();
    expect(home!.priority).toBe(1.0);
    expect(home!.changeFrequency).toBe("hourly");
  });

  it("enthaelt die Suchseite mit niedriger Prioritaet", async () => {
    const sitemap = (await import("@/app/sitemap")).default;
    const result = await sitemap();
    const search = result.find(
      (e) => e.url === "https://berliner-rundschau.de/suche",
    );
    expect(search).toBeDefined();
    expect(search!.priority).toBe(0.3);
  });

  it("generiert Artikel-Eintraege mit korrekten URLs und Prioritaeten", async () => {
    const sitemap = (await import("@/app/sitemap")).default;
    const result = await sitemap();

    const featured = result.find((e) =>
      e.url.includes("/artikel/berlin-marathon"),
    );
    expect(featured).toBeDefined();
    expect(featured!.priority).toBe(0.7);
    expect(featured!.lastModified).toBe("2026-06-20T10:00:00Z");

    const regular = result.find((e) =>
      e.url.includes("/artikel/bundestag-debatte"),
    );
    expect(regular).toBeDefined();
    expect(regular!.priority).toBe(0.7);
  });

  it("nutzt updatedAt statt publicationDate wenn vorhanden", async () => {
    const sitemap = (await import("@/app/sitemap")).default;
    const result = await sitemap();
    const article = result.find((e) =>
      e.url.includes("/artikel/berlin-marathon"),
    );
    expect(article!.lastModified).toBe("2026-06-20T10:00:00Z");
  });

  it("faellt auf publicationDate zurueck wenn updatedAt fehlt", async () => {
    const sitemap = (await import("@/app/sitemap")).default;
    const result = await sitemap();
    const article = result.find((e) =>
      e.url.includes("/artikel/bundestag-debatte"),
    );
    expect(article!.lastModified).toBe("2026-06-10T12:00:00Z");
  });

  it("generiert Kategorie-Eintraege", async () => {
    const sitemap = (await import("@/app/sitemap")).default;
    const result = await sitemap();
    const politik = result.find((e) => e.url.includes("/kategorie/politik"));
    expect(politik).toBeDefined();
    expect(politik!.priority).toBe(0.6);

    const sport = result.find((e) => e.url.includes("/kategorie/sport"));
    expect(sport).toBeDefined();
  });
});
