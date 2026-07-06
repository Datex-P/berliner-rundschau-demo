"use client";

import ErrorBoundaryContent from "@/components/ErrorBoundaryContent";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthorError({ error, reset }: ErrorProps) {
  return (
    <ErrorBoundaryContent
      title="Autor konnte nicht geladen werden"
      contextMessage="Beim Laden der Autorenseite ist ein Fehler aufgetreten."
      error={error}
      reset={reset}
    />
  );
}
