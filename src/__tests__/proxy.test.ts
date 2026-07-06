import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const mockRedirect = vi.fn((url: URL) => ({
  type: "redirect" as const,
  url: url.toString(),
  headers: new Map<string, string>(),
}));
const mockNext = vi.fn(() => {
  const headers = new Map<string, string>();
  return {
    type: "next" as const,
    headers: {
      set: (key: string, value: string) => headers.set(key, value),
      get: (key: string) => headers.get(key),
    },
  };
});

vi.mock("next/server", () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    redirect: (...args: unknown[]) => mockRedirect(...(args as [URL])),
    next: () => mockNext(),
  },
}));

function createRequest(
  url: string,
  cookies?: Record<string, string>,
): NextRequest {
  const parsedUrl = new URL(url);
  return {
    nextUrl: parsedUrl,
    url,
    cookies: {
      get: (name: string) => {
        if (cookies && name in cookies) {
          return { name, value: cookies[name] };
        }
        return undefined;
      },
    },
  } as unknown as NextRequest;
}

let proxy: typeof import("@/proxy").proxy;
let config: typeof import("@/proxy").config;

beforeEach(async () => {
  vi.clearAllMocks();
  const mod = await import("@/proxy");
  proxy = mod.proxy;
  config = mod.config;
});

describe("proxy", () => {
  it("allows access to premium article route with auth token", () => {
    const request = createRequest(
      "http://localhost:3000/artikel/test-article?premium",
      { "auth-token": "valid-token" },
    );

    const result = proxy(request);

    expect(mockNext).toHaveBeenCalled();
    expect(result).toHaveProperty("type", "next");
  });

  it("redirects unauthenticated user on premium article route to login", () => {
    const request = createRequest(
      "http://localhost:3000/artikel/premium-article?premium",
    );

    proxy(request);

    expect(mockRedirect).toHaveBeenCalled();
    const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
    expect(redirectUrl.pathname).toBe("/login");
    expect(redirectUrl.searchParams.get("returnTo")).toBe(
      "/artikel/premium-article",
    );
  });

  it("allows access to non-premium article route without auth token", () => {
    const request = createRequest("http://localhost:3000/artikel/free-article");

    const result = proxy(request);

    expect(mockNext).toHaveBeenCalled();
    expect(result).toHaveProperty("type", "next");
  });

  it("allows access to non-article routes without auth token", () => {
    const request = createRequest("http://localhost:3000/");

    const result = proxy(request);

    expect(mockNext).toHaveBeenCalled();
    expect(result).toHaveProperty("type", "next");
  });
});

describe("proxy config", () => {
  it("has a matcher pattern", () => {
    expect(config.matcher).toBeDefined();
    expect(config.matcher.length).toBeGreaterThan(0);
  });
});
