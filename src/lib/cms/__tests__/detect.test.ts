import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("../index", () => ({
  loadAdapter: vi.fn(async () => ({
    name: "mock",
    fetchAllArticles: vi.fn(),
    fetchArticleBySlug: vi.fn(),
    fetchArticlesByCategory: vi.fn(),
    searchArticlesByQuery: vi.fn(),
    fetchArticleSlugs: vi.fn(),
    fetchAllCategories: vi.fn(),
    fetchCategoryBySlug: vi.fn(),
    fetchAllAuthors: vi.fn(),
    fetchAuthorBySlug: vi.fn(),
    fetchArticlesByAuthor: vi.fn(),
    fetchNewsticker: vi.fn(),
    fetchVideos: vi.fn(),
    fetchNavigation: vi.fn(),
    fetchSiteConfig: vi.fn(),
    fetchBreakingNews: vi.fn(),
    fetchQuiz: vi.fn(),
    fetchStockData: vi.fn(),
  })),
}));

import { detectAdapter, validateStartupEnv } from "../detect";

describe("detectAdapter", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.CMS_ADAPTER;
    delete process.env.CONTENTFUL_SPACE_ID;
    delete process.env.CONTENTFUL_ACCESS_TOKEN;
    delete process.env.STORYBLOK_ACCESS_TOKEN;
    delete process.env.DATOCMS_API_TOKEN;
    delete process.env.SANITY_PROJECT_ID;
  });

  it("returns explicit CMS_ADAPTER value", () => {
    process.env.CMS_ADAPTER = "contentful";
    expect(detectAdapter()).toBe("contentful");
  });

  it("lowercases CMS_ADAPTER", () => {
    process.env.CMS_ADAPTER = "CONTENTFUL";
    expect(detectAdapter()).toBe("contentful");
  });

  it("auto-detects contentful", () => {
    process.env.CONTENTFUL_SPACE_ID = "abc";
    expect(detectAdapter()).toBe("contentful");
  });

  it("auto-detects sanity", () => {
    process.env.SANITY_PROJECT_ID = "xyz";
    expect(detectAdapter()).toBe("sanity");
  });

  it("returns mock when no CMS vars set", () => {
    expect(detectAdapter()).toBe("mock");
  });

  it("throws on multiple CMS var sets without explicit adapter", () => {
    process.env.CONTENTFUL_SPACE_ID = "abc";
    process.env.STORYBLOK_ACCESS_TOKEN = "xyz";
    expect(() => detectAdapter()).toThrow("Multiple CMS env var sets");
  });
});

describe("validateStartupEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.CONTENTFUL_SPACE_ID;
    delete process.env.CONTENTFUL_ACCESS_TOKEN;
  });

  it("passes for unknown adapter", () => {
    expect(() => validateStartupEnv("custom")).not.toThrow();
  });

  it("passes when all required vars present", () => {
    process.env.CONTENTFUL_SPACE_ID = "abc";
    process.env.CONTENTFUL_ACCESS_TOKEN = "token";
    expect(() => validateStartupEnv("contentful")).not.toThrow();
  });

  it("throws when partial vars are set", () => {
    process.env.CONTENTFUL_SPACE_ID = "abc";
    expect(() => validateStartupEnv("contentful")).toThrow("is missing");
  });
});
