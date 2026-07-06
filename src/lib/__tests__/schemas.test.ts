import { describe, it, expect } from "vitest";
import { slugSchema, searchQuerySchema, revalidateSchema } from "@/lib/schemas";

describe("slugSchema", () => {
  it("accepts valid lowercase slugs", () => {
    expect(slugSchema.safeParse("berlin-mitte").success).toBe(true);
    expect(slugSchema.safeParse("artikel-123").success).toBe(true);
    expect(slugSchema.safeParse("a").success).toBe(true);
  });

  it("rejects uppercase characters", () => {
    const result = slugSchema.safeParse("Berlin-Mitte");
    expect(result.success).toBe(false);
  });

  it("rejects special characters and spaces", () => {
    expect(slugSchema.safeParse("berlin mitte").success).toBe(false);
    expect(slugSchema.safeParse("berlin_mitte").success).toBe(false);
    expect(slugSchema.safeParse("berlin/mitte").success).toBe(false);
    expect(slugSchema.safeParse("ärtikel").success).toBe(false);
  });

  it("rejects strings exceeding 200 characters", () => {
    const longSlug = "a".repeat(201);
    expect(slugSchema.safeParse(longSlug).success).toBe(false);
  });

  it("accepts a string of exactly 200 characters", () => {
    const maxSlug = "a".repeat(200);
    expect(slugSchema.safeParse(maxSlug).success).toBe(true);
  });

  it("rejects empty string", () => {
    expect(slugSchema.safeParse("").success).toBe(false);
  });

  it("rejects non-string types", () => {
    expect(slugSchema.safeParse(42).success).toBe(false);
    expect(slugSchema.safeParse(null).success).toBe(false);
  });
});

describe("searchQuerySchema", () => {
  it("accepts valid search queries", () => {
    const result = searchQuerySchema.safeParse({ q: "Berlin" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("Berlin");
    }
  });

  it("rejects empty search query", () => {
    expect(searchQuerySchema.safeParse({ q: "" }).success).toBe(false);
  });

  it("rejects missing q field", () => {
    expect(searchQuerySchema.safeParse({}).success).toBe(false);
  });

  it("rejects query exceeding 200 characters", () => {
    const longQuery = "a".repeat(201);
    expect(searchQuerySchema.safeParse({ q: longQuery }).success).toBe(false);
  });

  it("accepts query of exactly 200 characters", () => {
    const maxQuery = "a".repeat(200);
    expect(searchQuerySchema.safeParse({ q: maxQuery }).success).toBe(true);
  });
});

describe("revalidateSchema", () => {
  it("accepts valid revalidation input", () => {
    const result = revalidateSchema.safeParse({
      tag: "articles",
      secret: "my-secret",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tag).toBe("articles");
      expect(result.data.secret).toBe("my-secret");
    }
  });

  it("rejects empty tag", () => {
    expect(revalidateSchema.safeParse({ tag: "", secret: "s" }).success).toBe(
      false,
    );
  });

  it("rejects empty secret", () => {
    expect(
      revalidateSchema.safeParse({ tag: "articles", secret: "" }).success,
    ).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(revalidateSchema.safeParse({}).success).toBe(false);
    expect(revalidateSchema.safeParse({ tag: "x" }).success).toBe(false);
    expect(revalidateSchema.safeParse({ secret: "x" }).success).toBe(false);
  });

  it("rejects tag exceeding 128 characters", () => {
    const longTag = "a".repeat(129);
    expect(
      revalidateSchema.safeParse({ tag: longTag, secret: "s" }).success,
    ).toBe(false);
  });
});
