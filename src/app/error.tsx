"use client";

import { useEffect, useState } from "react";

const MAX_RETRIES = 3;

const STRINGS = {
  de: {
    title: "Etwas ist schiefgelaufen",
    fallback: "Ein unerwarteter Fehler ist aufgetreten.",
    retry: "Erneut versuchen",
    remaining: "verbleibend",
    maxRetries: "Maximale Versuche erreicht. Bitte laden Sie die Seite neu.",
  },
  en: {
    title: "Something went wrong",
    fallback: "An unexpected error occurred.",
    retry: "Try again",
    remaining: "left",
    maxRetries: "Maximum number of retries reached. Please reload the page.",
  },
} as const;

type SupportedLocale = keyof typeof STRINGS;

const locale: SupportedLocale = "de-DE".startsWith("de") ? "de" : "en";
const t = STRINGS[locale];

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [retryCount, setRetryCount] = useState(0);

  // error.message enthaelt potenziell sensible Server-Details
  // (DB-Connection-Strings, Stack-Pfade, API-Keys) — NIEMALS im UI rendern.
  // Nur Server-Log + digest fuer Support-Referenz.
  useEffect(() => {
    console.error("[error-boundary]", {
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
    <div
      role="alert"
      className="flex min-h-[50vh] flex-col items-center justify-center px-4"
    >
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4">
          {t.title}
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-6">{t.fallback}</p>
        {error.digest && (
          <p className="text-xs text-[var(--color-text-tertiary)] mb-4 font-mono">
            Ref: {error.digest}
          </p>
        )}
        {retryCount < MAX_RETRIES ? (
          <button
            type="button"
            onClick={handleRetry}
            className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-text-inverse)] rounded-lg font-medium hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          >
            {t.retry} ({MAX_RETRIES - retryCount} {t.remaining})
          </button>
        ) : (
          <p className="text-[var(--color-error)] font-medium">
            {t.maxRetries}
          </p>
        )}
      </div>
    </div>
  );
}
