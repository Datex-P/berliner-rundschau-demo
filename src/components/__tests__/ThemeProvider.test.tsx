import {
  renderHook,
  act,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, afterEach, beforeEach } from "vitest";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import type { ReactNode } from "react";

const matchMediaMock = () =>
  vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

beforeEach(() => {
  window.matchMedia = matchMediaMock();
});

afterEach(() => {
  vi.restoreAllMocks();
  window.matchMedia = matchMediaMock();
  document.documentElement.classList.remove("dark");
  localStorage.clear();
});

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe("ThemeProvider", () => {
  it("liefert isDark=false als Standardwert", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.isDark).toBe(false);
    expect(typeof result.current.toggle).toBe("function");
  });

  it("liest den initialen Dark-Mode-Status vom DOM", async () => {
    document.documentElement.classList.add("dark");

    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.isDark).toBe(true);
    });
  });

  it("toggle wechselt isDark von false auf true", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isDark).toBe(true);
  });

  it("toggle wechselt isDark von true zurück auf false", async () => {
    document.documentElement.classList.add("dark");
    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.isDark).toBe(true);
    });

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isDark).toBe(false);
  });

  it("setzt die dark-Klasse auf documentElement beim Toggle", async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    await act(async () => {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
    });

    act(() => {
      result.current.toggle();
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("speichert den Theme-Wert in localStorage", async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    await act(async () => {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
    });

    act(() => {
      result.current.toggle();
    });

    expect(localStorage.getItem("theme")).toBe("dark");

    act(() => {
      result.current.toggle();
    });

    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("liefert stabile toggle-Referenz über mehrere Render hinweg", () => {
    const { result, rerender } = renderHook(() => useTheme(), { wrapper });
    const firstToggle = result.current.toggle;

    rerender();

    expect(result.current.toggle).toBe(firstToggle);
  });
});

function TestConsumer() {
  const { isDark, toggle } = useTheme();
  return (
    <button onClick={toggle} aria-pressed={isDark}>
      {isDark ? "Dark" : "Light"}
    </button>
  );
}

describe("ThemeProvider — Interaktion", () => {
  beforeEach(() => {
    window.matchMedia = matchMediaMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.matchMedia = matchMediaMock();
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("wechselt Theme bei Button-Klick", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    await act(async () => {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
    });

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Light");
    expect(button).toHaveAttribute("aria-pressed", "false");

    await user.click(button);

    expect(button).toHaveTextContent("Dark");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("wechselt Theme zurück bei erneutem Klick", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    await act(async () => {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
    });

    const button = screen.getByRole("button");
    await user.click(button);
    expect(button).toHaveTextContent("Dark");

    await user.click(button);
    expect(button).toHaveTextContent("Light");
  });
});
