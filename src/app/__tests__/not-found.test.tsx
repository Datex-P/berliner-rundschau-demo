import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "../not-found";

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

describe("NotFound", () => {
  it("zeigt 404 als Überschrift", () => {
    render(<NotFound />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("404");
  });

  it("zeigt eine beschreibende Fehlermeldung", () => {
    render(<NotFound />);

    expect(
      screen.getByText(/Die angeforderte Seite wurde nicht gefunden/),
    ).toBeInTheDocument();
  });

  it("enthält einen Link zur Startseite mit korrektem href und Text", () => {
    render(<NotFound />);

    const link = screen.getByRole("link", { name: /Zur Startseite/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("rendert einen Container mit zentriertem Layout", () => {
    const { container } = render(<NotFound />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
