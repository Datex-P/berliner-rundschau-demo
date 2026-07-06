// Design tokens for JS access — mirrors CSS Custom Properties from globals.css
// Use CSS variables in Tailwind classes whenever possible; this file is for
// cases where JS needs color values (e.g. chart libraries, canvas, dynamic styles).

export const colors = {
  light: {
    primary: "var(--color-primary)",
    onPrimary: "var(--color-on-primary)",
    secondary: "var(--color-secondary)",
    accent: "var(--color-accent)",
    background: "var(--color-bg)",
    text: "var(--color-text)",
  },
  dark: {
    background: "var(--color-bg)",
    text: "var(--color-text)",
  },
} as const;
