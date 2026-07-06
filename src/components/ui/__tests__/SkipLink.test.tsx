import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, afterEach } from "vitest";
import SkipLink from "@/components/ui/SkipLink";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SkipLink", () => {
  it("rendert einen Link mit Standard-Label", () => {
    render(<SkipLink />);

    expect(
      screen.getByRole("link", { name: "Skip to main content" }),
    ).toBeInTheDocument();
  });

  it("verlinkt auf #main-content als Standard-Ziel", () => {
    render(<SkipLink />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "#main-content");
  });

  it("akzeptiert benutzerdefinierte targetId", () => {
    render(<SkipLink targetId="article-body" />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "#article-body");
  });

  it("akzeptiert benutzerdefiniertes Label fuer Lokalisierung", () => {
    render(<SkipLink label="Zum Inhalt springen" />);

    expect(
      screen.getByRole("link", { name: "Zum Inhalt springen" }),
    ).toBeInTheDocument();
  });

  it("hat die skip-link CSS-Klasse", () => {
    render(<SkipLink />);

    expect(screen.getByRole("link")).toHaveClass("skip-link");
  });

  it("kombiniert targetId und Label korrekt", () => {
    render(<SkipLink targetId="content" label="Direkt zum Inhalt" />);

    const link = screen.getByRole("link", { name: "Direkt zum Inhalt" });
    expect(link).toHaveAttribute("href", "#content");
  });
});
