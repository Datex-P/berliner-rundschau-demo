import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { sanitizeRichText } from "../sanitize";

describe("sanitizeRichText", () => {
  it("returns empty string for falsy input", () => {
    expect(sanitizeRichText("")).toBe("");
  });

  it("preserves allowed tags", () => {
    const html = "<p>Text</p><figure><figcaption>Caption</figcaption></figure>";
    expect(sanitizeRichText(html)).toContain("<p>");
    expect(sanitizeRichText(html)).toContain("<figure>");
    expect(sanitizeRichText(html)).toContain("<figcaption>");
  });

  it("allows iframe from whitelisted hosts", () => {
    const html = '<iframe src="https://www.youtube.com/embed/abc"></iframe>';
    const result = sanitizeRichText(html);
    expect(result).toContain("iframe");
    expect(result).toContain("youtube.com");
  });

  it("strips src from iframe with non-whitelisted host", () => {
    const html = '<iframe src="https://evil.com/embed"></iframe>';
    const result = sanitizeRichText(html);
    expect(result).not.toContain("evil.com");
  });

  it("strips script tags", () => {
    const html = '<p>Safe</p><script>alert("xss")</script>';
    expect(sanitizeRichText(html)).not.toContain("script");
    expect(sanitizeRichText(html)).toContain("Safe");
  });

  it("blocks data: URLs in schemes", () => {
    const html =
      '<img src="data:text/html,<script>alert(1)</script>" alt="xss">';
    const result = sanitizeRichText(html);
    expect(result).not.toContain("data:");
  });

  it("allows time tag with datetime", () => {
    const html = '<time datetime="2026-01-01">1. Januar</time>';
    expect(sanitizeRichText(html)).toContain("<time");
    expect(sanitizeRichText(html)).toContain("datetime");
  });

  it("allows table elements", () => {
    const html =
      '<table><thead><tr><th scope="col">Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>';
    const result = sanitizeRichText(html);
    expect(result).toContain("<table>");
    expect(result).toContain("<th");
    expect(result).toContain("scope");
  });
});
