import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ArticleLoading from "../loading";

describe("ArticleLoading", () => {
  it("rendert Loading-Indikator mit status-Rolle", () => {
    render(<ArticleLoading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("zeigt Artikel-spezifischen Ladetext", () => {
    render(<ArticleLoading />);
    expect(screen.getByText(/Artikel wird geladen/)).toBeInTheDocument();
  });

  it("hat aria-live für Screen Reader", () => {
    render(<ArticleLoading />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });
});
