import { describe, it, expect } from "vitest";
import robots from "@/app/robots";

describe("robots", () => {
  it("blockiert das Crawlen der gesamten Seite (Demo-Projekt)", () => {
    const result = robots();
    expect(result.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userAgent: "*", disallow: ["/"] }),
      ]),
    );
  });

  it("hat keine Sitemap (Demo-Projekt soll nicht indexiert werden)", () => {
    const result = robots();
    expect(result.sitemap).toBeUndefined();
  });
});
