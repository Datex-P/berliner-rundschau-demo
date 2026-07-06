import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CategoryLoading from "../loading";

describe("CategoryLoading", () => {
  it("rendert Loading-Indikator mit status-Rolle", () => {
    render(<CategoryLoading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("zeigt Kategorie-spezifischen Ladetext", () => {
    render(<CategoryLoading />);
    expect(screen.getByText(/Kategorie wird geladen/)).toBeInTheDocument();
  });

  it("hat aria-live für Screen Reader", () => {
    render(<CategoryLoading />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });
});
