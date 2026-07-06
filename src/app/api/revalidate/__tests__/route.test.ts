import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../route";

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/schemas", async () => {
  const { z } = await import("zod");
  return {
    revalidateSchema: z.object({
      tag: z.string().min(1).max(128),
      secret: z.string().min(1),
    }),
  };
});

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/revalidate", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV, REVALIDATION_SECRET: "test-secret-123" };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.restoreAllMocks();
  });

  it("revalidiert Tag bei gültigem Secret", async () => {
    const { revalidateTag } = await import("next/cache");
    const res = await POST(
      makeRequest({ tag: "articles", secret: "test-secret-123" }) as never,
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ revalidated: true, tag: "articles" });
    expect(revalidateTag).toHaveBeenCalledWith("articles", "max");
  });

  it("gibt 401 bei falschem Secret zurück", async () => {
    const res = await POST(
      makeRequest({ tag: "articles", secret: "wrong-secret" }) as never,
    );
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("gibt 401 wenn REVALIDATION_SECRET nicht gesetzt", async () => {
    delete process.env.REVALIDATION_SECRET;
    const res = await POST(
      makeRequest({ tag: "articles", secret: "any-secret" }) as never,
    );
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("gibt 400 bei ungültigem JSON zurück", async () => {
    const req = new Request("http://localhost/api/revalidate", {
      method: "POST",
      body: "not-json",
    });
    const res = await POST(req as never);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid JSON");
  });

  it("gibt 400 bei fehlendem Tag-Feld zurück", async () => {
    const res = await POST(makeRequest({ secret: "test-secret-123" }) as never);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid request");
    expect(data.details).toBeDefined();
  });

  it("gibt 400 bei leerem Secret zurück", async () => {
    const res = await POST(
      makeRequest({ tag: "articles", secret: "" }) as never,
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid request");
  });
});
