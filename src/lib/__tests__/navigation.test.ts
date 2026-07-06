import { describe, it, expect } from "vitest";
import { SERVICE_LINKS, buildCategoryNav, routes } from "@/lib/navigation";
import type { Category } from "@/types";

describe("SERVICE_LINKS", () => {
  it("enthält Kontakt, Impressum und Datenschutz", () => {
    const labels = SERVICE_LINKS.map((l) => l.label);
    expect(labels).toContain("Kontakt");
    expect(labels).toContain("Impressum");
    expect(labels).toContain("Datenschutz");
  });

  it("hat gültige href-Pfade", () => {
    SERVICE_LINKS.forEach((link) => {
      expect(link.href).toMatch(/^\//);
    });
  });
});

describe("buildCategoryNav", () => {
  const mockCategories: Category[] = [
    {
      id: "cat-1",
      name: "Politik",
      slug: "politik",
      path: "/kategorie/politik",
      description: "Politische Nachrichten",
      color: "#1a365d",
      children: [],
      articleCount: 5,
    },
    {
      id: "cat-2",
      name: "Sport",
      slug: "sport",
      path: "/kategorie/sport",
      description: "Sportnachrichten",
      color: "#0891b2",
      children: [],
      articleCount: 3,
    },
  ];

  it("erzeugt NavItems aus Kategorien", () => {
    const nav = buildCategoryNav(mockCategories);
    expect(nav).toHaveLength(2);
    expect(nav[0]).toEqual({
      label: "Politik",
      href: "/kategorie/politik",
    });
    expect(nav[1]).toEqual({
      label: "Sport",
      href: "/kategorie/sport",
    });
  });

  it("gibt leeres Array für leere Eingabe zurück", () => {
    expect(buildCategoryNav([])).toEqual([]);
  });

  it("baut href aus slug, nicht aus path", () => {
    const custom: Category[] = [
      {
        id: "1",
        name: "Test",
        slug: "custom-slug",
        path: "/anderer/pfad",
        description: "",
        color: "",
        children: [],
        articleCount: 0,
      },
    ];
    const nav = buildCategoryNav(custom);
    expect(nav[0].href).toBe("/kategorie/custom-slug");
  });
});

describe("routes", () => {
  it("gibt home als / zurück", () => {
    expect(routes.home).toBe("/");
  });

  it("baut article-Route mit Slug", () => {
    expect(routes.article("test-artikel")).toBe("/artikel/test-artikel");
  });

  it("baut category-Route mit Slug", () => {
    expect(routes.category("politik")).toBe("/kategorie/politik");
  });

  it("baut author-Route mit Slug", () => {
    expect(routes.author("anna-schmidt")).toBe("/autor/anna-schmidt");
  });

  it("baut search-Route ohne Query", () => {
    expect(routes.search()).toBe("/suche");
  });

  it("baut search-Route mit Query und encodiert Sonderzeichen", () => {
    expect(routes.search("Berlin Mitte")).toBe("/suche?q=Berlin%20Mitte");
  });

  it("encodiert Umlaute in search-Query", () => {
    const result = routes.search("Straße");
    expect(result).toContain("Stra%C3%9Fe");
  });
});
