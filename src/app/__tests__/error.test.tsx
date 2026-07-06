import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorBoundary from "../error";

// Gleiche Locale-Ableitung wie in error.tsx — die Strings sind dort fest definiert
const isGerman = "de-DE".startsWith("de");
const t = isGerman
  ? {
      title: "Etwas ist schiefgelaufen",
      retry: /erneut versuchen/i,
      maxRetries: /maximale versuche erreicht/i,
    }
  : {
      title: "Something went wrong",
      retry: /try again/i,
      maxRetries: /maximum number of retries reached/i,
    };

describe("ErrorBoundary (Scaffold)", () => {
  beforeEach(() => {
    // error.tsx loggt bewusst per console.error — Testausgabe sauber halten
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("zeigt Alert-Rolle und Fehlertitel", () => {
    render(<ErrorBoundary error={new Error("Testfehler")} reset={vi.fn()} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: t.title })).toBeInTheDocument();
  });

  it("rendert error.message NICHT im UI — nur im Server-Log", () => {
    render(
      <ErrorBoundary
        error={new Error("geheime-server-details-123")}
        reset={vi.fn()}
      />,
    );

    expect(
      screen.queryByText(/geheime-server-details-123/),
    ).not.toBeInTheDocument();
    expect(console.error).toHaveBeenCalled();
  });

  it("zeigt den digest als Support-Referenz", () => {
    const error = Object.assign(new Error("Test"), { digest: "abc123def" });
    render(<ErrorBoundary error={error} reset={vi.fn()} />);

    expect(screen.getByText(/abc123def/)).toBeInTheDocument();
  });

  it("ruft reset() bei Klick auf den Retry-Button", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<ErrorBoundary error={new Error("Test")} reset={reset} />);

    await user.click(screen.getByRole("button", { name: t.retry }));

    expect(reset).toHaveBeenCalledOnce();
  });

  it("stoppt Retries nach dem Limit und zeigt den Max-Hinweis", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<ErrorBoundary error={new Error("Test")} reset={reset} />);

    const button = screen.getByRole("button", { name: t.retry });
    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(reset).toHaveBeenCalledTimes(3);
    expect(
      screen.queryByRole("button", { name: t.retry }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(t.maxRetries)).toBeInTheDocument();
  });
});
