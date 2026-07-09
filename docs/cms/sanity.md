# Sanity — Adapter-Guide

> SaaS Headless CMS mit GROQ-Query-Sprache. Echtzeit-Datenbank mit CDN.

## Voraussetzungen

- Sanity-Account mit Projekt
- Sanity CLI installiert (`npm install -g @sanity/cli`)
- `sanity login` ausführen (interaktiv im Browser — muss vor dem Seed-Script passieren)

## 1. Demo-Daten erstellen

```bash
# Vorher einmalig: sanity login
node cms-seeds/seed-sanity.mjs --project-id <project-id> --dataset production
```

- Nutzt das Sanity CLI Token (kein separater API-Token nötig)
- Erstellt Documents via Mutations API
- Idempotent
- **Am Ende gibt das Script die exakten `.env.local`-Werte aus**

## 2. Konfiguration (.env.local)

Die Ausgabe vom Seed-Script in `.env.local` eintragen:

```bash
CMS_ADAPTER=sanity
SANITY_PROJECT_ID=<deine-project-id>
SANITY_DATASET=production
CMS_IMAGE_DOMAINS=cdn.sanity.io
```

## 3. Starten

```bash
npm run dev
# → http://localhost:3000
```

## Besonderheiten

- **GROQ statt GraphQL/REST:** Sanity nutzt GROQ (Graph-Relational Object Queries) — eine eigene Query-Sprache
- **Portable Text:** Body als Portable Text (Block Content) — der Adapter konvertiert zu HTML via `@portabletext/to-html`
- **Image Pipeline:** Bilder über `cdn.sanity.io` mit On-the-fly-Transformationen (Crop, Hotspot, Resize)
- **Echtzeit:** Sanity Listener API ermöglicht Live-Updates (nicht im Adapter genutzt)
- **Login ist interaktiv:** `sanity login` öffnet den Browser — kann nicht automatisiert werden

## Troubleshooting

| Problem | Lösung |
|---|---|
| 401 / Unauthorized | `sanity login` ausgeführt? Token gültig? |
| Bilder fehlen | `CMS_IMAGE_DOMAINS=cdn.sanity.io` gesetzt? |
| GROQ-Fehler | Query-Syntax prüfen — GROQ ≠ GraphQL |
