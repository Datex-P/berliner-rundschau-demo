import type { Article, Category, Author, BreakingNews, NewstickerItem, Video } from "@/types";

export function createMockArticle(overrides?: Partial<Article>): Article {
  return {
    id: "1",
    headline: "Test-Artikel",
    slug: "test-artikel",
    teaser: "Ein Testartikel",
    body: "<p>Inhalt</p>",
    publicationDate: "2026-06-28T08:00:00Z",
    image: { alt: "Testbild", fallbackSrc: "https://example.com/img.jpg", crops: [], sizes: [] },
    category: { id: "c1", name: "Politik", slug: "politik" },
    author: { id: "a1", name: "Max Mustermann", slug: "max-mustermann", avatar: "/avatars/max.jpg" },
    tags: [],
    readingTimeMinutes: 5,
    commentCount: 0,
    isPremium: false,
    paywall: "free",
    isLive: false,
    isOpinion: false,
    isFeatured: false,
    isBreaking: false,
    aiSummary: "",
    region: "Berlin",
    comments: [],
    ...overrides,
  };
}

export function createMockCategory(overrides?: Partial<Category>): Category {
  return {
    id: "c1",
    name: "Politik",
    slug: "politik",
    path: "/kategorie/politik",
    description: "Aktuelle politische Nachrichten aus Berlin.",
    color: "#b91c1c",
    children: [],
    articleCount: 5,
    ...overrides,
  };
}

export function createMockAuthor(overrides?: Partial<Author>): Author {
  return {
    id: "a1",
    name: "Max Mustermann",
    slug: "max-mustermann",
    avatar: "/avatars/max.jpg",
    bio: "Berliner Journalist seit 2010.",
    role: "Redakteur",
    ...overrides,
  };
}

export function createMockBreakingNews(overrides?: Partial<BreakingNews>): BreakingNews {
  return {
    id: "bn-1",
    headline: "Eilmeldung Test",
    href: "/artikel/eilmeldung",
    severity: "breaking",
    publishedAt: "2026-06-28T10:00:00Z",
    ...overrides,
  };
}

export function createMockNewstickerItem(overrides?: Partial<NewstickerItem>): NewstickerItem {
  return {
    id: "nt-1",
    type: "article",
    topic: "Politik",
    headline: { label: "Testmeldung", href: "/artikel/test" },
    publicationDate: "2026-06-28T10:00:00Z",
    isPremium: false,
    ...overrides,
  };
}

export function createMockVideo(overrides?: Partial<Video>): Video {
  return {
    id: "v1",
    title: "Testvideo",
    sources: [{ src: "https://example.com/video.mp4", extension: "mp4" }],
    poster: "https://example.com/poster.jpg",
    durationSeconds: 120,
    caption: "Testvideo-Beschreibung",
    category: "politik",
    publishedAt: "2026-06-28T08:00:00Z",
    ...overrides,
  };
}
