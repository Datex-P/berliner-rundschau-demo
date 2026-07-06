import { describe, it, expect } from "vitest";
import { colors } from "@/lib/design-tokens";

describe("design-tokens", () => {
  describe("colors", () => {
    it("enthält light- und dark-Mode Farben als CSS Custom Properties", () => {
      expect(colors.light.primary).toBe("var(--color-primary)");
      expect(colors.light.onPrimary).toBe("var(--color-on-primary)");
      expect(colors.light.accent).toBe("var(--color-accent)");
      expect(colors.dark.background).toBe("var(--color-bg)");
      expect(colors.dark.text).toBe("var(--color-text)");
    });

    it("definiert alle erforderlichen light-Farben", () => {
      expect(colors.light).toHaveProperty("primary");
      expect(colors.light).toHaveProperty("onPrimary");
      expect(colors.light).toHaveProperty("secondary");
      expect(colors.light).toHaveProperty("accent");
      expect(colors.light).toHaveProperty("background");
      expect(colors.light).toHaveProperty("text");
    });

    it("verwendet CSS Custom Property Referenzen", () => {
      const varPattern = /^var\(--[\w-]+\)$/;
      Object.values(colors.light).forEach((color) => {
        expect(color).toMatch(varPattern);
      });
      Object.values(colors.dark).forEach((color) => {
        expect(color).toMatch(varPattern);
      });
    });
  });
});
