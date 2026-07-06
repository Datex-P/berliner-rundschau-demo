import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthorError from "../error";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AuthorError", () => {
  const defaultProps = {
    error: new Error("Testfehler") as Error & { digest?: string },
    reset: vi.fn(),
  };

  it("rendert eine Alert-Rolle", () => {
    render(<AuthorError {...defaultProps} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("zeigt den autor-spezifischen Fehlertitel", () => {
    render(<AuthorError {...defaultProps} />);
    expect(
      screen.getByRole("heading", {
        name: "Autor konnte nicht geladen werden",
      }),
    ).toBeInTheDocument();
  });

  it("zeigt die Kontext-Fehlermeldung", () => {
    render(<AuthorError {...defaultProps} />);
    expect(
      screen.getByText(
        "Beim Laden der Autorenseite ist ein Fehler aufgetreten.",
      ),
    ).toBeInTheDocument();
  });

  it("rendert error.message NICHT im UI", () => {
    render(<AuthorError {...defaultProps} />);
    expect(screen.queryByText("Testfehler")).not.toBeInTheDocument();
  });

  it("ruft reset() bei Klick auf den Retry-Button", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(
      <AuthorError
        error={new Error("Test") as Error & { digest?: string }}
        reset={reset}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /erneut versuchen/i }),
    );

    expect(reset).toHaveBeenCalledOnce();
  });

  it("zeigt den Digest als Referenz wenn vorhanden", () => {
    const error = Object.assign(new Error("Test"), { digest: "aut-ref-101" });
    render(<AuthorError error={error} reset={vi.fn()} />);
    expect(screen.getByText(/aut-ref-101/)).toBeInTheDocument();
  });

  it("stoppt Retries nach dem Limit", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(
      <AuthorError
        error={new Error("Test") as Error & { digest?: string }}
        reset={reset}
      />,
    );

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
});
