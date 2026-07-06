import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { ErrorReporter } from "@/components/ErrorReporter";

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

describe("ErrorReporter", () => {
  let addSpy: ReturnType<typeof vi.spyOn>;
  let removeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addSpy = vi.spyOn(window, "addEventListener");
    removeSpy = vi.spyOn(window, "removeEventListener");
  });

  it("registriert error- und unhandledrejection-Listener beim Mount", () => {
    render(<ErrorReporter />);

    const errorCall = addSpy.mock.calls.find(([type]) => type === "error");
    const rejectionCall = addSpy.mock.calls.find(
      ([type]) => type === "unhandledrejection",
    );

    expect(errorCall).toBeDefined();
    expect(rejectionCall).toBeDefined();
  });

  it("entfernt Listener beim Unmount", () => {
    const { unmount } = render(<ErrorReporter />);
    unmount();

    const errorCall = removeSpy.mock.calls.find(([type]) => type === "error");
    const rejectionCall = removeSpy.mock.calls.find(
      ([type]) => type === "unhandledrejection",
    );

    expect(errorCall).toBeDefined();
    expect(rejectionCall).toBeDefined();
  });

  it("loggt unhandled rejection Fehler", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorReporter />);

    const rejectionHandler = addSpy.mock.calls.find(
      ([type]) => type === "unhandledrejection",
    )?.[1] as EventListener;

    const event = new Event("unhandledrejection") as PromiseRejectionEvent;
    Object.defineProperty(event, "reason", { value: "Test rejection" });
    rejectionHandler(event);

    expect(consoleSpy).toHaveBeenCalledWith(
      "[Unhandled Rejection]",
      "Test rejection",
    );
  });

  it("loggt window error Fehler", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorReporter />);

    const errorHandler = addSpy.mock.calls.find(
      ([type]) => type === "error",
    )?.[1] as EventListener;

    const event = new Event("error") as ErrorEvent;
    Object.defineProperty(event, "error", { value: new Error("Test error") });
    errorHandler(event);

    expect(consoleSpy).toHaveBeenCalledWith(
      "[Window Error]",
      expect.any(Error),
    );
  });

  it("rendert nichts (null)", () => {
    const { container } = render(<ErrorReporter />);
    expect(container.firstChild).toBeNull();
  });
});
