import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingSpinner from "@/components/LoadingSpinner";

describe("LoadingSpinner", () => {
  it("rendert mit Standard-Label", () => {
    render(<LoadingSpinner />);

    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Inhalt wird geladen…")).toBeInTheDocument();
  });

  it("rendert mit benutzerdefiniertem Label", () => {
    render(<LoadingSpinner label="Suche läuft…" />);

    expect(screen.getByText("Suche läuft…")).toBeInTheDocument();
    expect(screen.queryByText("Inhalt wird geladen…")).not.toBeInTheDocument();
  });

  it("versteckt den Spinner-Kreis vor Screenreadern", () => {
    render(<LoadingSpinner />);

    const status = screen.getByRole("status");
    const hiddenSpinner = status.querySelector("[aria-hidden='true']");
    expect(hiddenSpinner).toBeInTheDocument();
  });
});
