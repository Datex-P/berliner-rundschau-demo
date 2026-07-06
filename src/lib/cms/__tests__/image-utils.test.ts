import { describe, it, expect } from "vitest";
import { normalizeImage } from "../image-utils";

describe("normalizeImage", () => {
  it("returns empty image for null src", () => {
    const result = normalizeImage(null);
    expect(result.fallbackSrc).toBe("");
    expect(result.crops).toEqual([]);
    expect(result.sizes).toEqual([]);
    expect(result.alt).toBe("");
  });

  it("returns empty image for empty string", () => {
    const result = normalizeImage("  ");
    expect(result.fallbackSrc).toBe("");
    expect(result.crops).toHaveLength(0);
  });

  it("normalizes a valid URL", () => {
    const result = normalizeImage("https://cdn.example.com/photo.jpg", "A photo", 800, 600);
    expect(result.fallbackSrc).toBe("https://cdn.example.com/photo.jpg");
    expect(result.alt).toBe("A photo");
    expect(result.crops).toHaveLength(1);
    expect(result.crops[0].name).toBe("default");
    expect(result.crops[0].srcset[0].imageWidth).toBe("800w");
    expect(result.sizes).toEqual(["(max-width: 768px) 100vw", "800px"]);
  });

  it("defaults imageWidth to 1200w when width not provided", () => {
    const result = normalizeImage("https://cdn.example.com/photo.jpg");
    expect(result.crops[0].srcset[0].imageWidth).toBe("1200w");
  });

  it("defaults alt to empty string", () => {
    const result = normalizeImage("https://cdn.example.com/photo.jpg");
    expect(result.alt).toBe("");
  });
});
