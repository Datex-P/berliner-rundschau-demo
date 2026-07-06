import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Kontakt",
  description: `Kontaktieren Sie die Redaktion der ${SITE_CONFIG.name}`,
  alternates: {
    canonical: "/kontakt",
  },
  openGraph: {
    title: `Kontakt | ${SITE_CONFIG.name}`,
    description: `Kontaktieren Sie die Redaktion der ${SITE_CONFIG.name}`,
    images: [{ url: SITE_CONFIG.logo, alt: SITE_CONFIG.name }],
  },
};

export default function KontaktPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold font-heading text-(--color-text) mb-6">
        Kontakt
      </h1>
      <div className="prose max-w-none text-(--color-text)">
        <p>
          Sie möchten mit uns in Kontakt treten? Wir freuen uns über Ihre
          Nachricht — ob Feedback, Hinweise oder Presseanfragen.
        </p>
        <h2>Redaktion</h2>
        <p>
          E-Mail:{" "}
          <a
            href="mailto:redaktion@berliner-rundschau.de"
            className="text-(--color-link) hover:text-(--color-link-hover) transition-colors"
          >
            redaktion@berliner-rundschau.de
          </a>
        </p>
        <h2>Anschrift</h2>
        <p>
          {SITE_CONFIG.name}
          <br />
          Musterstraße 1<br />
          10115 Berlin
        </p>
        <h2>Leserbriefe</h2>
        <p>
          Leserbriefe und Gastbeiträge senden Sie bitte an{" "}
          <a
            href="mailto:leserbriefe@berliner-rundschau.de"
            className="text-(--color-link) hover:text-(--color-link-hover) transition-colors"
          >
            leserbriefe@berliner-rundschau.de
          </a>
          . Bitte beachten Sie, dass wir uns eine Kürzung vorbehalten.
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
