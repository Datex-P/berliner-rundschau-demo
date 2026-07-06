import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GlobalError from "../global-error";

const isGerman = "de-DE".startsWith("de");
const t = isGerman
  ? {
      title: "Kritischer Fehler",
      retry: /erneut versuchen/i,
      maxRetries: /maximale versuche erreicht/i,
    }
  : {
      title: "Critical error",
      retry: /try again/i,
      maxRetries: /maximum number of retries reached/i,
    };

/**
 * GlobalError rendert <html><body>... — Testing Librarys Standard-render()
 * erstellt einen <div> Container, was zu verschachteltem <html> führt.
 * Wir rendern direkt in document.body um das zu vermeiden.
 */
function renderGlobalError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return render(<GlobalError error={props.error} reset={props.reset} />, {
    container: document.body,
  });
}

describe("GlobalError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("zeigt Alert-Rolle und kritischen Fehlertitel", () => {
    renderGlobalError({ error: new Error("Testfehler"), reset: vi.fn() });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: t.title })).toBeInTheDocument();
  });

  it("rendert error.message NICHT im UI", () => {
    renderGlobalError({
      error: new Error("db-connection-string-leak"),
      reset: vi.fn(),
    });

    expect(
      screen.queryByText(/db-connection-string-leak/),
    ).not.toBeInTheDocument();
    expect(console.error).toHaveBeenCalled();
  });

  it("zeigt den digest als Support-Referenz", () => {
    const error = Object.assign(new Error("Test"), { digest: "xyz789" });
    renderGlobalError({ error, reset: vi.fn() });

    expect(screen.getByText(/xyz789/)).toBeInTheDocument();
  });

  it("ruft reset() bei Klick auf den Retry-Button", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    renderGlobalError({ error: new Error("Test"), reset });

    await user.click(screen.getByRole("button", { name: t.retry }));

    expect(reset).toHaveBeenCalledOnce();
  });

  it("zeigt Retry-Zähler mit verbleibenden Versuchen", () => {
    renderGlobalError({ error: new Error("Test"), reset: vi.fn() });

    expect(screen.getByRole("button", { name: t.retry })).toHaveTextContent(
      "3",
    );
  });

  it("stoppt Retries nach dem Limit und zeigt Max-Hinweis", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    renderGlobalError({ error: new Error("Test"), reset });

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

  it("rendert Fehlermeldung in einem main-Landmark", () => {
    renderGlobalError({ error: new Error("Test"), reset: vi.fn() });

    const alertEl = screen.getByRole("alert");
    expect(alertEl.tagName).toBe("MAIN");
    expect(alertEl).toBeVisible();
  });
});
