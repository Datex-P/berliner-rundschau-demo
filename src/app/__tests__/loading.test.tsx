import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Loading from "../loading";

describe("Loading (Root)", () => {
  it("rendert Loading-Indikator mit status-Rolle", () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("zeigt Standard-Ladetext", () => {
    render(<Loading />);
    expect(screen.getByText(/Inhalt wird geladen/)).toBeInTheDocument();
  });

  it("hat aria-live für Screen Reader", () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });
});
