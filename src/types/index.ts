// Content Types — Berliner Rundschau

export interface Article {
  id: string;
  headline: string;
  slug: string;
  teaser: string;
  body: string;
  publicationDate: string;
  updatedAt?: string;
  image: ArticleImage;
  category: ArticleCategory;
  author: ArticleAuthor;
  tags: string[];
  readingTimeMinutes: number;
  commentCount: number;
  isPremium: boolean;
  paywall: "free" | "paid" | "metered";
  isLive: boolean;
  isOpinion: boolean;
  isFeatured: boolean;
  isBreaking: boolean;
  seoTitle?: string;
  seoDescription?: string;
  source?: string;
  aiSummary: string;
  region: string;
  comments: Comment[];
}

export interface ArticleImage {
  alt: string;
  fallbackSrc: string;
  crops: ImageCrop[];
  sizes: string[];
  caption?: string;
  credit?: string;
}

export interface ImageCrop {
  name: string;
  srcset: SrcsetEntry[];
}

export interface SrcsetEntry {
  src: string;
  imageWidth: string;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ArticleAuthor {
  id: string;
  name: string;
  slug: string;
  avatar: string;
}

export interface Comment {
  id: number;
  author: string;
  text: string;
  date: string;
  likes: number;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  avatar: string;
  bio: string;
  role: string;
  socialLinks?: AuthorSocialLinks;
}

export interface AuthorSocialLinks {
  twitter?: string;
  linkedin?: string;
  website?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  path: string;
  description: string;
  color: string;
  children: CategoryChild[];
  articleCount: number;
}

export interface CategoryChild {
  id: string;
  name: string;
  slug: string;
  path: string;
  description: string;
}

export interface BreakingNews {
  id: string;
  headline: string;
  href: string;
  severity: "breaking" | "alert";
  publishedAt: string;
  expiresAt?: string;
}

export interface NewstickerItem {
  id: string;
  type: string;
  topic: string;
  headline: NewstickerHeadline;
  publicationDate: string;
  isPremium: boolean;
}

export interface NewstickerHeadline {
  label: string;
  href: string;
}

export interface Video {
  id: string;
  title: string;
  sources: VideoSource[];
  poster: string;
  durationSeconds: number;
  caption: string;
  category: string;
  publishedAt: string;
}

export interface VideoSource {
  src: string;
  extension: "m3u8" | "mp4";
}

export interface Navigation {
  primaryMenu: MenuItem[];
  footerMenu: MenuItem[];
  socialLinks: NavSocialLink[];
}

export interface MenuItem {
  reference: MenuReference;
  commercial: boolean;
  children?: MenuItem[];
}

export interface MenuReference {
  type: "SECTION" | "EXTERNAL";
  href: string;
  label: string;
  isActive?: boolean;
}

export interface NavSocialLink {
  platform: string;
  url: string;
  label: string;
}

export interface SiteConfig {
  title: string;
  description: string;
  url: string;
  language: string;
  tags: string[];
  socialLinks: SiteConfigSocialLink[];
  analytics: SiteAnalytics;
}

export interface SiteConfigSocialLink {
  platform: string;
  url: string;
}

export interface SiteAnalytics {
  gtmId: string;
}

export interface Quiz {
  dailyQuiz: DailyQuiz;
  streakRewards: StreakReward[];
}

export interface DailyQuiz {
  date: string;
  title: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StreakReward {
  days: number;
  badge: string;
  emoji: string;
}

export interface StockData {
  indices: StockIndex[];
  watchlist: WatchlistItem[];
  chartData: Record<string, Record<string, number[]>>;
}

export interface StockIndex {
  id: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  currency: string;
  sparkline: number[];
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  pe: number | null;
  sector: string;
}
