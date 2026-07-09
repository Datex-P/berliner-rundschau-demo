# DatoCMS — Adapter-Guide

> SaaS Headless CMS mit GraphQL API. Adapter nutzt die Content Delivery API (CDA).

## Voraussetzungen

- DatoCMS-Account mit Projekt
- Full-Access API Token (Settings → API Tokens) für Seed-Script

## 1. Demo-Daten erstellen

```bash
node cms-seeds/seed-datocms.mjs --token <full-access-api-token>
```

- Erstellt Models + Records + publiziert automatisch
- Idempotent
- **Am Ende gibt das Script die exakten `.env.local`-Werte aus**

## 2. Konfiguration (.env.local)

Die Ausgabe vom Seed-Script in `.env.local` eintragen. Wichtig: Die App braucht den **Read-Only Token** (nicht den Full-Access Token vom Seed):

```bash
CMS_ADAPTER=datocms
DATOCMS_API_TOKEN=<dein-read-only-token>
CMS_IMAGE_DOMAINS=www.datocms-assets.com
```

Den Read-Only Token findest du unter Settings → API Tokens.

## 3. Starten

```bash
npm run dev
# → http://localhost:3000
```

## Besonderheiten

- **GraphQL-only:** DatoCMS hat keine REST API für Content — der Adapter nutzt die GraphQL CDA
- **Zwei Token-Typen:** Full-Access (Seed-Script) und Read-Only (App) — nicht verwechseln
- **Structured Text:** Body-Feld als DatoCMS Structured Text (DAST) — der Adapter konvertiert zu HTML
- **Responsive Images:** DatoCMS liefert `responsiveImage` mit srcSet — der Adapter mappt das auf die interne Bild-Struktur
- **Lokalisierung:** DatoCMS unterstützt Multi-Locale nativ — bei Bedarf `DATOCMS_LOCALE` setzen
- **Slug-basierte Abfragen:** Einzelne Artikel werden über `filter: { slug: { eq: "..." } }` abgefragt

## Troubleshooting

| Problem | Lösung |
|---|---|
| 401 / Unauthorized | Read-Only Token (nicht Full-Access) für die App verwenden |
| Bilder fehlen | `CMS_IMAGE_DOMAINS=www.datocms-assets.com` gesetzt? |
| Leere Artikel | Content published? Draft-Content nur mit Preview-Token sichtbar |
| Structured Text nicht gerendert | `@datocms/structured-text-to-html-string` installiert? |
