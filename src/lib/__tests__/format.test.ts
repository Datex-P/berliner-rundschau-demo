import { describe, it, expect, vi, afterEach } from "vitest";
import {
  formatDate,
  formatRelativeDate,
  formatDuration,
  formatReadingTime,
} from "@/lib/format";

describe("formatDate", () => {
  it("formatiert ISO-Datum im deutschen Format", () => {
    const result = formatDate("2026-01-15T10:00:00Z");
    expect(result).toContain("2026");
    expect(result).toContain("Januar");
    expect(result).toContain("15");
  });

  it("formatiert verschiedene Monate korrekt", () => {
    const result = formatDate("2026-06-28T08:00:00Z");
    expect(result).toContain("Juni");
    expect(result).toContain("28");
  });
});

describe("formatRelativeDate", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('gibt "Gerade eben" für weniger als 1 Minute zurück', () => {
    vi.spyOn(Date, "now").mockReturnValue(
      new Date("2026-06-28T12:00:30Z").getTime(),
    );
    expect(formatRelativeDate("2026-06-28T12:00:00Z")).toBe("Gerade eben");
  });

  it("gibt Minuten zurück für weniger als 1 Stunde", () => {
    vi.spyOn(Date, "now").mockReturnValue(
      new Date("2026-06-28T12:25:00Z").getTime(),
    );
    expect(formatRelativeDate("2026-06-28T12:00:00Z")).toBe("Vor 25 Min.");
  });

  it("gibt Stunden zurück für weniger als 24 Stunden", () => {
    vi.spyOn(Date, "now").mockReturnValue(
      new Date("2026-06-28T15:00:00Z").getTime(),
    );
    expect(formatRelativeDate("2026-06-28T12:00:00Z")).toBe("Vor 3 Std.");
  });

  it('gibt "Vor 1 Tag" mit Singular zurück', () => {
    vi.spyOn(Date, "now").mockReturnValue(
      new Date("2026-06-29T12:00:00Z").getTime(),
    );
    expect(formatRelativeDate("2026-06-28T12:00:00Z")).toBe("Vor 1 Tag");
  });

  it("gibt Tage im Plural zurück für 2-6 Tage", () => {
    vi.spyOn(Date, "now").mockReturnValue(
      new Date("2026-07-01T12:00:00Z").getTime(),
    );
    expect(formatRelativeDate("2026-06-28T12:00:00Z")).toBe("Vor 3 Tagen");
  });

  it("fällt auf formatDate zurück nach 7 Tagen", () => {
    vi.spyOn(Date, "now").mockReturnValue(
      new Date("2026-07-10T12:00:00Z").getTime(),
    );
    const result = formatRelativeDate("2026-06-28T12:00:00Z");
    expect(result).toContain("Juni");
    expect(result).toContain("2026");
  });
});

describe("formatDuration", () => {
  it("formatiert Sekunden als M:SS", () => {
    expect(formatDuration(384)).toBe("6:24");
  });

  it("füllt Sekunden mit führender Null auf", () => {
    expect(formatDuration(65)).toBe("1:05");
  });

  it("formatiert 0 Sekunden korrekt", () => {
    expect(formatDuration(0)).toBe("0:00");
  });

  it("formatiert volle Minuten ohne Rest", () => {
    expect(formatDuration(120)).toBe("2:00");
  });
});

describe("formatReadingTime", () => {
  it("gibt Lesezeit mit Einheit zurück", () => {
    expect(formatReadingTime(5)).toBe("5 Min. Lesezeit");
  });

  it("funktioniert mit 1 Minute", () => {
    expect(formatReadingTime(1)).toBe("1 Min. Lesezeit");
  });
});
