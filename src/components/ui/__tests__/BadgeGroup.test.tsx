import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import BadgeGroup from "@/components/ui/BadgeGroup";
import type { ArticleCategory } from "@/types";

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

afterEach(() => {
  vi.restoreAllMocks();
});

const category: ArticleCategory = {
  id: "c1",
  name: "Politik",
  slug: "politik",
};

describe("BadgeGroup", () => {
  it("rendert nichts wenn keine Badges aktiv", () => {
    const { container } = render(<BadgeGroup />);
    expect(container.firstChild).toBeNull();
  });

  it("zeigt Eilmeldung-Badge mit pulsierendem Indikator", () => {
    render(<BadgeGroup isBreaking />);

    expect(screen.getByText("Eilmeldung")).toBeInTheDocument();
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("zeigt Kategorie als Link zur Kategorieseite", () => {
    render(<BadgeGroup category={category} />);

    const link = screen.getByRole("link", { name: "Politik" });
    expect(link).toHaveAttribute("href", "/kategorie/politik");
  });

  it("zeigt Premium-Badge mit Schloss-Icon", () => {
    render(<BadgeGroup isPremium />);

    expect(screen.getByText("Premium")).toBeInTheDocument();
  });

  it("zeigt Kommentar-Badge für Meinungsbeiträge", () => {
    render(<BadgeGroup isOpinion />);

    expect(screen.getByText("Kommentar")).toBeInTheDocument();
  });

  it("rendert alle Badges gleichzeitig in korrekter Reihenfolge", () => {
    render(<BadgeGroup isBreaking category={category} isPremium isOpinion />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent("Eilmeldung");
    expect(items[1]).toHaveTextContent("Politik");
    expect(items[2]).toHaveTextContent("Premium");
    expect(items[3]).toHaveTextContent("Kommentar");
  });
});
