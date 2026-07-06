/* eslint-disable @next/next/no-img-element */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ArticleCard from "@/components/ArticleCard";
import type { Article } from "@/types";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/ui/SafeImage", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  ),
}));

vi.mock("@/components/ui/BadgeGroup", () => ({
  default: ({
    category,
    isPremium,
    isBreaking,
  }: {
    category?: { name: string };
    isPremium?: boolean;
    isBreaking?: boolean;
  }) => (
    <div role="group" aria-label="Badges">
      {isBreaking && <span>Eilmeldung</span>}
      {category && <span>{category.name}</span>}
      {isPremium && <span>Premium</span>}
    </div>
  ),
}));

vi.mock("@/components/ui/ArticleMeta", () => ({
  default: ({ author }: { author: { name: string } }) => (
    <span>{author.name}</span>
  ),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

function createArticle(overrides: Partial<Article> = {}): Article {
  return {
    id: "1",
    headline: "Neue U-Bahn-Linie für Berlin",
    slug: "neue-u-bahn-linie",
    teaser: "Die BVG plant eine neue Linie durch Kreuzberg",
    body: "<p>Body</p>",
    publicationDate: "2026-01-15T10:00:00Z",
    image: {
      alt: "U-Bahn Station",
      fallbackSrc: "/images/ubahn.jpg",
      crops: [],
      sizes: [],
    },
    category: { id: "c1", name: "Berlin", slug: "berlin" },
    author: {
      id: "a1",
      name: "Max Mustermann",
      slug: "max-mustermann",
      avatar: "/avatar.jpg",
    },
    tags: [],
    readingTimeMinutes: 4,
    commentCount: 0,
    isPremium: false,
    paywall: "free",
    isLive: true,
    isOpinion: false,
    isFeatured: false,
    isBreaking: false,
    aiSummary: "",
    region: "Berlin",
    comments: [],
    ...overrides,
  };
}

describe("ArticleCard", () => {
  describe("default variant", () => {
    it("rendert Überschrift, Teaser und Kategorie", () => {
      render(<ArticleCard article={createArticle()} />);
      expect(
        screen.getByRole("heading", { name: "Neue U-Bahn-Linie für Berlin" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Die BVG plant eine neue Linie durch Kreuzberg"),
      ).toBeInTheDocument();
      expect(screen.getByText("Berlin")).toBeInTheDocument();
    });

    it("verlinkt auf die Artikel-Detailseite", () => {
      render(<ArticleCard article={createArticle()} />);
      const links = screen
        .getAllByRole("link")
        .filter((l) => l.getAttribute("href") === "/artikel/neue-u-bahn-linie");
      expect(links.length).toBeGreaterThanOrEqual(1);
    });

    it("rendert Artikelbild mit Alt-Text", () => {
      render(<ArticleCard article={createArticle()} />);
      expect(
        screen.getByRole("img", { name: "U-Bahn Station" }),
      ).toBeInTheDocument();
    });

    it("zeigt Autor-Metadaten", () => {
      render(<ArticleCard article={createArticle()} />);
      expect(screen.getByText("Max Mustermann")).toBeInTheDocument();
    });
  });

  describe("hero variant", () => {
    it("rendert Link mit aria-label für die gesamte Karte", () => {
      render(<ArticleCard article={createArticle()} variant="hero" />);
      const link = screen.getByRole("link", {
        name: "Neue U-Bahn-Linie für Berlin",
      });
      expect(link).toHaveAttribute("href", "/artikel/neue-u-bahn-linie");
    });

    it("zeigt Teaser-Text", () => {
      render(<ArticleCard article={createArticle()} variant="hero" />);
      expect(
        screen.getByText("Die BVG plant eine neue Linie durch Kreuzberg"),
      ).toBeInTheDocument();
    });

    it("rendert Überschrift und Kategorie", () => {
      render(<ArticleCard article={createArticle()} variant="hero" />);
      expect(
        screen.getByRole("heading", { name: "Neue U-Bahn-Linie für Berlin" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Berlin")).toBeInTheDocument();
    });
  });

  describe("compact variant", () => {
    it("rendert Überschrift als Link", () => {
      render(<ArticleCard article={createArticle()} variant="compact" />);
      const link = screen.getByRole("link", {
        name: "Neue U-Bahn-Linie für Berlin",
      });
      expect(link).toHaveAttribute("href", "/artikel/neue-u-bahn-linie");
    });

    it("zeigt keinen Teaser-Text", () => {
      render(<ArticleCard article={createArticle()} variant="compact" />);
      expect(
        screen.queryByText("Die BVG plant eine neue Linie durch Kreuzberg"),
      ).not.toBeInTheDocument();
    });

    it("rendert ein Artikelbild", () => {
      render(<ArticleCard article={createArticle()} variant="compact" />);
      expect(
        screen.getByRole("img", { name: "U-Bahn Station" }),
      ).toBeInTheDocument();
    });
  });

  it("nutzt das konfigurierte Heading-Level", () => {
    const { rerender } = render(
      <ArticleCard article={createArticle()} headingLevel="h2" />,
    );
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();

    rerender(<ArticleCard article={createArticle()} headingLevel="h4" />);
    expect(screen.getByRole("heading", { level: 4 })).toBeInTheDocument();
  });

  it("rendert article-Element", () => {
    render(<ArticleCard article={createArticle()} />);
    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  it("zeigt Premium-Badge wenn isPremium", () => {
    render(<ArticleCard article={createArticle({ isPremium: true })} />);
    expect(screen.getByText("Premium")).toBeInTheDocument();
  });

  it("zeigt Eilmeldung-Badge wenn isBreaking", () => {
    render(<ArticleCard article={createArticle({ isBreaking: true })} />);
    expect(screen.getByText("Eilmeldung")).toBeInTheDocument();
  });
});
