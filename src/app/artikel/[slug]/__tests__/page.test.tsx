/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const nextProps = new Set([
      "priority",
      "fill",
      "loader",
      "placeholder",
      "quality",
      "blurDataURL",
    ]);
    const htmlProps = Object.fromEntries(
      Object.entries(props).filter(([k]) => !nextProps.has(k)),
    );
    return <img {...htmlProps} />;
  },
}));

vi.mock("@/lib/data", () => ({
  getArticleBySlug: vi.fn(),
  getArticles: vi.fn(),
}));

vi.mock("@/lib/json-ld", () => ({
  articleJsonLd: vi.fn(() => ({ "@type": "Article" })),
}));

vi.mock("@/lib/format", () => ({
  formatDate: (iso: string) => iso.slice(0, 10),
}));

vi.mock("@/components/ui/SanitizedHtml", () => ({
  default: function MockSanitizedHtml({
    html,
    className,
  }: {
    html: string;
    className?: string;
  }) {
    return (
      <div
        data-testid="sanitized-html"
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  },
}));

vi.mock("@/components/ui/SafeImage", () => ({
  default: function MockSafeImage({ alt }: { alt: string }) {
    return <img alt={alt} />;
  },
}));

vi.mock("@/components/ui/BadgeGroup", () => ({
  default: function MockBadgeGroup() {
    return <div data-testid="badge-group" />;
  },
}));

vi.mock("@/components/ui/ArticleMeta", () => ({
  default: function MockArticleMeta() {
    return <div data-testid="article-meta" />;
  },
}));

vi.mock("@/components/ui/TagList", () => ({
  default: function MockTagList({ tags }: { tags: string[] }) {
    return <div data-testid="tag-list">{tags.join(", ")}</div>;
  },
}));

import type { Article } from "@/types";

const mockArticle: Article = {
  id: "1",
  headline: "Test-Artikel Überschrift",
  slug: "test-artikel",
  teaser: "Ein Testartikel über Berlin",
  body: "<p>Artikelinhalt</p>",
  publicationDate: "2026-06-28T08:00:00Z",
  image: {
    alt: "Testbild",
    fallbackSrc: "https://example.com/img.jpg",
    crops: [],
    sizes: [],
  },
  category: { id: "c1", name: "Politik", slug: "politik" },
  author: {
    id: "a1",
    name: "Max Mustermann",
    slug: "max-mustermann",
    avatar: "/avatars/max.jpg",
  },
  tags: ["berlin", "test"],
  readingTimeMinutes: 5,
  commentCount: 0,
  isPremium: false,
  paywall: "free" as const,
  isLive: false,
  isOpinion: false,
  isFeatured: false,
  isBreaking: false,
  aiSummary: "",
  region: "Berlin",
  comments: [],
};

describe("ArticlePage", () => {
  beforeEach(async () => {
    const { getArticleBySlug, getArticles } = await import("@/lib/data");
    vi.mocked(getArticleBySlug).mockResolvedValue(mockArticle);
    vi.mocked(getArticles).mockResolvedValue([mockArticle]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rendert die Artikel-Überschrift als h1", async () => {
    const { default: ArticlePage } = await import("../page");
    const Page = await ArticlePage({
      params: Promise.resolve({ slug: "test-artikel" }),
    });
    render(Page);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Test-Artikel Überschrift",
    );
  });

  it("rendert den Teaser-Text", async () => {
    const { default: ArticlePage } = await import("../page");
    const Page = await ArticlePage({
      params: Promise.resolve({ slug: "test-artikel" }),
    });
    render(Page);

    expect(screen.getByText("Ein Testartikel über Berlin")).toBeInTheDocument();
  });

  it("rendert einen Zurück-Link zur Startseite", async () => {
    const { default: ArticlePage } = await import("../page");
    const Page = await ArticlePage({
      params: Promise.resolve({ slug: "test-artikel" }),
    });
    render(Page);

    const backLink = screen.getByRole("link", {
      name: /Zurück zur Startseite/i,
    });
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("ruft notFound() auf wenn Artikel nicht existiert", async () => {
    const { getArticleBySlug } = await import("@/lib/data");
    vi.mocked(getArticleBySlug).mockResolvedValue(null);

    const { default: ArticlePage } = await import("../page");

    await expect(
      ArticlePage({ params: Promise.resolve({ slug: "nicht-vorhanden" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("rendert Tags über die TagList-Komponente", async () => {
    const { default: ArticlePage } = await import("../page");
    const Page = await ArticlePage({
      params: Promise.resolve({ slug: "test-artikel" }),
    });
    render(Page);

    expect(screen.getByTestId("tag-list")).toHaveTextContent("berlin, test");
  });
});

describe("ArticlePage — generateMetadata", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("gibt Artikel-Metadaten zurück wenn Artikel existiert", async () => {
    const { getArticleBySlug } = await import("@/lib/data");
    vi.mocked(getArticleBySlug).mockResolvedValue(mockArticle);

    const { generateMetadata } = await import("../page");
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "test-artikel" }),
    });

    expect(meta.title).toBe("Test-Artikel Überschrift");
    expect(meta.description).toBe("Ein Testartikel über Berlin");
  });

  it("gibt Fallback-Titel zurück wenn Artikel nicht existiert", async () => {
    const { getArticleBySlug } = await import("@/lib/data");
    vi.mocked(getArticleBySlug).mockResolvedValue(null);

    const { generateMetadata } = await import("../page");
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "unbekannt" }),
    });

    expect(meta.title).toBe("Artikel nicht gefunden");
  });
});
