"use client";

import ErrorBoundaryContent from "@/components/ErrorBoundaryContent";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ArticleError({ error, reset }: ErrorProps) {
  return (
    <ErrorBoundaryContent
      title="Artikel konnte nicht geladen werden"
      contextMessage="Beim Laden des Artikels ist ein Fehler aufgetreten."
      error={error}
      reset={reset}
    />
  );
}
