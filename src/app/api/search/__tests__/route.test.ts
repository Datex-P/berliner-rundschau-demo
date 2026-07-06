import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/schemas", async () => {
  const { z } = await import("zod");
  return {
    searchQuerySchema: z.object({
      q: z.string().min(1).max(200),
    }),
  };
});

const mockArticle = {
  id: "1",
  headline: "Berlins neue Verkehrsstrategie",
  teaser: "Die Hauptstadt plant Änderungen.",
  slug: "berlins-neue-verkehrsstrategie",
  body: "<p>Geheimer Premium-Body-Inhalt</p>",
  category: { id: "cat-1", name: "Politik", slug: "politik" },
  publicationDate: "2026-06-28T08:00:00Z",
  image: {
    alt: "Straßenbahn",
    fallbackSrc: "https://picsum.photos/seed/traffic/1200/675",
  },
  author: { id: "author-1", name: "Anna Schmidt", slug: "anna-schmidt" },
  readingTimeMinutes: 5,
  isPremium: true,
  tags: ["Verkehr", "Berlin"],
  commentCount: 2,
  paywall: "free",
  isLive: false,
  isOpinion: false,
  isFeatured: true,
  isBreaking: false,
  aiSummary: "Zusammenfassung",
  region: "berlin",
  comments: [],
};

vi.mock("@/lib/data", () => ({
  searchArticles: vi.fn(async () => [mockArticle]),
}));

import { GET } from "../route";

function makeSearchRequest(query: string): Request {
  return new Request(
    `http://localhost/api/search?q=${encodeURIComponent(query)}`,
  );
}

describe("GET /api/search", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("gibt Suchergebnisse mit Safe-Projection zurück", async () => {
    const res = await GET(makeSearchRequest("Berlin") as never);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].headline).toBe("Berlins neue Verkehrsstrategie");
    expect(data[0].slug).toBe("berlins-neue-verkehrsstrategie");
  });

  it("enthält keinen Body-Inhalt in Suchergebnissen", async () => {
    const res = await GET(makeSearchRequest("Berlin") as never);
    const data = await res.json();

    expect(data[0].body).toBeUndefined();
    expect(JSON.stringify(data)).not.toContain("Geheimer Premium-Body-Inhalt");
  });

  it("gibt 400 bei leerem Suchbegriff zurück", async () => {
    const res = await GET(makeSearchRequest("") as never);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Ungültiger Suchbegriff");
  });

  it("gibt 500 bei internem Fehler zurück", async () => {
    const { searchArticles } = await import("@/lib/data");
    vi.mocked(searchArticles).mockImplementationOnce(async () => {
      throw new Error("DB connection failed");
    });

    const res = await GET(makeSearchRequest("Berlin") as never);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Suche konnte nicht durchgeführt werden");
  });

  it("projiziert alle erwarteten Safe-Felder", async () => {
    const res = await GET(makeSearchRequest("Berlin") as never);
    const data = await res.json();
    const result = data[0];

    expect(result.id).toBe("1");
    expect(result.category.slug).toBe("politik");
    expect(result.isPremium).toBe(true);
    expect(result.author.name).toBe("Anna Schmidt");
    expect(result.readingTimeMinutes).toBe(5);
  });
});
