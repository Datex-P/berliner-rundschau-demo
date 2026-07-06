import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchClient from "@/components/SearchClient";
import type { Article } from "@/types";

vi.mock("@/components/ArticleCard", () => ({
  default: ({
    article,
    headingLevel,
  }: {
    article: Article;
    headingLevel: string;
  }) => (
    <div data-testid={`article-${article.id}`}>
      <span>{article.headline}</span>
      <span>{headingLevel}</span>
    </div>
  ),
}));

vi.mock("@/components/ErrorState", () => ({
  default: ({
    message,
    onRetry,
  }: {
    message: string;
    onRetry?: () => void;
  }) => (
    <div role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Erneut versuchen
        </button>
      )}
    </div>
  ),
}));

vi.mock("@/components/LoadingSpinner", () => ({
  default: ({ label }: { label: string }) => (
    <div role="status" aria-live="polite">
      {label}
    </div>
  ),
}));

const mockArticle = (id: string, headline: string): Article => ({
  id,
  headline,
  slug: `article-${id}`,
  teaser: `Teaser for ${headline}`,
  body: "",
  publicationDate: "2026-01-15T10:00:00Z",
  image: {
    alt: "Test",
    fallbackSrc: "/test.jpg",
    crops: [],
    sizes: [],
  },
  category: { id: "cat1", name: "Politik", slug: "politik" },
  author: { id: "a1", name: "Max Müller", slug: "max-mueller", avatar: "" },
  tags: [],
  readingTimeMinutes: 3,
  commentCount: 0,
  isPremium: false,
  paywall: "free",
  isLive: false,
  isOpinion: false,
  isFeatured: false,
  isBreaking: false,
  aiSummary: "",
  region: "Berlin",
  comments: [],
});

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("SearchClient", () => {
  it("rendert das Suchformular mit Label", () => {
    render(<SearchClient />);

    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "Suchbegriff eingeben" }),
    ).toBeInTheDocument();
  });

  it("zeigt Hinweis bei weniger als 2 Zeichen", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SearchClient />);

    await user.type(
      screen.getByRole("searchbox", { name: "Suchbegriff eingeben" }),
      "a",
    );

    expect(
      screen.getByText("Bitte mindestens 2 Zeichen eingeben."),
    ).toBeInTheDocument();
  });

  it("führt Suche durch und zeigt Ergebnisse", async () => {
    const articles = [
      mockArticle("1", "Berlin wächst"),
      mockArticle("2", "Berlin feiert"),
    ];
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(articles), { status: 200 }),
    );

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SearchClient />);

    await user.type(
      screen.getByRole("searchbox", { name: "Suchbegriff eingeben" }),
      "Berlin",
    );

    await vi.advanceTimersByTimeAsync(350);

    expect(await screen.findByText("Berlin wächst")).toBeInTheDocument();
    expect(screen.getByText("Berlin feiert")).toBeInTheDocument();
    expect(
      screen.getAllByText(/2/)[0].closest("[aria-live]"),
    ).toBeInTheDocument();
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("zeigt Fehlermeldung bei fehlgeschlagener Suche", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 500 }),
    );

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SearchClient />);

    await user.type(
      screen.getByRole("searchbox", { name: "Suchbegriff eingeben" }),
      "test query",
    );

    await vi.advanceTimersByTimeAsync(350);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText("Die Suche konnte nicht durchgeführt werden."),
    ).toBeInTheDocument();
  });

  it("zeigt 'Keine Ergebnisse' bei leerer Antwort", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SearchClient />);

    await user.type(
      screen.getByRole("searchbox", { name: "Suchbegriff eingeben" }),
      "xyz",
    );

    await vi.advanceTimersByTimeAsync(350);

    await waitFor(() => {
      expect(screen.getByText(/Keine Ergebnisse/)).toBeInTheDocument();
    });
  });

  it("zeigt Retry-Button bei Fehler und ermöglicht erneute Suche", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify([mockArticle("1", "Ergebnis")]), {
          status: 200,
        }),
      );

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SearchClient />);

    await user.type(
      screen.getByRole("searchbox", { name: "Suchbegriff eingeben" }),
      "test",
    );

    await vi.advanceTimersByTimeAsync(350);

    const retryButton = await screen.findByRole("button", {
      name: "Erneut versuchen",
    });
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);

    expect(await screen.findByText("Ergebnis")).toBeInTheDocument();
  });
});
