import type {
  Navigation,
  SiteConfig,
  Quiz,
  StockData,
  BreakingNews,
  NewstickerItem,
  Video,
} from "@/types";

export const defaultNavigation: Navigation = {
  primaryMenu: [],
  footerMenu: [],
  socialLinks: [],
};

export const defaultSiteConfig: SiteConfig = {
  title: "Berliner Rundschau",
  description: "",
  url: "",
  language: "de",
  tags: [],
  socialLinks: [],
  analytics: { gtmId: "" },
};

export const defaultQuiz: Quiz = {
  dailyQuiz: { date: "", title: "", questions: [] },
  streakRewards: [],
};

export const defaultStockData: StockData = {
  indices: [],
  watchlist: [],
  chartData: {},
};

export const defaultBreakingNews: BreakingNews[] = [];
export const defaultNewsticker: NewstickerItem[] = [];
export const defaultVideos: Video[] = [];
