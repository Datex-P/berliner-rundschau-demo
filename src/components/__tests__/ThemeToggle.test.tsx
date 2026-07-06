import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, afterEach, beforeEach } from "vitest";
import ThemeToggle from "@/components/ThemeToggle";
import { ThemeProvider } from "@/components/ThemeProvider";

const createMatchMediaMock = () =>
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
  window.matchMedia = createMatchMediaMock();
});

afterEach(() => {
  vi.restoreAllMocks();
  window.matchMedia = createMatchMediaMock();
  document.documentElement.classList.remove("dark");
  localStorage.clear();
});

async function renderWithTheme() {
  const result = render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
  await act(async () => {
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
  });
  return result;
}

describe("ThemeToggle", () => {
  it("rendert Button mit aria-label für dunkles Design im Light-Mode", async () => {
    await renderWithTheme();

    expect(
      screen.getByRole("button", { name: "Dunkles Design aktivieren" }),
    ).toBeInTheDocument();
  });

  it("zeigt aria-label für helles Design im Dark-Mode", async () => {
    document.documentElement.classList.add("dark");
    await renderWithTheme();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Helles Design aktivieren" }),
      ).toBeInTheDocument();
    });
  });

  it("wechselt aria-label bei Klick von Light zu Dark", async () => {
    const user = userEvent.setup();
    await renderWithTheme();

    const button = screen.getByRole("button", {
      name: "Dunkles Design aktivieren",
    });
    await user.click(button);

    expect(
      screen.getByRole("button", { name: "Helles Design aktivieren" }),
    ).toBeInTheDocument();
  });

  it("wechselt aria-label bei erneutem Klick zurück", async () => {
    const user = userEvent.setup();
    await renderWithTheme();

    const button = screen.getByRole("button", {
      name: "Dunkles Design aktivieren",
    });
    await user.click(button);

    const darkButton = await screen.findByRole("button", {
      name: "Helles Design aktivieren",
    });
    await user.click(darkButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Dunkles Design aktivieren" }),
      ).toBeInTheDocument();
    });
  });

  it("SVG-Icons haben aria-hidden für Screenreader", async () => {
    await renderWithTheme();

    const button = screen.getByRole("button", {
      name: "Dunkles Design aktivieren",
    });
    const svg = button.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("setzt dark-Klasse auf documentElement bei Klick", async () => {
    const user = userEvent.setup();
    await renderWithTheme();

    await user.click(
      screen.getByRole("button", { name: "Dunkles Design aktivieren" }),
    );

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
