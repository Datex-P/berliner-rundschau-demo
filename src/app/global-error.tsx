"use client";

import "./globals.css";
import { useEffect, useState } from "react";

const MAX_RETRIES = 3;

const STRINGS = {
  de: {
    title: "Kritischer Fehler",
    fallback: "Ein schwerwiegender Fehler ist aufgetreten.",
    retry: "Erneut versuchen",
    remaining: "verbleibend",
    maxRetries: "Maximale Versuche erreicht. Bitte laden Sie die Seite neu.",
  },
  en: {
    title: "Critical error",
    fallback: "A serious error occurred.",
    retry: "Try again",
    remaining: "left",
    maxRetries: "Maximum number of retries reached. Please reload the page.",
  },
} as const;

type SupportedLocale = keyof typeof STRINGS;

const locale: SupportedLocale = "de-DE".startsWith("de") ? "de" : "en";
const t = STRINGS[locale];

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const [retryCount, setRetryCount] = useState(0);

  // error.message enthaelt potenziell sensible Server-Details
  // (DB-Connection-Strings, Stack-Pfade, API-Keys) — NIEMALS im UI rendern.
  // Nur Server-Log + digest fuer Support-Referenz.
  useEffect(() => {
    console.error("[global-error-boundary]", {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  const handleRetry = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount((prev) => prev + 1);
      reset();
    }
  };

  return (
    <html lang="de-DE">
      <body>
        <main
          role="alert"
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            {t.title}
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary, #6b7280)",
              marginBottom: "1.5rem",
            }}
          >
            {t.fallback}
          </p>
          {error.digest && (
            <p
              style={{
                color: "var(--color-text-tertiary, #9ca3af)",
                fontSize: "0.75rem",
                marginBottom: "1rem",
                fontFamily: "monospace",
              }}
            >
              Ref: {error.digest}
            </p>
          )}
          {retryCount < MAX_RETRIES ? (
            <button
              type="button"
              onClick={handleRetry}
              style={{
                padding: "0.5rem 1.5rem",
                backgroundColor: "var(--color-primary, #3b82f6)",
                color: "var(--color-on-primary, #ffffff)",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {t.retry} ({MAX_RETRIES - retryCount} {t.remaining})
            </button>
          ) : (
            <p
              style={{ color: "var(--color-error, #ef4444)", fontWeight: 500 }}
            >
              {t.maxRetries}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
