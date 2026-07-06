export interface CmsAdapter {
  readonly name: string;
  fetchAllArticles(): Promise<unknown[]>;
  fetchArticleBySlug(slug: string): Promise<unknown | null>;
  fetchArticlesByCategory(categorySlug: string): Promise<unknown[]>;
  searchArticlesByQuery(query: string): Promise<unknown[]>;
  fetchArticleSlugs(): Promise<unknown[]>;
  fetchAllCategories(): Promise<unknown[]>;
  fetchCategoryBySlug(slug: string): Promise<unknown | null>;
  fetchAllAuthors(): Promise<unknown[]>;
  fetchAuthorBySlug(slug: string): Promise<unknown | null>;
  fetchArticlesByAuthor(authorSlug: string): Promise<unknown[]>;
  fetchNewsticker(): Promise<unknown[]>;
  fetchVideos(): Promise<unknown[]>;
  fetchNavigation(): Promise<unknown>;
  fetchSiteConfig(): Promise<unknown>;
  fetchBreakingNews(): Promise<unknown[]>;
  fetchQuiz(): Promise<unknown>;
  fetchStockData(): Promise<unknown>;
}
