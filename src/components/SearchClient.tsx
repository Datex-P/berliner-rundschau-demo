"use client";

import { useState, useEffect, useId, useTransition } from "react";
import ArticleCard from "@/components/ArticleCard";
import ErrorState from "@/components/ErrorState";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { Article } from "@/types";

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, startTransition] = useTransition();
  const [retryKey, setRetryKey] = useState(0);
  const inputId = useId();

  const activeQuery = query.length >= 2 ? debouncedQuery : "";

  useEffect(() => {
    if (query.length < 2) return;
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!activeQuery) return;

    const controller = new AbortController();

    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(activeQuery)}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error("Suche fehlgeschlagen");
        const data = await res.json();
        setResults(data);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err : new Error("Unbekannter Fehler"));
      }
    });

    return () => controller.abort();
  }, [activeQuery, retryKey]);

  const handleRetry = () => {
    setError(null);
    setRetryKey((k) => k + 1);
  };

  return (
    <div>
      <form
        role="search"
        className="relative"
        onSubmit={(e) => e.preventDefault()}
      >
        <label htmlFor={inputId} className="sr-only">
          Suchbegriff eingeben
        </label>
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Artikel suchen…"
          className="w-full px-5 py-3 pl-12 text-base rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-text) placeholder:text-(--color-text-tertiary) focus-visible:outline-2 focus-visible:outline-(--color-focus-ring) focus-visible:outline-offset-2"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-text-tertiary)"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </form>

      {query.length > 0 && query.length < 2 && (
        <p className="mt-4 text-sm text-(--color-text-tertiary)">
          Bitte mindestens 2 Zeichen eingeben.
        </p>
      )}

      {/* aria-live Statusregion fuer Screenreader-Feedback */}
      <div aria-live="polite" role="status" className="sr-only">
        {isPending && "Suche läuft…"}
        {!isPending &&
          !error &&
          activeQuery &&
          `${results.length} ${results.length === 1 ? "Ergebnis" : "Ergebnisse"} für „${activeQuery}"`}
        {error && "Suche fehlgeschlagen. Erneut versuchen."}
      </div>

      {isPending && <LoadingSpinner label="Suche läuft…" />}

      {error && (
        <ErrorState
          message="Die Suche konnte nicht durchgeführt werden."
          onRetry={handleRetry}
        />
      )}

      {!isPending && !error && activeQuery && (
        <>
          {results.length > 0 ? (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-(--color-text-secondary)">
                {results.length}{" "}
                {results.length === 1 ? "Ergebnis" : "Ergebnisse"} für &ldquo;
                {activeQuery}&rdquo;
              </p>
              <ul
                role="list"
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 list-none p-0 m-0"
              >
                {results.map((article) => (
                  <li key={article.id}>
                    <ArticleCard article={article} headingLevel="h2" />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-8 text-center text-(--color-text-secondary)">
              Keine Ergebnisse für &ldquo;{activeQuery}&rdquo; gefunden.
            </p>
          )}
        </>
      )}
    </div>
  );
}
