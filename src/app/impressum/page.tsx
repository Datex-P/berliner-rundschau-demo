import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Impressum",
  description: `Impressum der ${SITE_CONFIG.name} — Angaben gemäß § 5 TMG`,
  alternates: {
    canonical: "/impressum",
  },
  openGraph: {
    title: `Impressum | ${SITE_CONFIG.name}`,
    description: `Impressum der ${SITE_CONFIG.name} — Angaben gemäß § 5 TMG`,
    images: [{ url: SITE_CONFIG.logo, alt: SITE_CONFIG.name }],
  },
};

export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold font-heading text-(--color-text) mb-6">
        Impressum
      </h1>
      <div className="prose max-w-none text-(--color-text)">
        <div className="rounded-lg border-2 border-(--color-warning) bg-(--color-warning-light) p-4 mb-8">
          <p className="text-(--color-warning-text) font-semibold m-0">
            Dies ist ein technisches Demo-Projekt. Die Berliner Rundschau ist
            keine echte Nachrichtenseite. Alle Inhalte, Autoren und
            Redaktionsdaten sind fiktiv und dienen ausschließlich zur
            Demonstration des Tech-Stacks.
          </p>
        </div>
        <h2>Hinweis</h2>
        <p>
          Diese Website ist ein Portfolio- und Showcase-Projekt, erstellt mit
          Next.js 16, React 19 und Tailwind CSS v4. Sie dient der Demonstration
          moderner Web-Entwicklung und ist nicht als Nachrichtenquelle gedacht.
        </p>
        <p>
          Alle Artikel, Autorennamen und redaktionellen Inhalte sind frei
          erfunden. Ähnlichkeiten mit realen Personen oder Ereignissen sind
          zufällig.
        </p>
        <h2>Kontakt</h2>
        <p>
          Fabian Weiss
          <br />
          E-Mail:{" "}
          <a
            href="mailto:fabian.weiss@outlook.com"
            className="text-(--color-link) hover:text-(--color-link-hover) transition-colors"
          >
            fabian.weiss@outlook.com
          </a>
        </p>
        <h2>Quellcode</h2>
        <p>
          Der vollständige Quellcode ist öffentlich verfügbar auf{" "}
          <a
            href="https://github.com/Datex-P/berliner-rundschau-demo"
            className="text-(--color-link) hover:text-(--color-link-hover) transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          .
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
