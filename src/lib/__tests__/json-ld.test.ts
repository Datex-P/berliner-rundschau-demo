import { describe, it, expect } from "vitest";
import {
  articleJsonLd,
  collectionPageJsonLd,
  personJsonLd,
} from "@/lib/json-ld";

describe("articleJsonLd", () => {
  const baseOpts = {
    headline: "Test Artikel",
    datePublished: "2026-06-28T08:00:00Z",
    author: "Anna Schmidt",
    publisher: "Berliner Rundschau",
  };

  it("erzeugt Article-Schema mit Pflichtfeldern", () => {
    const result = articleJsonLd(baseOpts);
    expect(result["@type"]).toBe("Article");
    expect(result.headline).toBe("Test Artikel");
    expect(result.author).toEqual({
      "@type": "Person",
      name: "Anna Schmidt",
    });
    expect(result.publisher).toEqual({
      "@type": "Organization",
      name: "Berliner Rundschau",
    });
  });

  it("setzt dateModified auf datePublished als Fallback", () => {
    const result = articleJsonLd(baseOpts);
    expect(result.dateModified).toBe("2026-06-28T08:00:00Z");
  });

  it("verwendet explizites dateModified wenn angegeben", () => {
    const result = articleJsonLd({
      ...baseOpts,
      dateModified: "2026-06-29T10:00:00Z",
    });
    expect(result.dateModified).toBe("2026-06-29T10:00:00Z");
  });

  it("enthält optionale Felder", () => {
    const result = articleJsonLd({
      ...baseOpts,
      image: "https://example.com/img.jpg",
      description: "Kurzbeschreibung",
    });
    expect(result.image).toBe("https://example.com/img.jpg");
    expect(result.description).toBe("Kurzbeschreibung");
  });
});

describe("collectionPageJsonLd", () => {
  it("erzeugt CollectionPage-Schema", () => {
    const result = collectionPageJsonLd(
      "Politik",
      "/kategorie/politik",
      "Politische Nachrichten",
    );
    expect(result["@type"]).toBe("CollectionPage");
    expect(result.name).toBe("Politik");
    expect(result.description).toBe("Politische Nachrichten");
  });

  it("setzt description auf undefined wenn nicht angegeben", () => {
    const result = collectionPageJsonLd("Sport", "/kategorie/sport");
    expect(result["@type"]).toBe("CollectionPage");
    expect(result.description).toBeUndefined();
  });
});

describe("personJsonLd", () => {
  it("erzeugt Person-Schema mit nur Name", () => {
    const result = personJsonLd("Max Mustermann");
    expect(result["@type"]).toBe("Person");
    expect(result.name).toBe("Max Mustermann");
    expect(result).not.toHaveProperty("url");
    expect(result).not.toHaveProperty("image");
  });

  it("fügt optionale Felder hinzu", () => {
    const result = personJsonLd(
      "Max Mustermann",
      "https://max.de",
      "https://max.de/foto.jpg",
    );
    expect(result.url).toBe("https://max.de");
    expect(result.image).toBe("https://max.de/foto.jpg");
  });
});
