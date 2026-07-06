import type { CmsAdapter } from "./types";
import {
  fetchAllArticles,
  fetchArticleBySlug,
  fetchArticlesByCategory,
  searchArticlesByQuery,
  fetchArticleSlugs,
  fetchAllCategories,
  fetchCategoryBySlug,
  fetchAllAuthors,
  fetchAuthorBySlug,
  fetchArticlesByAuthor,
  fetchNewsticker,
  fetchVideos,
  fetchNavigation,
  fetchSiteConfig,
  fetchBreakingNews,
  fetchQuiz,
  fetchStockData,
} from "@/lib/mock";

const mockAdapter: CmsAdapter = {
  name: "mock",
  async fetchAllArticles() { return fetchAllArticles(); },
  async fetchArticleBySlug(slug) { return fetchArticleBySlug(slug); },
  async fetchArticlesByCategory(slug) { return fetchArticlesByCategory(slug); },
  async searchArticlesByQuery(query) { return searchArticlesByQuery(query); },
  async fetchArticleSlugs() { return fetchArticleSlugs(); },
  async fetchAllCategories() { return fetchAllCategories(); },
  async fetchCategoryBySlug(slug) { return fetchCategoryBySlug(slug); },
  async fetchAllAuthors() { return fetchAllAuthors(); },
  async fetchAuthorBySlug(slug) { return fetchAuthorBySlug(slug); },
  async fetchArticlesByAuthor(slug) { return fetchArticlesByAuthor(slug); },
  async fetchNewsticker() { return fetchNewsticker(); },
  async fetchVideos() { return fetchVideos(); },
  async fetchNavigation() { return fetchNavigation(); },
  async fetchSiteConfig() { return fetchSiteConfig(); },
  async fetchBreakingNews() { return fetchBreakingNews(); },
  async fetchQuiz() { return fetchQuiz(); },
  async fetchStockData() { return fetchStockData(); },
};

export default mockAdapter;
