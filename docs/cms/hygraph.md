# Hygraph — Adapter-Guide

> SaaS Headless CMS (ehemals GraphCMS). Ausschließlich GraphQL API.

## Voraussetzungen

- Hygraph-Account mit Projekt
- Management API Token (Settings → API Access → Permanent Auth Tokens) mit `Mutations`-Permission für Seed-Script

## 1. Demo-Daten erstellen

```bash
node cms-seeds/seed-hygraph.mjs --endpoint <content-api-endpoint> --token <management-api-token>
```

- Content API Endpoint findest du unter Settings → API Access → Content API
- Erstellt Schema + Content via GraphQL Mutations
- Idempotent
- **Am Ende gibt das Script die exakten `.env.local`-Werte aus**

## 2. Konfiguration (.env.local)

Die Ausgabe vom Seed-Script in `.env.local` eintragen:

```bash
CMS_ADAPTER=hygraph
HYGRAPH_ENDPOINT=<dein-content-api-endpoint>
# HYGRAPH_ACCESS_TOKEN=           # nur bei Permanent Auth Token
CMS_IMAGE_DOMAINS=media.graphassets.com
```

Optionale Felder:

```bash
# HYGRAPH_STAGE=PUBLISHED         # Content Stage (Default: PUBLISHED)
# HYGRAPH_ARTICLE_MODEL=Article   # Model-Name (Default: Article)
# HYGRAPH_FIELD_MAP={}            # Custom-Felder remappen
```

## 3. Starten

```bash
npm run dev
# → http://localhost:3000
```

## Besonderheiten

- **GraphQL-only:** Hygraph hat keine REST API — alle Abfragen und Mutationen über GraphQL
- **Rich Text als AST:** Body-Feld als Hygraph Rich Text (AST-Format) — der Adapter konvertiert zu HTML
- **Asset-CDN:** Bilder über `media.graphassets.com`
- **Stages:** Hygraph unterstützt Content Stages (DRAFT, PUBLISHED) — nur PUBLISHED wird über die Content API geliefert
- **Lokalisierung:** Multi-Locale Support nativ eingebaut

## Troubleshooting

| Problem | Lösung |
|---|---|
| 401 / Unauthorized | Token als Permanent Auth Token mit Lese-Permissions? |
| Bilder fehlen | `CMS_IMAGE_DOMAINS=media.graphassets.com` gesetzt? |
| Leere Daten | Content auf Stage PUBLISHED? Draft-Content nur mit Draft-Token |
| GraphQL-Fehler | Endpoint korrekt? Format: `https://api-{region}.hygraph.com/v2/{id}/master` |
