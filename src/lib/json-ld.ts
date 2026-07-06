// JSON-LD Structured Data
// Utility-Funktionen fuer Schema.org JSON-LD in Next.js Server Components.
// Scaffolded — NICHT neu erstellen. Anpassen erlaubt (CMS-Feldnamen variieren).
//
// CANONICAL REMINDER (Next.js):
// Canonical URLs werden per `alternates: { canonical: '...' }` in generateMetadata gesetzt.
// Kein separates Utility noetig. Auf JEDER Page setzen, nicht nur Detail-Pages.

type JsonLdInput = Record<string, unknown>;

export function articleJsonLd(opts: {
  headline: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  publisher: string;
  description?: string;
}): JsonLdInput {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    image: opts.image,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    author: { "@type": "Person", name: opts.author },
    publisher: { "@type": "Organization", name: opts.publisher },
    description: opts.description,
  };
}

export function collectionPageJsonLd(
  name: string,
  url: string,
  description?: string,
): JsonLdInput {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url,
    description,
  };
}

export function personJsonLd(
  name: string,
  url?: string,
  image?: string,
): JsonLdInput {
  const data: JsonLdInput = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
  };
  if (url) data.url = url;
  if (image) data.image = image;
  return data;
}
