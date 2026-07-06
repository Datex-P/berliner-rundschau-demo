import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import AppFooter from "@/components/AppFooter";
import type { Navigation } from "@/types";

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

vi.mock("@/components/ui/ExternalLink", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} target="_blank" {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

const mockNavigation: Navigation = {
  primaryMenu: [],
  footerMenu: [
    {
      reference: { type: "SECTION", href: "/impressum", label: "Impressum" },
      commercial: false,
    },
    {
      reference: {
        type: "SECTION",
        href: "/datenschutz",
        label: "Datenschutz",
      },
      commercial: false,
    },
  ],
  socialLinks: [
    { platform: "twitter", url: "https://twitter.com/test", label: "Twitter" },
    {
      platform: "facebook",
      url: "https://facebook.com/test",
      label: "Facebook",
    },
  ],
};

describe("AppFooter", () => {
  it("rendert den Footer-Landmark mit contentinfo-Rolle", () => {
    render(<AppFooter navigation={mockNavigation} />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("zeigt den Seitennamen als Link zur Startseite", () => {
    render(<AppFooter navigation={mockNavigation} />);
    const brandLink = screen.getByRole("link", {
      name: "Berliner Rundschau",
    });
    expect(brandLink).toHaveAttribute("href", "/");
  });

  it("rendert die Footer-Navigationslinks", () => {
    render(<AppFooter navigation={mockNavigation} />);
    const footerNav = screen.getByRole("navigation", {
      name: "Footer-Navigation",
    });
    const links = within(footerNav).getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveTextContent("Impressum");
    expect(links[0]).toHaveAttribute("href", "/impressum");
    expect(links[1]).toHaveTextContent("Datenschutz");
    expect(links[1]).toHaveAttribute("href", "/datenschutz");
  });

  it("rendert die Social-Media-Links mit korrekten aria-labels", () => {
    render(<AppFooter navigation={mockNavigation} />);
    const twitterLink = screen.getByRole("link", { name: /Twitter/i });
    expect(twitterLink).toHaveAttribute("href", "https://twitter.com/test");

    const facebookLink = screen.getByRole("link", { name: /Facebook/i });
    expect(facebookLink).toHaveAttribute("href", "https://facebook.com/test");
  });

  it("zeigt den Copyright-Hinweis mit aktuellem Jahr", () => {
    render(<AppFooter navigation={mockNavigation} />);
    expect(screen.getByText(/2026 Berliner Rundschau/)).toBeInTheDocument();
    expect(screen.getByText(/Alle Rechte vorbehalten/)).toBeInTheDocument();
  });

  it("zeigt die Seitenbeschreibung", () => {
    render(<AppFooter navigation={mockNavigation} />);
    expect(
      screen.getByText(/Nachrichten aus Berlin und der Welt/),
    ).toBeInTheDocument();
  });
});
