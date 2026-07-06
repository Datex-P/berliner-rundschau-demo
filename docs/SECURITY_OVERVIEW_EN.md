# Security Overview — berliner-rundschau

## Implemented Security Measures

### Content Security Policy (CSP)

The application uses strict security headers in `next.config.ts`:

| Header | Value | Purpose |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; ...` | Prevents XSS and code injection |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer information |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disables sensitive browser APIs |

### HTML Sanitization

All external HTML content is sanitized via the `SanitizedHtml` component:

- **Library:** DOMPurify
- **Allowed attributes:** `href`, `target`, `rel`
- **Blocked:** `class`, `style`, `onclick`, `onerror` and all data attributes
- **Usage:** `<SanitizedHtml html={untrustedContent} />`

### Images

All images use the `SafeImage` component:

- Automatic fallback on load errors
- Responsive `sizes` attribute
- `priority` prop for above-the-fold images

## Secrets Inventory

| Variable | Purpose | Required |
|---|---|---|
| `REVALIDATION_SECRET` | Authentication for on-demand revalidation via `/api/revalidate` | Production |
| `API_BASE_URL` | Base URL for CMS API (fallback: `localhost:3000`) | Production |

Secrets are managed via `.env.local` (local) or Vercel Environment Variables (deployment). The `.env.example` file documents all required variables. `.env.local` is listed in `.gitignore`.

## GDPR & Data Privacy

- **No cookies** are set directly by the application (no session cookie, no tracking cookie)
- **Google Fonts** are embedded at build time via `next/font` — no runtime requests to Google servers
- **External images** are optimized and proxied via `next/image` — user IP is not forwarded to Picsum/CDN
- **Analytics** (GTM) is configured but only active when explicitly integrated — requires cookie consent banner before activation
- **Contact forms** are not implemented — if added: double opt-in and privacy notice required

## Customization

For project-specific requirements (e.g., external image domains, API endpoints), extend the CSP in `src/lib/security-headers.ts`.
