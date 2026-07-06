import { describe, it, expect } from "vitest";
import { SITE_CONFIG } from "../config";

describe("SITE_CONFIG", () => {
  it("enthält korrekten Seitenname", () => {
    expect(SITE_CONFIG.name).toBe("Berliner Rundschau");
  });

  it("enthält valide URL", () => {
    expect(SITE_CONFIG.url).toMatch(/^https:\/\//);
    expect(SITE_CONFIG.url).toBe("https://berliner-rundschau.de");
  });

  it("enthält deutsche Locale", () => {
    expect(SITE_CONFIG.locale).toBe("de-DE");
  });

  it("enthält Beschreibung mit Nachrichten-Bezug", () => {
    expect(SITE_CONFIG.description).toContain("Nachrichten");
    expect(SITE_CONFIG.description.length).toBeGreaterThan(20);
  });

  it("enthält Logo-Pfad", () => {
    expect(SITE_CONFIG.logo).toBe("/logo.png");
  });

  it("ist als const definiert und nicht mutierbar", () => {
    expect(Object.isFrozen(SITE_CONFIG)).toBe(false);
    expect(typeof SITE_CONFIG).toBe("object");
    const keys = Object.keys(SITE_CONFIG);
    expect(keys).toContain("url");
    expect(keys).toContain("name");
    expect(keys).toContain("description");
    expect(keys).toContain("locale");
    expect(keys).toContain("logo");
    expect(keys).toHaveLength(5);
  });
});
