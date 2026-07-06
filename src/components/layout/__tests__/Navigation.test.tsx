import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Navigation from "@/components/layout/Navigation";
import type { MenuItem } from "@/types";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockUsePathname = vi.fn(() => "/");
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

afterEach(() => {
  vi.restoreAllMocks();
  mockUsePathname.mockReturnValue("/");
});

const items: MenuItem[] = [
  {
    reference: { type: "SECTION", href: "/", label: "Startseite" },
    commercial: false,
  },
  {
    reference: { type: "SECTION", href: "/politik", label: "Politik" },
    commercial: false,
  },
  {
    reference: { type: "SECTION", href: "/kultur", label: "Kultur" },
    commercial: false,
  },
];

describe("Navigation", () => {
  it("rendert alle Navigationslinks", () => {
    render(<Navigation items={items} />);

    const nav = screen.getByRole("navigation", { name: "Hauptnavigation" });
    expect(nav).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Startseite" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Politik" })).toHaveAttribute(
      "href",
      "/politik",
    );
    expect(screen.getByRole("link", { name: "Kultur" })).toHaveAttribute(
      "href",
      "/kultur",
    );
  });

  it("markiert den aktiven Link mit aria-current='page'", () => {
    mockUsePathname.mockReturnValue("/politik");

    render(<Navigation items={items} />);

    const activeLink = screen.getByRole("link", { name: "Politik" });
    expect(activeLink).toHaveAttribute("aria-current", "page");

    const homeLink = screen.getByRole("link", { name: "Startseite" });
    expect(homeLink).not.toHaveAttribute("aria-current");
  });

  it("rendert eine leere Liste wenn keine Items übergeben werden", () => {
    render(<Navigation items={[]} />);

    const nav = screen.getByRole("navigation", { name: "Hauptnavigation" });
    const list = within(nav).getByRole("list");
    expect(list).toBeInTheDocument();
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);
  });

  it("übergibt className an das nav-Element", () => {
    render(<Navigation items={items} className="hidden md:flex" />);

    const nav = screen.getByRole("navigation", { name: "Hauptnavigation" });
    expect(nav).toHaveClass("hidden", "md:flex");
  });
});
