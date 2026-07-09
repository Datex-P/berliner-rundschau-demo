import { describe, it, expect } from "vitest";
import robots from "@/app/robots";

describe("robots", () => {
  it("erlaubt das Crawlen der gesamten Seite", () => {
    const result = robots();
    expect(result.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userAgent: "*", allow: ["/"] }),
      ]),
    );
  });

  it("referenziert die Sitemap", () => {
    const result = robots();
    expect(result.sitemap).toContain("/sitemap.xml");
  });
});
