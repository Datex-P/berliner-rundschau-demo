import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Vitest laeuft aus dem Projekt-Root — import.meta.url ist unter jsdom
// keine file://-URL, deshalb Aufloesung ueber process.cwd()
const layoutSource = readFileSync(
  join(process.cwd(), "src", "app", "layout.tsx"),
  "utf-8",
);

describe("RootLayout (Quelltext-Vertrag)", () => {
  it("exportiert Metadata (metadata oder generateMetadata)", () => {
    expect(layoutSource).toMatch(
      /export\s+(const\s+metadata|async\s+function\s+generateMetadata|function\s+generateMetadata)/,
    );
  });

  it("setzt das lang-Attribut auf dem html-Element", () => {
    expect(layoutSource).toMatch(/<html[\s\S]{0,300}?\blang=/);
  });

  it("lang-Wert passt zur Projekt-Locale", () => {
    // Literaler lang-Wert MUSS dem Locale-Prefix entsprechen; bei dynamischem
    // Wert (lang={...}) greift nur der Praesenz-Test oben.
    const literalLang = layoutSource.match(/\blang="([a-z]{2})/);
    const expected = "de-DE".slice(0, 2);
    expect(literalLang === null || literalLang[1] === expected).toBe(true);
  });

  it("rendert den SkipLink aus dem Scaffold", () => {
    expect(layoutSource).toContain("<SkipLink");
  });
});
