import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

import {
  sanitizeError,
  isPrivateIp,
  validateUrl,
  isRetryableNetworkError,
} from "../http";

describe("sanitizeError", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  it("converts Error to string", () => {
    const result = sanitizeError(new Error("something broke"));
    expect(result).toContain("something broke");
  });

  it("converts string to string", () => {
    expect(sanitizeError("plain message")).toBe("plain message");
  });

  it("redacts env var values ending in _TOKEN", () => {
    process.env.MY_API_TOKEN = "secret123";
    const result = sanitizeError(
      new Error("failed with secret123 in response"),
    );
    expect(result).not.toContain("secret123");
    expect(result).toContain("[REDACTED]");
  });

  it("redacts env var values ending in _SECRET", () => {
    process.env.APP_SECRET = "mysecret";
    const result = sanitizeError("error: mysecret leaked");
    expect(result).not.toContain("mysecret");
  });

  it("redacts URL query params", () => {
    const result = sanitizeError(
      "Request to https://api.example.com/data?token=abc123&key=xyz failed",
    );
    expect(result).not.toContain("token=abc123");
    expect(result).toContain("?REDACTED");
  });
});

describe("isPrivateIp", () => {
  it("detects 10.x.x.x", () => {
    expect(isPrivateIp("10.0.0.1")).toBe(true);
  });

  it("detects 172.16.x.x", () => {
    expect(isPrivateIp("172.16.0.1")).toBe(true);
  });

  it("detects 192.168.x.x", () => {
    expect(isPrivateIp("192.168.1.1")).toBe(true);
  });

  it("detects 127.0.0.1", () => {
    expect(isPrivateIp("127.0.0.1")).toBe(true);
  });

  it("detects ::1", () => {
    expect(isPrivateIp("::1")).toBe(true);
  });

  it("detects IPv4-mapped IPv6", () => {
    expect(isPrivateIp("::ffff:127.0.0.1")).toBe(true);
    expect(isPrivateIp("::ffff:10.0.0.1")).toBe(true);
  });

  it("detects cloud metadata", () => {
    expect(isPrivateIp("metadata.google.internal")).toBe(true);
    expect(isPrivateIp("169.254.169.254")).toBe(true);
  });

  it("allows public IPs", () => {
    expect(isPrivateIp("8.8.8.8")).toBe(false);
    expect(isPrivateIp("203.0.113.1")).toBe(false);
  });

  it("detects link-local", () => {
    expect(isPrivateIp("169.254.1.1")).toBe(true);
    expect(isPrivateIp("fe80::1")).toBe(true);
  });
});

describe("validateUrl", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    process.env = originalEnv;
  });

  it("accepts valid https URL", () => {
    const url = validateUrl("https://api.example.com/data");
    expect(url.hostname).toBe("api.example.com");
  });

  it("rejects ftp protocol", () => {
    expect(() => validateUrl("ftp://evil.com/file")).toThrow(
      "Disallowed protocol",
    );
  });

  it("rejects private IPs in production", () => {
    expect(() => validateUrl("http://127.0.0.1:3000/api")).toThrow(
      "SSRF blocked",
    );
  });

  it("allows private IPs in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(() => validateUrl("http://127.0.0.1:3000/api")).not.toThrow();
  });
});

describe("isRetryableNetworkError", () => {
  it("returns true for ENOTFOUND", () => {
    const err = new Error("getaddrinfo ENOTFOUND");
    (err as NodeJS.ErrnoException).code = "ENOTFOUND";
    expect(isRetryableNetworkError(err)).toBe(true);
  });

  it("returns true for ECONNRESET", () => {
    const err = new Error("connection reset");
    (err as NodeJS.ErrnoException).code = "ECONNRESET";
    expect(isRetryableNetworkError(err)).toBe(true);
  });

  it("returns false for non-Error", () => {
    expect(isRetryableNetworkError("string error")).toBe(false);
  });

  it("returns false for Error without code", () => {
    expect(isRetryableNetworkError(new Error("generic"))).toBe(false);
  });
});
