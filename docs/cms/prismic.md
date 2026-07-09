# Prismic — Adapter-Guide

> SaaS Headless CMS mit Document-basiertem Content-Modell. REST + GraphQL API.

## Voraussetzungen

- Prismic-Repository
- Write API Token (Settings → API & Security → Generate a Write Token) für Seed-Script

## 1. Demo-Daten erstellen

```bash
node cms-seeds/seed-prismic.mjs --repo <repo-name> --write-token <write-api-token>
```

- Content API Token (Read) reicht nicht für das Seed-Script
- Erstellt Custom Types + Documents + publiziert
- Idempotent
- **Am Ende gibt das Script die exakten `.env.local`-Werte aus**
- **Nach dem Seed:** Im Prismic-Dashboard alle Dokumente über "Migration release" publizieren

## 2. Konfiguration (.env.local)

Die Ausgabe vom Seed-Script in `.env.local` eintragen:

```bash
CMS_ADAPTER=prismic
PRISMIC_REPOSITORY=<dein-repo-name>
CMS_IMAGE_DOMAINS=images.prismic.io
```

Optionale Felder:

```bash
# PRISMIC_ACCESS_TOKEN=           # nur bei privaten Repositories
# PRISMIC_ARTICLE_TYPE=article    # Custom-Type Name (Default: article)
# PRISMIC_FIELD_MAP={}            # Custom-Felder remappen
```

## 3. Starten

```bash
npm run dev
# → http://localhost:3000
```

## Besonderheiten

- **Document-basiert:** Content ist in "Documents" mit Custom Types organisiert — jeder Custom Type definiert die Felder
- **Rich Text als Slices:** Body-Feld als Prismic Rich Text (proprietäres Format) — der Adapter konvertiert zu HTML
- **CDN-Bilder:** Bilder über `images.prismic.io`
- **Predicates-API:** Abfragen über Predicates (`at`, `fulltext`, `similar`) statt SQL/GROQ
- **Ref-basiert:** Jede API-Abfrage braucht eine `ref` (Master-Ref für published Content)
- **Migration Release:** Nach dem Seed müssen Dokumente im Dashboard über "Migration release" publiziert werden — der CDN liefert nur Published Content

## Troubleshooting

| Problem | Lösung |
|---|---|
| Leere Ergebnisse | Repository-Name korrekt? Content published? "Migration release" gemacht? |
| Bilder fehlen | `CMS_IMAGE_DOMAINS=images.prismic.io` gesetzt? |
| 403 Forbidden | Access Token nötig? Unter Settings → API & Security prüfen |
