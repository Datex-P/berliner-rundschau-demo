import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import SearchClient from "@/components/SearchClient";

export const metadata: Metadata = {
  title: "Suche",
  description: `Durchsuchen Sie alle Artikel der ${SITE_CONFIG.name}`,
  openGraph: {
    title: `Suche | ${SITE_CONFIG.name}`,
    description: `Durchsuchen Sie alle Artikel der ${SITE_CONFIG.name}`,
  },
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold font-heading text-(--color-text) mb-6">
        Suche
      </h1>
      <SearchClient />
    </div>
  );
}
