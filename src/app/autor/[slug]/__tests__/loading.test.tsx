import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AuthorLoading from "../loading";

describe("AuthorLoading", () => {
  it("rendert Loading-Indikator mit status-Rolle", () => {
    render(<AuthorLoading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("zeigt Autor-spezifischen Ladetext", () => {
    render(<AuthorLoading />);
    expect(screen.getByText(/Autor wird geladen/)).toBeInTheDocument();
  });

  it("hat aria-live für Screen Reader", () => {
    render(<AuthorLoading />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });
});
