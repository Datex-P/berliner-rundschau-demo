// Search API — used by client-side SearchClient component
import { NextRequest, NextResponse } from "next/server";
import { searchQuerySchema } from "@/lib/schemas";
import { searchArticles } from "@/lib/data";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const parsed = searchQuerySchema.safeParse({
      q: url.searchParams.get("q") ?? "",
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültiger Suchbegriff" },
        { status: 400 },
      );
    }

    const results = await searchArticles(parsed.data.q);

    const safeResults = results.map(
      ({
        id,
        headline,
        teaser,
        slug,
        category,
        publicationDate,
        image,
        author,
        readingTimeMinutes,
        isPremium,
        tags,
      }) => ({
        id,
        headline,
        teaser,
        slug,
        category,
        publicationDate,
        image,
        author,
        readingTimeMinutes,
        isPremium,
        tags,
      }),
    );

    return NextResponse.json(safeResults);
  } catch (error) {
    console.error("[api/search]", { error, url: request.url });
    return NextResponse.json(
      { error: "Suche konnte nicht durchgeführt werden" },
      { status: 500 },
    );
  }
}
