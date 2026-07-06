import { describe, it, expect, vi, afterEach } from "vitest";
import type { Article, NewstickerItem, Video, Quiz, StockData } from "@/types";

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/data", () => ({
  getArticles: vi.fn(),
  getNewstickerItems: vi.fn(),
  getVideos: vi.fn(),
  getQuizData: vi.fn(),
  getStockData: vi.fn(),
}));

const mockArticle: Article = {
  id: "art1",
  headline: "Berliner Mauer Jubiläum",
  slug: "berliner-mauer-jubilaeum",
  teaser: "Die Stadt feiert ein historisches Jubiläum.",
  body: "<p>Inhalt</p>",
  publicationDate: "2026-06-20T10:00:00Z",
  image: {
    alt: "Berliner Mauer",
    fallbackSrc: "/img/mauer.jpg",
    crops: [],
    sizes: [],
  },
  category: { id: "c1", name: "Kultur", slug: "kultur" },
  author: {
    id: "a1",
    name: "Max Mustermann",
    slug: "max-mustermann",
    avatar: "/avatars/max.jpg",
  },
  tags: ["berlin", "kultur"],
  readingTimeMinutes: 5,
  commentCount: 8,
  isPremium: false,
  paywall: "free",
  isLive: false,
  isOpinion: false,
  isFeatured: false,
  isBreaking: false,
  aiSummary: "Jubiläumsfeier",
  region: "Berlin",
  comments: [],
};

const mockFeaturedArticle: Article = {
  ...mockArticle,
  id: "art-feat",
  headline: "Featured: Neue S-Bahn-Linie",
  slug: "neue-s-bahn-linie",
  isFeatured: true,
  commentCount: 25,
};

const mockNewstickerItem: NewstickerItem = {
  id: "n1",
  type: "breaking",
  topic: "Politik",
  headline: {
    label: "Senat beschließt neuen Haushalt",
    href: "/artikel/senat-haushalt",
  },
  publicationDate: "2026-06-28T09:00:00Z",
  isPremium: false,
};

const mockVideo: Video = {
  id: "v1",
  title: "Berlin von oben",
  sources: [{ src: "/videos/berlin.mp4", extension: "mp4" }],
  poster: "/posters/berlin.jpg",
  durationSeconds: 185,
  caption: "Drohnenflug über die Hauptstadt.",
  category: "Panorama",
  publishedAt: "2026-06-25T12:00:00Z",
};

const mockQuiz: Quiz = {
  dailyQuiz: {
    date: "2026-06-28",
    title: "Tagesquiz",
    questions: [
      {
        id: 1,
        question: "Wie viele Bezirke hat Berlin?",
        options: ["10", "12", "14", "16"],
        correctIndex: 1,
        explanation: "Berlin hat 12 Bezirke.",
      },
    ],
  },
  streakRewards: [],
};

const mockStockData: StockData = {
  indices: [
    {
      id: "dax",
      name: "DAX",
      value: 21450.32,
      change: 123.45,
      changePercent: 0.58,
      currency: "EUR",
      sparkline: [21200, 21450],
    },
  ],
  watchlist: [],
  chartData: {},
};

describe("HomePage — metadata", () => {
  it("exportiert statische Metadaten mit Site-Name und Beschreibung", async () => {
    const { metadata } = await import("../page");

    expect(metadata.title).toContain("Berliner Rundschau");
    expect(metadata.description).toBeTruthy();
    expect(metadata.openGraph?.title).toBe("Berliner Rundschau");
  });
});

describe("HomePage — Server Component", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("löst ohne Fehler auf mit vollständigen Daten", async () => {
    const {
      getArticles,
      getNewstickerItems,
      getVideos,
      getQuizData,
      getStockData,
    } = await import("@/lib/data");
    vi.mocked(getArticles).mockResolvedValue([
      mockFeaturedArticle,
      mockArticle,
    ]);
    vi.mocked(getNewstickerItems).mockResolvedValue([mockNewstickerItem]);
    vi.mocked(getVideos).mockResolvedValue([mockVideo]);
    vi.mocked(getQuizData).mockResolvedValue(mockQuiz);
    vi.mocked(getStockData).mockResolvedValue(mockStockData);

    const { default: HomePage } = await import("../page");

    await expect(HomePage()).resolves.toBeDefined();
  });

  it("löst ohne Fehler auf bei leeren Daten", async () => {
    const {
      getArticles,
      getNewstickerItems,
      getVideos,
      getQuizData,
      getStockData,
    } = await import("@/lib/data");
    vi.mocked(getArticles).mockResolvedValue([]);
    vi.mocked(getNewstickerItems).mockResolvedValue([]);
    vi.mocked(getVideos).mockResolvedValue([]);
    vi.mocked(getQuizData).mockResolvedValue(mockQuiz);
    vi.mocked(getStockData).mockResolvedValue(mockStockData);

    const { default: HomePage } = await import("../page");

    await expect(HomePage()).resolves.toBeDefined();
  });

  it("ruft alle Datenquellen parallel ab", async () => {
    const {
      getArticles,
      getNewstickerItems,
      getVideos,
      getQuizData,
      getStockData,
    } = await import("@/lib/data");
    vi.mocked(getArticles).mockResolvedValue([mockArticle]);
    vi.mocked(getNewstickerItems).mockResolvedValue([]);
    vi.mocked(getVideos).mockResolvedValue([]);
    vi.mocked(getQuizData).mockResolvedValue(mockQuiz);
    vi.mocked(getStockData).mockResolvedValue(mockStockData);

    const { default: HomePage } = await import("../page");
    await HomePage();

    expect(getArticles).toHaveBeenCalledOnce();
    expect(getNewstickerItems).toHaveBeenCalledOnce();
    expect(getVideos).toHaveBeenCalledOnce();
    expect(getQuizData).toHaveBeenCalledOnce();
    expect(getStockData).toHaveBeenCalledOnce();
  });

  it("verwendet den ersten Artikel als Featured wenn keiner markiert ist", async () => {
    const {
      getArticles,
      getNewstickerItems,
      getVideos,
      getQuizData,
      getStockData,
    } = await import("@/lib/data");
    const articlesWithoutFeatured = [
      { ...mockArticle, id: "a1", isFeatured: false },
      { ...mockArticle, id: "a2", slug: "zweiter", isFeatured: false },
    ];
    vi.mocked(getArticles).mockResolvedValue(articlesWithoutFeatured);
    vi.mocked(getNewstickerItems).mockResolvedValue([]);
    vi.mocked(getVideos).mockResolvedValue([]);
    vi.mocked(getQuizData).mockResolvedValue(mockQuiz);
    vi.mocked(getStockData).mockResolvedValue(mockStockData);

    const { default: HomePage } = await import("../page");

    await expect(HomePage()).resolves.toBeDefined();
  });
});
