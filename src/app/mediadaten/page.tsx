import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Mediadaten",
  description: `Mediadaten und Werbemöglichkeiten bei der ${SITE_CONFIG.name}`,
  alternates: {
    canonical: "/mediadaten",
  },
  openGraph: {
    title: `Mediadaten | ${SITE_CONFIG.name}`,
    description: `Mediadaten und Werbemöglichkeiten bei der ${SITE_CONFIG.name}`,
    images: [{ url: SITE_CONFIG.logo, alt: SITE_CONFIG.name }],
  },
};

export default function MediadatenPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold font-heading text-(--color-text) mb-6">
        Mediadaten
      </h1>
      <div className="prose max-w-none text-(--color-text)">
        <p>
          Sie möchten in der {SITE_CONFIG.name} werben? Hier finden Sie unsere
          aktuellen Mediadaten und Konditionen.
        </p>
        <h2>Werbeformate</h2>
        <p>
          Wir bieten verschiedene Werbeformate an — von klassischen
          Display-Anzeigen über Native Advertising bis hin zu
          Sponsored-Content-Kooperationen.
        </p>
        <h2>Reichweite</h2>
        <p>
          Die {SITE_CONFIG.name} erreicht monatlich ein breites Publikum in
          Berlin und der Metropolregion. Detaillierte Reichweitenzahlen erhalten
          Sie auf Anfrage.
        </p>
        <h2>Kontakt für Werbeanfragen</h2>
        <p>
          E-Mail:{" "}
          <a
            href="mailto:anzeigen@berliner-rundschau.de"
            className="text-(--color-link) hover:text-(--color-link-hover) transition-colors"
          >
            anzeigen@berliner-rundschau.de
          </a>
        </p>
      </div>
      <div className="mt-8 pt-6 border-t border-(--color-divider)">
        <Link
          href="/"
          className="text-sm font-medium text-(--color-link) hover:text-(--color-link-hover) transition-colors"
        >
          &larr; Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
}
