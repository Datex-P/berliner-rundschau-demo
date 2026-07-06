import { describe, it, expect } from "vitest";
import { securityHeaders } from "@/lib/security-headers";

describe("securityHeaders", () => {
  const headers = securityHeaders();

  it("returns all required security headers", () => {
    const keys = headers.map((h) => h.key);
    expect(keys).toContain("Content-Security-Policy");
    expect(keys).toContain("X-Frame-Options");
    expect(keys).toContain("X-Content-Type-Options");
    expect(keys).toContain("Referrer-Policy");
    expect(keys).toContain("Permissions-Policy");
    expect(headers).toHaveLength(5);
  });

  it("sets X-Frame-Options to DENY", () => {
    const header = headers.find((h) => h.key === "X-Frame-Options");
    expect(header?.value).toBe("DENY");
  });

  it("sets X-Content-Type-Options to nosniff", () => {
    const header = headers.find((h) => h.key === "X-Content-Type-Options");
    expect(header?.value).toBe("nosniff");
  });

  it("includes CSP with frame-ancestors none and object-src none", () => {
    const csp =
      headers.find((h) => h.key === "Content-Security-Policy")?.value ?? "";
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
  });

  it("includes CSP with default-src self and script-src directives", () => {
    const csp =
      headers.find((h) => h.key === "Content-Security-Policy")?.value ?? "";
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("img-src 'self' data: https:");
  });

  it("disables camera, microphone, and geolocation via Permissions-Policy", () => {
    const pp = headers.find((h) => h.key === "Permissions-Policy")?.value ?? "";
    expect(pp).toContain("camera=()");
    expect(pp).toContain("microphone=()");
    expect(pp).toContain("geolocation=()");
  });

  it("sets Referrer-Policy to strict-origin-when-cross-origin", () => {
    const header = headers.find((h) => h.key === "Referrer-Policy");
    expect(header?.value).toBe("strict-origin-when-cross-origin");
  });

  it("returns objects with key and value strings", () => {
    for (const header of headers) {
      expect(typeof header.key).toBe("string");
      expect(typeof header.value).toBe("string");
      expect(header.key.length).toBeGreaterThan(0);
      expect(header.value.length).toBeGreaterThan(0);
    }
  });
});
