# Deployment-Leitfaden — Berliner Rundschau

> Deploy-Target: **Vercel** | Framework: **Next.js 16 (App Router)**

---

## Vercel-Deployment

### Option 1: Git-Integration (empfohlen)

1. Repository bei GitHub, GitLab oder Bitbucket hosten
2. Auf [vercel.com](https://vercel.com) anmelden und "Add New Project" klicken
3. Repository auswählen — Vercel erkennt Next.js automatisch
4. Umgebungsvariablen eintragen (siehe Abschnitt unten)
5. "Deploy" klicken

Jeder Push auf den Haupt-Branch löst automatisch ein neues Deployment aus. Pull Requests erhalten Preview-URLs.

### Option 2: Vercel CLI

```bash
# Vercel CLI installieren
npm i -g vercel

# Im Projektverzeichnis einloggen und deployen
vercel

# Produktion-Deployment
vercel --prod
```

### Build-Konfiguration

Vercel erkennt Next.js-Projekte automatisch. Manuelle Konfiguration ist nicht erforderlich.

| Einstellung | Wert |
|-------------|------|
| Build Command | `next build` (automatisch) |
| Output Directory | `.next` (automatisch) |
| Install Command | `npm install` (automatisch) |
| Node.js Version | 20.x oder höher empfohlen |

---

## Umgebungsvariablen in Vercel setzen

1. Vercel Dashboard → Projekt auswählen → **Settings** → **Environment Variables**
2. Folgende Variablen eintragen:

| Variable | Umgebung | Beschreibung |
|----------|----------|-------------|
| `REVALIDATION_SECRET` | Production, Preview | Geheimes Token für Cache-Invalidierung via `/api/revalidate`. Zufälligen Wert generieren: `openssl rand -hex 32` |
| `API_BASE_URL` | Production | Optionale Basis-URL (Standard: automatisch von Vercel erkannt) |

> Variablen aus `.env.example` als Referenz verwenden. Niemals `.env.local` committen.

---

## Custom Domain konfigurieren

1. Vercel Dashboard → Projekt → **Settings** → **Domains**
2. Domain eintragen (z.B. `berliner-rundschau.de`)
3. DNS-Einträge beim Domain-Anbieter setzen:
   - **CNAME:** `www` → `cname.vercel-dns.com`
   - **A-Record:** `@` → Vercel-IP-Adressen (im Dashboard angezeigt)
4. HTTPS wird von Vercel automatisch eingerichtet (Let's Encrypt)

---

## Security Headers

Security Headers sind bereits in `next.config.ts` konfiguriert und werden bei jedem Deployment automatisch angewendet:

- `Content-Security-Policy` (CSP)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `Strict-Transport-Security` (HSTS, max-age 2 Jahre)

Vollständige CSP-Konfiguration: `src/lib/security-headers.ts`

**Nach Deploy empfohlen:** Migration auf Nonce-basierte CSP (entfernt `unsafe-inline` aus `script-src`). Anleitung im Kommentar von `src/lib/security-headers.ts`.

---

## On-Demand Cache-Invalidierung

Das Projekt unterstützt On-Demand-Revalidierung via Webhook-Endpoint `POST /api/revalidate`.

Wenn ein externes CMS angebunden wird, dort einen Webhook auf diesen Endpoint konfigurieren:

```bash
curl -X POST https://ihre-domain.de/api/revalidate \
  -H "x-revalidate-secret: $REVALIDATION_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"tag": "articles"}'
```

Verfügbare Cache-Tags: `articles`, `categories`, `authors`, `navigation`, `videos`, `newsticker`, `breaking-news`, `search`, `quiz`, `stocks`, `site-config`, `slugs`.

---

## Pre-Deployment-Checkliste

Vor jedem Produktions-Deployment überprüfen:

- [ ] Umgebungsvariablen in Vercel gesetzt (`REVALIDATION_SECRET`)
- [ ] Build erfolgreich: `npm run build`
- [ ] Tests bestanden: `npm run test:run`
- [ ] Lint fehlerfrei: `npm run lint`
- [ ] TypeScript fehlerfrei: `npx tsc --noEmit`
- [ ] `.env.local` ist **nicht** in Git eingecheckt (`.gitignore` prüfen)
- [ ] Datenschutzerklärung und Impressum ausgefüllt
- [ ] `SITE_CONFIG.url` in `src/lib/config.ts` auf die Produktions-URL gesetzt

---

## Post-Deployment-Checkliste

Nach dem Deployment überprüfen:

- [ ] Website unter der Produktions-URL erreichbar
- [ ] Startseite lädt Artikel, Newsticker und Videos
- [ ] Artikeldetailseite öffnet sich korrekt
- [ ] Suche liefert Ergebnisse
- [ ] Mobile Ansicht überprüfen (Breakpoints: 640px, 768px, 1024px, 1280px)
- [ ] Dark Mode umschaltbar
- [ ] Security Headers korrekt gesetzt (prüfen mit [securityheaders.com](https://securityheaders.com))
- [ ] `robots.txt` unter `/robots.txt` erreichbar
- [ ] HTTPS aktiv und Weiterleitung von HTTP funktioniert

---

## Rollback

Falls ein Deployment fehlschlägt:

1. Vercel Dashboard → Projekt → **Deployments**
2. Letztes funktionierendes Deployment suchen
3. Drei-Punkte-Menü → **Promote to Production**

---

## Monitoring & Logs

- **Vercel Dashboard** → Deployment → **Functions** → Live-Logs abrufbar
- **Build-Logs** im Vercel Dashboard unter jedem Deployment
- **Runtime-Fehler** erscheinen im Vercel-Funktions-Log

---

## CI/CD via GitHub Actions

Das Projekt enthält `.github/workflows/ci.yml` mit automatischen Checks bei Pull Requests:
- TypeScript-Prüfung
- ESLint
- Vitest-Tests

Vercel-Deployment läuft separat über die native Vercel-GitHub-Integration.
