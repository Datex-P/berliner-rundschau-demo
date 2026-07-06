import { renderHook } from "@testing-library/react";
import { vi, describe, it, expect, afterEach } from "vitest";
import { useFocusTrap } from "../useFocusTrap";
import { createRef } from "react";

afterEach(() => {
  vi.restoreAllMocks();
  document.body.style.overflow = "";
  document.body.innerHTML = "";
});

function createContainerWithFocusables(): HTMLDivElement {
  const container = document.createElement("div");
  const btn1 = document.createElement("button");
  btn1.textContent = "Erster";
  const btn2 = document.createElement("button");
  btn2.textContent = "Zweiter";
  const btn3 = document.createElement("button");
  btn3.textContent = "Dritter";
  container.append(btn1, btn2, btn3);
  document.body.appendChild(container);
  return container;
}

describe("useFocusTrap", () => {
  it("setzt Fokus auf erstes fokussierbares Element bei Aktivierung", () => {
    const container = createContainerWithFocusables();
    const ref = createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>;
    (ref as { current: HTMLDivElement }).current = container;

    renderHook(() => useFocusTrap(ref, true));

    expect(document.activeElement).toBe(container.querySelector("button"));
  });

  it("sperrt Body-Scroll bei Aktivierung", () => {
    const container = createContainerWithFocusables();
    const ref = createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>;
    (ref as { current: HTMLDivElement }).current = container;

    renderHook(() => useFocusTrap(ref, true));

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("entsperrt Body-Scroll bei Deaktivierung", () => {
    const container = createContainerWithFocusables();
    const ref = createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>;
    (ref as { current: HTMLDivElement }).current = container;

    const { unmount } = renderHook(() => useFocusTrap(ref, true));
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("ruft onClose bei Escape-Taste auf", () => {
    const container = createContainerWithFocusables();
    const ref = createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>;
    (ref as { current: HTMLDivElement }).current = container;
    const onClose = vi.fn();

    renderHook(() => useFocusTrap(ref, true, onClose));

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("wrapt Fokus von letztem zum ersten Element bei Tab", () => {
    const container = createContainerWithFocusables();
    const ref = createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>;
    (ref as { current: HTMLDivElement }).current = container;
    const buttons = container.querySelectorAll("button");
    const lastButton = buttons[buttons.length - 1];

    renderHook(() => useFocusTrap(ref, true));

    (lastButton as HTMLElement).focus();
    expect(document.activeElement).toBe(lastButton);

    const tabEvent = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(tabEvent);

    expect(document.activeElement).toBe(buttons[0]);
  });

  it("wrapt Fokus von erstem zum letzten Element bei Shift+Tab", () => {
    const container = createContainerWithFocusables();
    const ref = createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>;
    (ref as { current: HTMLDivElement }).current = container;
    const buttons = container.querySelectorAll("button");
    const firstButton = buttons[0];
    const lastButton = buttons[buttons.length - 1];

    renderHook(() => useFocusTrap(ref, true));

    (firstButton as HTMLElement).focus();

    const shiftTabEvent = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(shiftTabEvent);

    expect(document.activeElement).toBe(lastButton);
  });

  it("tut nichts wenn isActive false ist", () => {
    const container = createContainerWithFocusables();
    const ref = createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>;
    (ref as { current: HTMLDivElement }).current = container;

    renderHook(() => useFocusTrap(ref, false));

    expect(document.body.style.overflow).not.toBe("hidden");
    expect(document.activeElement).not.toBe(container.querySelector("button"));
  });

  it("stellt vorherigen Fokus nach Deaktivierung wieder her", () => {
    const outsideButton = document.createElement("button");
    outsideButton.textContent = "Außen";
    document.body.appendChild(outsideButton);
    outsideButton.focus();
    expect(document.activeElement).toBe(outsideButton);

    const container = createContainerWithFocusables();
    const ref = createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>;
    (ref as { current: HTMLDivElement }).current = container;

    const { unmount } = renderHook(() => useFocusTrap(ref, true));
    expect(document.activeElement).toBe(container.querySelector("button"));

    unmount();
    expect(document.activeElement).toBe(outsideButton);
  });
});
