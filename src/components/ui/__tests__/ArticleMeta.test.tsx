import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ArticleMeta from "@/components/ui/ArticleMeta";
import type { ArticleAuthor } from "@/types";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/ui/SafeImage", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock("@/lib/format", () => ({
  formatRelativeDate: () => `Vor 3 Std.`,
  formatReadingTime: (min: number) => `${min} Min. Lesezeit`,
}));

afterEach(() => {
  vi.restoreAllMocks();
});

const author: ArticleAuthor = {
  id: "a1",
  name: "Max Mustermann",
  slug: "max-mustermann",
  avatar: "/avatars/max.jpg",
};

describe("ArticleMeta", () => {
  it("rendert Autorenname als Link zur Autorenseite", () => {
    render(
      <ArticleMeta author={author} publicationDate="2026-06-01T10:00:00Z" />,
    );

    const link = screen.getByRole("link", { name: "Max Mustermann" });
    expect(link).toHaveAttribute("href", "/autor/max-mustermann");
  });

  it("zeigt Avatar im Default-Variant", () => {
    render(
      <ArticleMeta author={author} publicationDate="2026-06-01T10:00:00Z" />,
    );

    expect(
      screen.getByRole("img", { name: "Max Mustermann" }),
    ).toBeInTheDocument();
  });

  it("versteckt Avatar im Light-Variant", () => {
    render(
      <ArticleMeta
        author={author}
        publicationDate="2026-06-01T10:00:00Z"
        variant="light"
      />,
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("zeigt formatiertes Datum in einem time-Element", () => {
    render(
      <ArticleMeta author={author} publicationDate="2026-06-01T10:00:00Z" />,
    );

    const time = screen.getByText("Vor 3 Std.");
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute("datetime", "2026-06-01T10:00:00Z");
  });

  it("zeigt Lesezeit wenn readingTimeMinutes angegeben", () => {
    render(
      <ArticleMeta
        author={author}
        publicationDate="2026-06-01T10:00:00Z"
        readingTimeMinutes={5}
      />,
    );

    expect(screen.getByText("5 Min. Lesezeit")).toBeInTheDocument();
  });

  it("versteckt Lesezeit wenn readingTimeMinutes 0 oder nicht gesetzt", () => {
    const { rerender } = render(
      <ArticleMeta author={author} publicationDate="2026-06-01T10:00:00Z" />,
    );
    expect(screen.queryByText(/Lesezeit/)).not.toBeInTheDocument();

    rerender(
      <ArticleMeta
        author={author}
        publicationDate="2026-06-01T10:00:00Z"
        readingTimeMinutes={0}
      />,
    );
    expect(screen.queryByText(/Lesezeit/)).not.toBeInTheDocument();
  });
});
