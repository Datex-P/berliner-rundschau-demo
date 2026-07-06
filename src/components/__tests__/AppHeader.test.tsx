import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppHeader from "@/components/AppHeader";
import type { Navigation } from "@/types";

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

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/ThemeToggle", () => ({
  default: () => <button type="button">Theme</button>,
}));

vi.mock("@/hooks/useFocusTrap", () => ({
  useFocusTrap: () => ({ current: null }),
}));

afterEach(() => {
  vi.restoreAllMocks();
  document.body.style.overflow = "";
  mockPathname = "/";
});

const mockNavigation: Navigation = {
  primaryMenu: [
    {
      reference: {
        type: "SECTION",
        href: "/kategorie/politik",
        label: "Politik",
      },
      commercial: false,
    },
    {
      reference: { type: "SECTION", href: "/kategorie/sport", label: "Sport" },
      commercial: false,
    },
  ],
  footerMenu: [],
  socialLinks: [],
};

describe("AppHeader", () => {
  it("rendert das Logo als Link zur Startseite", () => {
    render(<AppHeader navigation={mockNavigation} />);
    const logo = screen.getByRole("link", {
      name: /Berliner Rundschau.*Startseite/,
    });
    expect(logo).toHaveAttribute("href", "/");
  });

  it("rendert die Desktop-Navigation mit allen Links", () => {
    render(<AppHeader navigation={mockNavigation} />);
    const nav = screen.getByRole("navigation", {
      name: "Hauptnavigation",
    });
    const links = within(nav).getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(2);
    expect(links[0]).toHaveTextContent("Politik");
    expect(links[1]).toHaveTextContent("Sport");
  });

  it("rendert den Such-Link in der Desktop-Ansicht", () => {
    render(<AppHeader navigation={mockNavigation} />);
    const searchLink = screen.getByRole("link", { name: "Suche" });
    expect(searchLink).toHaveAttribute("href", "/suche");
  });

  it("zeigt den Hamburger-Button mit korrektem aria-expanded", () => {
    render(<AppHeader navigation={mockNavigation} />);
    const menuButton = screen.getByRole("button", {
      name: /Menü öffnen/,
    });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  it("oeffnet das Mobile-Menue bei Klick auf den Hamburger-Button", async () => {
    const user = userEvent.setup();
    render(<AppHeader navigation={mockNavigation} />);

    const menuButton = screen.getByRole("button", {
      name: /Menü öffnen/,
    });
    await user.click(menuButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const closeButton = screen.getByRole("button", {
      name: /Menü schließen/,
    });
    expect(closeButton).toHaveAttribute("aria-expanded", "true");
  });

  it("schliesst das Mobile-Menue bei erneutem Klick", async () => {
    const user = userEvent.setup();
    render(<AppHeader navigation={mockNavigation} />);

    await user.click(screen.getByRole("button", { name: /Menü öffnen/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Menü schließen/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("setzt scroll-lock beim Oeffnen und entfernt ihn beim Schliessen", async () => {
    const user = userEvent.setup();
    render(<AppHeader navigation={mockNavigation} />);

    await user.click(screen.getByRole("button", { name: /Menü öffnen/ }));
    expect(document.body.style.overflow).toBe("hidden");

    await user.click(screen.getByRole("button", { name: /Menü schließen/ }));
    expect(document.body.style.overflow).toBe("");
  });

  it("schliesst das Mobile-Menue bei Escape", async () => {
    const user = userEvent.setup();
    render(<AppHeader navigation={mockNavigation} />);

    await user.click(screen.getByRole("button", { name: /Menü öffnen/ }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    // Focus auf ein Element im Dialog verschieben, damit Escape zum onKeyDown bubblet
    const firstLink = within(dialog).getAllByRole("link")[0];
    firstLink.focus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("markiert den aktiven Nav-Eintrag mit aria-current", () => {
    mockPathname = "/kategorie/politik";
    render(<AppHeader navigation={mockNavigation} />);
    const politikLink = screen.getAllByRole("link", { name: "Politik" })[0];
    expect(politikLink).toHaveAttribute("aria-current", "page");

    const sportLink = screen.getAllByRole("link", { name: "Sport" })[0];
    expect(sportLink).not.toHaveAttribute("aria-current");
  });
});
