import { describe, it, expect } from "vitest";
import { parseFieldMap, mapField } from "../field-map";

describe("parseFieldMap", () => {
  it("returns empty map for undefined", () => {
    expect(parseFieldMap(undefined)).toEqual({});
  });

  it("returns empty map for empty string", () => {
    expect(parseFieldMap("")).toEqual({});
  });

  it("parses valid JSON", () => {
    const result = parseFieldMap('{"headline":"title","teaser":"description"}');
    expect(result).toEqual({ headline: "title", teaser: "description" });
  });

  it("ignores non-string values", () => {
    const result = parseFieldMap('{"headline":"title","count":42}');
    expect(result).toEqual({ headline: "title" });
  });

  it("returns empty map for invalid JSON", () => {
    expect(parseFieldMap("not json")).toEqual({});
  });

  it("returns empty map for array JSON", () => {
    expect(parseFieldMap('["a","b"]')).toEqual({});
  });

  it("trims string values", () => {
    const result = parseFieldMap('{"headline":" title "}');
    expect(result).toEqual({ headline: "title" });
  });

  it("ignores empty string values", () => {
    const result = parseFieldMap('{"headline":"","teaser":"desc"}');
    expect(result).toEqual({ teaser: "desc" });
  });
});

describe("mapField", () => {
  it("returns mapped name when present", () => {
    expect(mapField({ headline: "title" }, "headline")).toBe("title");
  });

  it("returns original name when not mapped", () => {
    expect(mapField({}, "headline")).toBe("headline");
  });
});
