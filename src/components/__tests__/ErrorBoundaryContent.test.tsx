import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorBoundaryContent from "@/components/ErrorBoundaryContent";

afterEach(() => {
  vi.restoreAllMocks();
});

function createError(message: string, digest?: string): Error & { digest?: string } {
  const error = new Error(message) as Error & { digest?: string };
  if (digest) {
    error.digest = digest;
  }
  return error;
}

describe("ErrorBoundaryContent", () => {
  const defaultProps = {
    title: "Fehler beim Laden",
    contextMessage: "Daten konnten nicht abgerufen werden.",
    error: createError("Interner Fehler"),
    reset: vi.fn(),
  };

  it("rendert eine Alert-Rolle", () => {
    render(<ErrorBoundaryContent {...defaultProps} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("zeigt den übergebenen Titel als Heading", () => {
    render(<ErrorBoundaryContent {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: "Fehler beim Laden" }),
    ).toBeInTheDocument();
  });

  it("zeigt die Kontext-Nachricht", () => {
    render(<ErrorBoundaryContent {...defaultProps} />);
    expect(
      screen.getByText("Daten konnten nicht abgerufen werden."),
    ).toBeInTheDocument();
  });

  it("zeigt den Retry-Button mit verbleibenden Versuchen", () => {
    render(<ErrorBoundaryContent {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /erneut versuchen/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/3 verbleibend/)).toBeInTheDocument();
  });

  it("ruft reset() bei Klick auf den Retry-Button", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<ErrorBoundaryContent {...defaultProps} reset={reset} />);

    await user.click(
      screen.getByRole("button", { name: /erneut versuchen/i }),
    );

    expect(reset).toHaveBeenCalledOnce();
  });

  it("dekrementiert verbleibende Versuche bei jedem Klick", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<ErrorBoundaryContent {...defaultProps} reset={reset} />);

    await user.click(
      screen.getByRole("button", { name: /erneut versuchen/i }),
    );
    expect(screen.getByText(/2 verbleibend/)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /erneut versuchen/i }),
    );
    expect(screen.getByText(/1 verbleibend/)).toBeInTheDocument();
  });

  it("stoppt Retries nach dem Limit und zeigt den Max-Hinweis", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<ErrorBoundaryContent {...defaultProps} reset={reset} />);

    const button = screen.getByRole("button", { name: /erneut versuchen/i });
    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(reset).toHaveBeenCalledTimes(3);
    expect(
      screen.queryByRole("button", { name: /erneut versuchen/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/maximale versuche erreicht/i),
    ).toBeInTheDocument();
  });

  it("zeigt den Digest als Referenz wenn vorhanden", () => {
    const error = createError("Test", "digest-abc-123");
    render(<ErrorBoundaryContent {...defaultProps} error={error} />);
    expect(screen.getByText(/digest-abc-123/)).toBeInTheDocument();
  });

  it("zeigt keinen Digest wenn nicht vorhanden", () => {
    render(<ErrorBoundaryContent {...defaultProps} />);
    expect(screen.queryByText(/Ref:/)).not.toBeInTheDocument();
  });
});
