import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorState from "@/components/ErrorState";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ErrorState", () => {
  it("rendert eine Alert-Rolle", () => {
    render(<ErrorState />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("zeigt die Standard-Fehlermeldung wenn keine message-Prop übergeben wird", () => {
    render(<ErrorState />);
    expect(
      screen.getByText(
        "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
      ),
    ).toBeInTheDocument();
  });

  it("zeigt eine benutzerdefinierte Fehlermeldung", () => {
    render(<ErrorState message="Daten konnten nicht geladen werden." />);
    expect(
      screen.getByText("Daten konnten nicht geladen werden."),
    ).toBeInTheDocument();
  });

  it("zeigt keinen Retry-Button wenn onRetry nicht übergeben wird", () => {
    render(<ErrorState />);
    expect(
      screen.queryByRole("button", { name: /erneut versuchen/i }),
    ).not.toBeInTheDocument();
  });

  it("zeigt den Retry-Button wenn onRetry übergeben wird", () => {
    render(<ErrorState onRetry={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /erneut versuchen/i }),
    ).toBeInTheDocument();
  });

  it("ruft onRetry bei Klick auf den Retry-Button auf", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: /erneut versuchen/i }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("versteckt das Fehler-Icon vor Screenreadern", () => {
    render(<ErrorState />);
    const alert = screen.getByRole("alert");
    const hiddenIcon = alert.querySelector('[aria-hidden="true"]');
    expect(hiddenIcon).toBeInTheDocument();
  });
});
