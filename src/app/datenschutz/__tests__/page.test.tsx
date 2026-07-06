import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DatenschutzPage from "../page";

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

describe("DatenschutzPage", () => {
  it("rendert die Hauptüberschrift", () => {
    render(<DatenschutzPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Datenschutzerklärung" }),
    ).toBeInTheDocument();
  });

  it("enthält alle Pflicht-Abschnitte", () => {
    render(<DatenschutzPage />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Verantwortlicher" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Erhebung und Verarbeitung von Daten",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Cookies" }),
    ).toBeInTheDocument();
  });

  it("zeigt den Seitennamen aus SITE_CONFIG", () => {
    render(<DatenschutzPage />);
    expect(screen.getByText("Berliner Rundschau")).toBeInTheDocument();
  });

  it("enthält Informationen zum Cookie-Einsatz", () => {
    render(<DatenschutzPage />);
    expect(
      screen.getByText(/theme-präferenz/i),
    ).toBeInTheDocument();
  });

  it("rendert einen Link zurück zur Startseite", () => {
    render(<DatenschutzPage />);
    const link = screen.getByRole("link", { name: /zurück zur startseite/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("exportiert Metadaten mit korrektem Titel", async () => {
    const { metadata } = await import("../page");
    expect(metadata.title).toBe("Datenschutz");
    expect(metadata.description).toContain("Datenschutzerklärung");
  });
});
