# Developer Handoff — Berliner Rundschau

> Generiert vom Frontend-Generator. Zielgruppe: Entwickler und Agentur-Teams.

---

## Tech-Stack

| Technologie | Version | Zweck |
|-------------|---------|-------|
| Next.js | ^16.0.0 | Framework (App Router) |
| React | ^19.0.0 | UI-Bibliothek |
| TypeScript | ^5.8.0 | Typsicherheit (Strict Mode) |
| Tailwind CSS | ^4.0.0 | Utility-first Styling |
| Vitest | ^3.1.0 | Unit-Tests |
| @testing-library/react | ^16.3.0 | Komponentenintegrationstests |
| isomorphic-dompurify | ^2.20.0 | HTML-Sanitierung (Rich Text) |
| zod | ^3.24.0 | Schema-Validierung |
| clsx + tailwind-merge | ^2.1.1 / ^3.5.0 | Klassen-Utilities |
| server-only | ^0.0.1 | Server-Only-Modul-Guard |
| hls.js | ^1.6.16 | HLS-Video-Streaming |

**Fonts:** Merriweather (Überschriften) + Source Sans 3 (Fließtext) — beide via `next/font/google`, Build-Zeit-Einbettung.

---

## Projekt-Struktur

```
berliner-rundschau/
├── src/
│   ├── app/                        # Next.js App Router — Seiten und Layouts
│   │   ├── layout.tsx              # Root-Layout (Fonts, Navigation, ThemeProvider)
│   │   ├── page.tsx                # Startseite (Artikel, Newsticker, Videos)
│   │   ├── artikel/[slug]/         # Artikeldetail-Route
│   │   ├── kategorie/[slug]/       # Kategorie-Übersichtsseite
│   │   ├── autor/[slug]/           # Autorenprofilseite
│   │   ├── suche/                  # Volltextsuchseite
│   │   ├── datenschutz/            # Datenschutzseite
│   │   ├── not-found.tsx           # 404-Seite
│   │   ├── error.tsx               # Route-Level-Error-Boundary
│   │   ├── global-error.tsx        # Globale Error-Boundary
│   │   ├── robots.ts               # robots.txt-Generierung
│   │   └── __tests__/              # Seitentests
│   ├── components/                 # Wiederverwendbare Komponenten
│   │   ├── AppHeader.tsx           # Globaler Header mit Navigation
│   │   ├── AppFooter.tsx           # Globaler Footer
│   │   ├── ArticleCard.tsx         # Artikel-Karte (hero, default, compact)
│   │   ├── SearchClient.tsx        # Client-Side-Suchkomponente
│   │   ├── ThemeProvider.tsx       # Dark-Mode-Context-Provider
│   │   ├── ThemeToggle.tsx         # Dark/Light-Toggle-Button
│   │   ├── FocusManager.tsx        # Routenwechsel-Fokusmanagement
│   │   ├── ErrorReporter.tsx       # Globaler Fehler-Reporter (unhandledrejection)
│   │   ├── ErrorState.tsx          # Wiederverwendbarer Fehlerzustand
│   │   ├── LoadingSpinner.tsx      # Lade-Indikator
│   │   └── ui/                     # Primitive UI-Komponenten
│   │       ├── SanitizedHtml.tsx   # DOMPurify-gesichertes Rich-Text-Rendering
│   │       ├── SafeImage.tsx       # next/image mit Fallback-Handler
│   │       ├── SkipLink.tsx        # Barrierefreiheit: Skip-to-Content
│   │       ├── ExternalLink.tsx    # Externe Links mit rel="noopener"
│   │       └── BadgeGroup.tsx      # Tag/Badge-Darstellung
│   ├── lib/                        # Logik-Layer
│   │   ├── data.ts                 # Data Access Layer (Cache Components)
│   │   ├── mock.ts                 # Mock-CMS-Transport-Layer (Inline-Daten)
│   │   ├── config.ts               # Site-Konfiguration (URL, Name, Dimensionen)
│   │   ├── navigation.ts           # Route-Helfer und Navigations-Konstanten
│   │   ├── schemas.ts              # Zod-Schemas für Route-Parameter-Validierung
│   │   ├── security-headers.ts     # CSP und Security-Header-Definitionen
│   │   ├── json-ld.ts              # JSON-LD Structured Data (SEO)
│   │   ├── format.ts               # Datum-, Dauer- und Zahlen-Formatter
│   │   ├── parseResponse.ts        # Response-Parsing mit Zod-Validierung
│   │   ├── design-tokens.ts        # Design-Token-Utilities
│   │   └── utils.ts                # cn()-Helfer (clsx + tailwind-merge)
│   ├── hooks/                      # React-Hooks
│   │   └── useFocusTrap.ts         # Focus-Trap für Modale
│   └── types/
│       └── index.ts                # Alle TypeScript-Interfaces
├── tests/
│   └── setup.tsx                   # Vitest-Setup (@testing-library/jest-dom)
├── .vscode/
│   ├── launch.json                 # Browser-Debug-Konfigurationen
│   └── tasks.json                  # VS-Code-Task-Definitionen
├── .env.example                    # Dokumentation der Umgebungsvariablen
├── next.config.ts                  # Next.js-Konfiguration (Security Headers, Cache)
├── vitest.config.ts                # Vitest-Konfiguration
└── eslint.config.mjs               # ESLint-Konfiguration
```

---

## Setup

```bash
# Repository klonen und Abhängigkeiten installieren
npm install

# Entwicklungsserver starten (Turbopack)
npm run dev       # http://localhost:3000

# Produktions-Build
npm run build

# Produktions-Server starten
npm start

# Tests ausführen (Watch-Modus)
npm test

# Tests einmalig ausführen (CI)
npm run test:run

# Lint
npm run lint
```

---

## VS Code Debugging (>= 1.112)

Das Projekt enthält `.vscode/launch.json` mit integrierten Browser-Debug-Konfigurationen:

1. Entwicklungsserver starten: `npm run dev`
2. In VS Code `F5` drücken → **"Debug in Browser"** auswählen
3. Browser öffnet sich direkt in VS Code
4. Breakpoints in `.tsx`/`.ts`-Dateien setzen, Console und Network direkt im Editor nutzen

Alternativ: **"Attach to Browser"** — an laufenden Browser-Tab anhängen (Port 3000).

---

## Architektur-Entscheidungen

### Routing

File-based Routing via Next.js App Router. Alle Seiten unter `src/app/`. Dynamic Segments in eckigen Klammern (`[slug]`). Route-Parameter werden mit Zod validiert (`src/lib/schemas.ts`), nicht blind als `string` behandelt.

### Daten-Layer

Dreischichtiger Aufbau:
1. **`mock.ts`** — Transport-Layer: gibt Inline-Daten zurück (aktuell kein externer API-Call)
2. **`data.ts`** — Business-Layer: verwendet Next.js `"use cache"` + `cacheLife` + `cacheTag` für selektive Cache-Invalidierung. Alle Funktionen sind `server-only`.
3. **Seiten** — rufen nur Funktionen aus `data.ts` auf, nie direkt `mock.ts`

Cache-Tags ermöglichen On-Demand-Revalidierung via `POST /api/revalidate` (gesichert mit `REVALIDATION_SECRET`).

### CMS-Migration

Um von Mock auf ein echtes CMS umzustellen, muss nur `mock.ts` ersetzt werden. Alle anderen Layer (`data.ts`, Seiten, Typen) bleiben unverändert — solange die Rückgabetypen in `src/types/index.ts` eingehalten werden.

### State-Management

Kein globaler State-Manager. Daten werden als Server-Component-Props weitergegeben. Der Dark-Mode-State läuft über den `ThemeProvider` (React Context, Client Component). Kein Zustand mit Serverstate synchronisiert.

### Error Handling

- Route-Level: `error.tsx` pro Route-Segment
- Global: `global-error.tsx` als Root-Fallback
- Client-Side: `ErrorReporter.tsx` fängt `unhandledrejection`-Events
- Alle Seiten mit Datenfetch haben einen `ErrorState`-Fallback mit Retry-Button

### SEO

- `metadata`-Export auf jeder Seite (OpenGraph, Twitter Card)
- JSON-LD Structured Data via `src/lib/json-ld.ts`
- `robots.ts` generiert `robots.txt` dynamisch
- Schriften sind Build-Zeit-eingebettet (kein externer Google-Fonts-Request)

### Dark Mode

Initialisierung via Inline-Script im `<head>` (verhindert FOUC). Umschaltung via `ThemeProvider` + `localStorage`. Kein FOUC-Problem bei Page-Load.

### Paywall

Artikel haben ein `paywall`-Feld (`"free" | "paid" | "metered"`). Die Paywall-Logik ist in den Artikelseiten implementiert. Die tatsächliche Zugangskontrolle (Authentication, Token-Validierung) muss bei CMS-Anbindung ergänzt werden.

---

## Umgebungsvariablen

Alle Variablen in `.env.local` (nicht in Git einchecken — bereits in `.gitignore`):

| Variable | Typ | Beschreibung | Pflicht |
|----------|-----|-------------|---------|
| `REVALIDATION_SECRET` | Secret | Authentifizierung für `POST /api/revalidate` (Cache-Invalidierung) | Produktion |
| `API_BASE_URL` | Konfiguration | Basis-URL der Site (Fallback: `localhost:3000` in Dev) | Optional |

> `NEXT_PUBLIC_*` Variablen landen im Client-Bundle — niemals Secrets mit diesem Prefix benennen.

`.env.example` enthält alle benötigten Variablen mit Beschreibungen.

---

## Erweiterbarkeit

### Neue Seite hinzufügen

Neue Datei unter `src/app/<route>/page.tsx` erstellen. Next.js erkennt sie automatisch als Route.

### Neue Komponente hinzufügen

In `src/components/` oder `src/components/ui/` (für primitive Elemente). Neue Daten-Typen in `src/types/index.ts` ergänzen.

### CMS anbinden

1. `src/lib/mock.ts` durch einen echten API-Client ersetzen (gleiche Funktionssignaturen beibehalten)
2. Notwendige Umgebungsvariablen in `.env.local` und Vercel Dashboard eintragen
3. `cacheTag`-Invalidierung in `src/lib/data.ts` an CMS-Webhook anpassen

### Neue Kategorie in Navigation

In `src/lib/mock.ts` → `mockNavigation` bearbeiten (nach CMS-Migration im CMS).

---

## Bekannte Einschränkungen

- **Keine Authentifizierung:** Die Paywall-Logik zeigt UI-Sperren, hat aber keine echte Zugangskontrolle. Authentication muss separat implementiert werden.
- **Mock-Daten:** Alle Inhalte sind Beispieldaten in `src/lib/mock.ts`. Für Produktion: CMS anbinden.
- **CSP mit `unsafe-inline`:** Notwendig für Next.js 16 Hydration. Migration auf Nonce-basierte CSP nach Deploy empfohlen (Anleitung in `src/lib/security-headers.ts`).
- **Kein RSS-Feed:** `feed.xml` ist in `metadata.alternates` referenziert, aber noch nicht implementiert.
- **Kein Kommentarsystem:** Das `Comment`-Interface und `commentCount` sind vorbereitet, aber es gibt keine Live-Kommentarfunktion.
