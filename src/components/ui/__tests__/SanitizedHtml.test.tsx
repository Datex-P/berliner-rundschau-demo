import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, afterEach } from "vitest";
import SanitizedHtml from "@/components/ui/SanitizedHtml";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SanitizedHtml", () => {
  it("rendert bereinigten HTML-Inhalt", () => {
    render(<SanitizedHtml html="<p>Berliner Nachrichten</p>" />);

    expect(screen.getByText("Berliner Nachrichten")).toBeInTheDocument();
    expect(screen.getByText("Berliner Nachrichten").tagName).toBe("P");
  });

  it("entfernt gefaehrliche script-Tags", () => {
    const { container } = render(
      <SanitizedHtml html='<p>Sicher</p><script>alert("xss")</script>' />,
    );

    expect(screen.getByText("Sicher")).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
  });

  it("entfernt style- und class-Attribute", () => {
    const { container } = render(
      <SanitizedHtml html='<p class="evil" style="color:red">Text</p>' />,
    );

    const p = container.querySelector("p");
    expect(p).toBeInTheDocument();
    expect(p).not.toHaveAttribute("class");
    expect(p).not.toHaveAttribute("style");
  });

  it("erlaubt sichere Tags wie strong, em, a, ul, li", () => {
    const html =
      '<p><strong>Fett</strong> und <em>kursiv</em></p><ul><li>Punkt</li></ul><a href="/link">Link</a>';
    const { container } = render(<SanitizedHtml html={html} />);

    expect(container.querySelector("strong")).toBeInTheDocument();
    expect(container.querySelector("em")).toBeInTheDocument();
    expect(container.querySelector("ul")).toBeInTheDocument();
    expect(container.querySelector("li")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Link" })).toHaveAttribute(
      "href",
      "/link",
    );
  });

  it("entfernt data-Attribute (ALLOW_DATA_ATTR: false)", () => {
    const { container } = render(
      <SanitizedHtml html='<p data-tracking="evil">Clean</p>' />,
    );

    const p = container.querySelector("p");
    expect(p).toBeInTheDocument();
    expect(p).not.toHaveAttribute("data-tracking");
  });

  it("rendert als div standardmaessig", () => {
    const { container } = render(<SanitizedHtml html="<p>Inhalt</p>" />);

    expect(container.firstElementChild?.tagName).toBe("DIV");
  });

  it("rendert als article wenn as-Prop gesetzt", () => {
    const { container } = render(
      <SanitizedHtml html="<p>Inhalt</p>" as="article" />,
    );

    expect(container.querySelector("article")).toBeInTheDocument();
  });

  it("rendert als span wenn as-Prop gesetzt", () => {
    const { container } = render(
      <SanitizedHtml html="<p>Inhalt</p>" as="span" />,
    );

    expect(container.firstElementChild?.tagName).toBe("SPAN");
  });

  it("uebergibt className an das Wrapper-Element", () => {
    const { container } = render(
      <SanitizedHtml html="<p>Inhalt</p>" className="prose max-w-none" />,
    );

    expect(container.firstElementChild).toHaveClass("prose", "max-w-none");
  });

  it("fuegt rel=noopener noreferrer bei target=_blank Links hinzu", () => {
    const { container } = render(
      <SanitizedHtml html='<a href="https://example.com" target="_blank">Extern</a>' />,
    );

    const link = container.querySelector("a");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("entfernt nicht erlaubte Tags wie iframe und form", () => {
    const { container } = render(
      <SanitizedHtml html='<iframe src="evil.com"></iframe><form action="/"><input /></form><p>Sicher</p>' />,
    );

    expect(container.querySelector("iframe")).toBeNull();
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector("input")).toBeNull();
    expect(screen.getByText("Sicher")).toBeInTheDocument();
  });
});
