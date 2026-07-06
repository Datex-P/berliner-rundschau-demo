# Sicherheitsübersicht — berliner-rundschau

## Implementierte Sicherheitsmaßnahmen

### Content Security Policy (CSP)

Die Anwendung nutzt strikte Security-Headers in `next.config.ts`:

| Header | Wert | Zweck |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; ...` | Verhindert XSS und Code-Injection |
| `X-Frame-Options` | `DENY` | Verhindert Clickjacking |
| `X-Content-Type-Options` | `nosniff` | Verhindert MIME-Type-Sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Kontrolliert Referrer-Informationen |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Deaktiviert sensible Browser-APIs |

### HTML-Sanitierung

Alle externen HTML-Inhalte werden über die `SanitizedHtml`-Komponente bereinigt:

- **Bibliothek:** DOMPurify
- **Erlaubte Attribute:** `href`, `target`, `rel`
- **Blockiert:** `class`, `style`, `onclick`, `onerror` und alle Data-Attribute
- **Verwendung:** `<SanitizedHtml html={untrustedContent} />`

### Bilder

Alle Bilder nutzen die `SafeImage`-Komponente:

- Automatischer Fallback bei Ladefehlern
- Responsive `sizes`-Attribut
- `priority`-Prop für Above-the-Fold-Bilder

## Secrets & Umgebungsvariablen

| Variable | Zweck | Pflicht |
|---|---|---|
| `REVALIDATION_SECRET` | Authentifizierung für On-Demand Revalidation via `/api/revalidate` | Produktion |
| `API_BASE_URL` | Basis-URL für CMS-API (Fallback: `localhost:3000`) | Produktion |

Secrets werden über `.env.local` (lokal) bzw. Vercel Environment Variables (Deployment) verwaltet. Die Datei `.env.example` dokumentiert alle benötigten Variablen. `.env.local` ist in `.gitignore` eingetragen.

## DSGVO & Datenschutz

- **Keine Cookies** werden direkt von der Anwendung gesetzt (kein Session-Cookie, kein Tracking-Cookie)
- **Google Fonts** werden via `next/font` beim Build eingebettet — kein Runtime-Request an Google-Server
- **Externe Bilder** werden über `next/image` optimiert und proxied — Nutzer-IP wird nicht an Picsum/CDN weitergeleitet
- **Analytics** (GTM) ist in der Config konfiguriert, aber erst bei expliziter Einbindung aktiv — erfordert Cookie-Consent-Banner vor Aktivierung
- **Kontaktformulare** sind nicht implementiert — bei Ergänzung: Double-Opt-In und Datenschutzhinweis erforderlich

## Anpassungen

Bei projektspezifischen Anforderungen (z.B. externe Bild-Domains, API-Endpunkte) die CSP in `src/lib/security-headers.ts` erweitern.
