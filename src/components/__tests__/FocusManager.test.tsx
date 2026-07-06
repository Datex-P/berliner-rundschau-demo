import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { FocusManager } from "@/components/FocusManager";

let mockPathname = "/";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

beforeEach(() => {
  const mainEl = document.createElement("div");
  mainEl.id = "main-content";
  document.body.appendChild(mainEl);
});

afterEach(() => {
  vi.restoreAllMocks();
  mockPathname = "/";
  const mainEl = document.getElementById("main-content");
  if (mainEl) mainEl.remove();
});

describe("FocusManager", () => {
  it("setzt tabindex=-1 auf das Hauptinhalt-Element", () => {
    render(<FocusManager />);
    const main = document.getElementById("main-content");
    expect(main).toHaveAttribute("tabindex", "-1");
  });

  it("fokussiert das Hauptinhalt-Element beim Mount", () => {
    render(<FocusManager />);
    const main = document.getElementById("main-content");
    expect(document.activeElement).toBe(main);
  });

  it("fokussiert erneut bei Pathname-Änderung", () => {
    const otherEl = document.createElement("button");
    document.body.appendChild(otherEl);

    const { rerender } = render(<FocusManager />);
    const main = document.getElementById("main-content");

    otherEl.focus();
    expect(document.activeElement).toBe(otherEl);

    mockPathname = "/artikel/test";
    rerender(<FocusManager />);

    expect(document.activeElement).toBe(main);
    otherEl.remove();
  });

  it("rendert nichts (null)", () => {
    const { container } = render(<FocusManager />);
    expect(container.firstChild).toBeNull();
  });

  it("funktioniert ohne main-content Element", () => {
    const mainEl = document.getElementById("main-content");
    mainEl?.remove();

    expect(() => render(<FocusManager />)).not.toThrow();
  });
});
