import { render, screen } from "@testing-library/react";
import { vi, afterEach } from "vitest";
import ExternalLink from "@/components/ui/ExternalLink";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ExternalLink", () => {
  it("rendert Link mit korrektem href, target und rel", () => {
    render(<ExternalLink href="https://example.com">Beispiel</ExternalLink>);
    const link = screen.getByRole("link", { name: /beispiel/i });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("zeigt Standard-SR-Hinweis in englisch", () => {
    render(<ExternalLink href="https://example.com">Klick</ExternalLink>);
    expect(screen.getByText("(opens in new tab)")).toBeInTheDocument();
  });

  it("zeigt benutzerdefinierten SR-Hinweis", () => {
    render(
      <ExternalLink
        href="https://example.com"
        srHintLabel="(öffnet in neuem Tab)"
      >
        Klick
      </ExternalLink>,
    );
    expect(screen.getByText("(öffnet in neuem Tab)")).toBeInTheDocument();
    expect(screen.queryByText("(opens in new tab)")).not.toBeInTheDocument();
  });

  it("wendet className auf den Link an", () => {
    render(
      <ExternalLink href="https://example.com" className="text-red-500">
        Styled
      </ExternalLink>,
    );
    const link = screen.getByRole("link", { name: /styled/i });
    expect(link).toHaveClass("text-red-500");
  });
});
