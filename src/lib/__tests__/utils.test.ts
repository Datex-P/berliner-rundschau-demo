import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (className merge utility)", () => {
  it("gibt einen leeren String bei keinen Argumenten zurück", () => {
    expect(cn()).toBe("");
  });

  it("gibt eine einzelne Klasse unverändert zurück", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("merged mehrere Klassen", () => {
    const result = cn("px-4", "py-2", "text-sm");
    expect(result).toContain("px-4");
    expect(result).toContain("py-2");
    expect(result).toContain("text-sm");
  });

  it("löst Tailwind-Konflikte zugunsten der letzten Klasse", () => {
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });

  it("löst Farb-Konflikte auf", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("filtert falsy-Werte heraus", () => {
    const result = cn("px-4", false, null, undefined, 0, "py-2");
    expect(result).toContain("px-4");
    expect(result).toContain("py-2");
  });

  it("unterstützt bedingte Klassen via Objekt-Syntax", () => {
    const result = cn("base", { "font-bold": true, "text-red-500": false });
    expect(result).toContain("base");
    expect(result).toContain("font-bold");
    expect(result).not.toContain("text-red-500");
  });

  it("unterstützt Array-Argumente", () => {
    const result = cn(["px-4", "py-2"]);
    expect(result).toContain("px-4");
    expect(result).toContain("py-2");
  });

  it("merged komplexe verschachtelte Inputs", () => {
    const result = cn("px-2", ["py-2", { "font-bold": true }], "px-4");
    expect(result).toBe("py-2 font-bold px-4");
  });
});
