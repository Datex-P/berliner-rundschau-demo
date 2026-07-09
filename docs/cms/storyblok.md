# Storyblok — Adapter-Guide

> SaaS Headless CMS mit Visual Editor. SDK-basierter Adapter über `storyblok-js-client`.

## Voraussetzungen

- Storyblok-Account mit Space
- Personal Access Token (von app.storyblok.com → My Account) für Seed-Script

## 1. Demo-Daten erstellen

```bash
node cms-seeds/seed-storyblok.mjs --space-id <space-id> --token <personal-access-token>
```

- Erstellt Components + Stories, publiziert automatisch
- Idempotent
- **Am Ende gibt das Script die exakten `.env.local`-Werte aus**

## 2. Konfiguration (.env.local)

Die Ausgabe vom Seed-Script in `.env.local` eintragen:

```bash
CMS_ADAPTER=storyblok
STORYBLOK_ACCESS_TOKEN=<dein-token>
CMS_IMAGE_DOMAINS=a.storyblok.com
```

## 3. Starten

```bash
npm run dev
# → http://localhost:3000
```

## Besonderheiten

- **SDK-basiert:** Adapter nutzt `storyblok-js-client`
- **Asset-CDN:** Bilder über `a.storyblok.com`
- **Visual Editor:** Storyblok hat einen integrierten Visual Editor — für Preview muss die App als Storyblok-Preview-URL konfiguriert werden
- **Stories als Content:** Artikel sind "Stories" mit einem definierten Content-Type (Component)

## Troubleshooting

| Problem | Lösung |
|---|---|
| Bilder fehlen | `CMS_IMAGE_DOMAINS=a.storyblok.com` gesetzt? |
| Leere Daten | Token-Typ prüfen — Public Token reicht für published Content |
