import { describe, it, expect, vi, afterEach } from "vitest";
import type { Author } from "@/types";

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/data", () => ({
  getAuthorBySlug: vi.fn(),
  getArticlesByAuthorSlug: vi.fn(),
  getAuthors: vi.fn(),
}));

const mockAuthor: Author = {
  id: "a1",
  name: "Max Mustermann",
  slug: "max-mustermann",
  avatar: "/avatars/max.jpg",
  bio: "Berliner Journalist seit 2010.",
  role: "Chefredakteur",
  socialLinks: {
    twitter: "https://x.com/maxm",
    linkedin: "https://linkedin.com/in/maxm",
    website: "https://max.de",
  },
};

describe("AuthorPage — generateMetadata", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("gibt Autor-Metadaten zurück wenn Autor existiert", async () => {
    const { getAuthorBySlug } = await import("@/lib/data");
    vi.mocked(getAuthorBySlug).mockResolvedValue(mockAuthor);

    const { generateMetadata } = await import("../page");
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "max-mustermann" }),
    });

    expect(meta.title).toBe("Max Mustermann");
    expect(meta.description).toBe("Berliner Journalist seit 2010.");
    expect(meta.openGraph?.title).toContain("Max Mustermann");
  });

  it("gibt Fallback-Titel zurück wenn Autor nicht existiert", async () => {
    const { getAuthorBySlug } = await import("@/lib/data");
    vi.mocked(getAuthorBySlug).mockResolvedValue(null);

    const { generateMetadata } = await import("../page");
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "unbekannt" }),
    });

    expect(meta.title).toBe("Autor nicht gefunden");
  });
});

describe("AuthorPage — generateStaticParams", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("gibt Slug-Array für alle Autoren zurück", async () => {
    const { getAuthors } = await import("@/lib/data");
    vi.mocked(getAuthors).mockResolvedValue([
      mockAuthor,
      { ...mockAuthor, id: "a2", slug: "anna-schmidt", name: "Anna Schmidt" },
    ]);

    const { generateStaticParams } = await import("../page");
    const params = await generateStaticParams();

    expect(params).toEqual([
      { slug: "max-mustermann" },
      { slug: "anna-schmidt" },
    ]);
    expect(params).toHaveLength(2);
  });
});

describe("AuthorPage — Server Component (notFound)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("ruft notFound() auf wenn Autor nicht existiert", async () => {
    const { getAuthorBySlug, getArticlesByAuthorSlug } =
      await import("@/lib/data");
    vi.mocked(getAuthorBySlug).mockResolvedValue(null);
    vi.mocked(getArticlesByAuthorSlug).mockResolvedValue([]);

    const { default: AuthorPage } = await import("../page");

    await expect(
      AuthorPage({ params: Promise.resolve({ slug: "unbekannt" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
