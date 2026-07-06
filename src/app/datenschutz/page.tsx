import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: `Datenschutzerklärung der ${SITE_CONFIG.name}`,
  alternates: {
    canonical: "/datenschutz",
  },
  openGraph: {
    title: `Datenschutz | ${SITE_CONFIG.name}`,
    description: `Datenschutzerklärung der ${SITE_CONFIG.name}`,
    images: [{ url: SITE_CONFIG.logo, alt: SITE_CONFIG.name }],
  },
};

export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold font-heading text-(--color-text) mb-6">
        Datenschutzerklärung
      </h1>
      <div className="prose max-w-none text-(--color-text)">
        <p>
          Der Schutz Ihrer persönlichen Daten ist uns wichtig. Diese
          Datenschutzerklärung informiert Sie über Art, Umfang und Zweck der
          Verarbeitung personenbezogener Daten auf dieser Website.
        </p>
        <h2>Verantwortlicher</h2>
        <p>{SITE_CONFIG.name}</p>
        <h2>Erhebung und Verarbeitung von Daten</h2>
        <p>
          Beim Besuch unserer Website werden automatisch Informationen durch den
          Server-Log erfasst (IP-Adresse, Browsertyp, Zugriffszeit). Diese Daten
          sind nicht bestimmten Personen zuordenbar.
        </p>
        <h2>Cookies</h2>
        <p>
          Diese Website verwendet ein Cookie zur Speicherung Ihrer
          Theme-Präferenz (Hell-/Dunkelmodus). Dieses Cookie ist technisch
          notwendig und enthält keine personenbezogenen Daten.
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
