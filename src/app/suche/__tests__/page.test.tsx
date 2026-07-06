import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SearchPage from "@/app/suche/page";

vi.mock("@/components/SearchClient", () => ({
  default: () => <div data-testid="search-client">SearchClient</div>,
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SearchPage", () => {
  it("rendert die Suchseiten-Ueberschrift", () => {
    render(<SearchPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Suche" }),
    ).toBeInTheDocument();
  });

  it("bindet die SearchClient-Komponente ein", () => {
    render(<SearchPage />);
    expect(screen.getByText("SearchClient")).toBeInTheDocument();
  });

  it("hat korrekte Seitenstruktur mit Heading und Suchbereich", () => {
    render(<SearchPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Suche");
    expect(heading.parentElement).toBeInTheDocument();
  });
});
