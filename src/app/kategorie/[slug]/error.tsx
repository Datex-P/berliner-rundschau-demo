"use client";

import ErrorBoundaryContent from "@/components/ErrorBoundaryContent";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CategoryError({ error, reset }: ErrorProps) {
  return (
    <ErrorBoundaryContent
      title="Kategorie konnte nicht geladen werden"
      contextMessage="Beim Laden der Kategorie ist ein Fehler aufgetreten."
      error={error}
      reset={reset}
    />
  );
}
