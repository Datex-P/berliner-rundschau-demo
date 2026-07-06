// On-demand revalidation endpoint for CMS webhooks
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { revalidateSchema } from "@/lib/schemas";

/** Constant-time string comparison to prevent timing attacks */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = revalidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (
      !process.env.REVALIDATION_SECRET ||
      !safeCompare(parsed.data.secret, process.env.REVALIDATION_SECRET)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    revalidateTag(parsed.data.tag, "max");
    return NextResponse.json({ revalidated: true, tag: parsed.data.tag });
  } catch (error) {
    console.error("[api/revalidate]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
