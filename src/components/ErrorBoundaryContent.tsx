"use client";

import { useState } from "react";

const MAX_RETRIES = 3;

interface ErrorBoundaryContentProps {
  title: string;
  contextMessage: string;
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundaryContent({
  title,
  contextMessage,
  error,
  reset,
}: ErrorBoundaryContentProps) {
  const [retryCount, setRetryCount] = useState(0);

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
        <h2 className="text-2xl font-bold text-(--color-text) mb-4">{title}</h2>
        <p className="text-(--color-text-secondary) mb-6">{contextMessage}</p>
        {error.digest && (
          <p className="text-xs text-(--color-text-tertiary) mb-4 font-mono">
            Ref: {error.digest}
          </p>
        )}
        {retryCount < MAX_RETRIES ? (
          <button
            type="button"
            onClick={handleRetry}
            className="px-6 py-2 bg-(--color-primary) text-(--color-on-primary) rounded-lg font-medium hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
          >
            Erneut versuchen ({MAX_RETRIES - retryCount} verbleibend)
          </button>
        ) : (
          <p className="text-(--color-error) font-medium">
            Maximale Versuche erreicht. Bitte laden Sie die Seite neu.
          </p>
        )}
      </div>
    </div>
  );
}
