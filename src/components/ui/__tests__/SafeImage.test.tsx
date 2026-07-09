/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, afterEach } from "vitest";
import SafeImage from "@/components/ui/SafeImage";

const imageSpy = vi.fn();

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown> & { onError?: () => void }) => {
    imageSpy(props);
    const { onError, ...rest } = props;
    const nextProps = new Set([
      "priority",
      "fill",
      "loader",
      "placeholder",
      "quality",
      "blurDataURL",
    ]);
    const htmlProps = Object.fromEntries(
      Object.entries(rest).filter(([k]) => !nextProps.has(k)),
    );
    return <img {...htmlProps} onError={onError} />;
  },
}));

afterEach(() => {
  vi.restoreAllMocks();
});

const defaultProps = {
  src: "/images/hero.jpg",
  alt: "Berliner Fernsehturm",
  width: 800,
  height: 600,
};

describe("SafeImage", () => {
  it("rendert ein Bild mit korrektem Alt-Text", () => {
    render(<SafeImage {...defaultProps} />);

    const img = screen.getByRole("img", { name: "Berliner Fernsehturm" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/hero.jpg");
  });

  it("setzt kein Standard-sizes-Attribut wenn nicht uebergeben", () => {
    render(<SafeImage {...defaultProps} />);

    const img = screen.getByRole("img", { name: "Berliner Fernsehturm" });
    expect(img).not.toHaveAttribute("sizes");
  });

  it("akzeptiert benutzerdefinierte sizes", () => {
    render(<SafeImage {...defaultProps} sizes="100vw" />);

    expect(screen.getByRole("img")).toHaveAttribute("sizes", "100vw");
  });

  it("setzt priority wenn uebergeben", () => {
    imageSpy.mockClear();
    render(<SafeImage {...defaultProps} priority />);

    expect(imageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ priority: true }),
    );
  });

  it("setzt width und height im Standard-Modus", () => {
    render(<SafeImage {...defaultProps} />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("width", "800");
    expect(img).toHaveAttribute("height", "600");
  });

  it("uebergibt fill und entfernt width/height im fill-Modus", () => {
    imageSpy.mockClear();
    render(<SafeImage {...defaultProps} fill />);

    expect(imageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ fill: true }),
    );
    expect(imageSpy).toHaveBeenCalledWith(
      expect.not.objectContaining({ width: expect.anything() }),
    );
  });

  it("zeigt Fallback-Text bei Bild-Ladefehler", () => {
    render(<SafeImage {...defaultProps} />);

    const img = screen.getByRole("img");
    fireEvent.error(img);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Image unavailable")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("zeigt benutzerdefinierten unavailableLabel im Fehlerfall", () => {
    render(
      <SafeImage {...defaultProps} unavailableLabel="Bild nicht verfügbar" />,
    );

    fireEvent.error(screen.getByRole("img"));

    expect(screen.getByText("Bild nicht verfügbar")).toBeInTheDocument();
  });

  it("setzt aria-label auf den Alt-Text im Fehler-Fallback", () => {
    render(<SafeImage {...defaultProps} />);

    fireEvent.error(screen.getByRole("img"));

    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "Berliner Fernsehturm",
    );
  });

  it("uebergibt className an das Image", () => {
    render(<SafeImage {...defaultProps} className="rounded-lg" />);

    expect(screen.getByRole("img")).toHaveClass("rounded-lg");
  });
});
