# Deploy Guide — Berliner Rundschau

> Deploy target: **Vercel** | Framework: **Next.js 16 (App Router)**

---

## Vercel deployment

### Option 1: Git integration (recommended)

1. Host the repository on GitHub, GitLab, or Bitbucket
2. Log in at [vercel.com](https://vercel.com) and click "Add New Project"
3. Select the repository — Vercel detects Next.js automatically
4. Enter environment variables (see section below)
5. Click "Deploy"

Every push to the main branch triggers a new deployment automatically. Pull requests receive preview URLs.

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Log in and deploy from the project directory
vercel

# Production deployment
vercel --prod
```

### Build configuration

Vercel detects Next.js projects automatically. No manual configuration is required.

| Setting | Value |
|---------|-------|
| Build Command | `next build` (automatic) |
| Output Directory | `.next` (automatic) |
| Install Command | `npm install` (automatic) |
| Node.js Version | 20.x or higher recommended |

---

## Setting environment variables in Vercel

1. Vercel Dashboard → select project → **Settings** → **Environment Variables**
2. Enter the following variables:

| Variable | Environment | Description |
|----------|-------------|-------------|
| `REVALIDATION_SECRET` | Production, Preview | Secret token for cache invalidation via `/api/revalidate`. Generate a random value: `openssl rand -hex 32` |
| `API_BASE_URL` | Production | Optional base URL (default: automatically detected by Vercel) |

> Use `.env.example` as a reference. Never commit `.env.local`.

---

## Configuring a custom domain

1. Vercel Dashboard → project → **Settings** → **Domains**
2. Enter the domain (e.g. `berliner-rundschau.de`)
3. Set DNS records at your domain registrar:
   - **CNAME:** `www` → `cname.vercel-dns.com`
   - **A Record:** `@` → Vercel IP addresses (shown in the dashboard)
4. HTTPS is set up automatically by Vercel (Let's Encrypt)

---

## Security headers

Security headers are already configured in `next.config.ts` and applied automatically on every deployment:

- `Content-Security-Policy` (CSP)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `Strict-Transport-Security` (HSTS, max-age 2 years)

Full CSP configuration: `src/lib/security-headers.ts`

**Recommended after deploy:** Migrate to nonce-based CSP (removes `unsafe-inline` from `script-src`). Instructions in the comment at the top of `src/lib/security-headers.ts`.

---

## On-demand cache invalidation

The project supports on-demand revalidation via webhook endpoint `POST /api/revalidate`.

When connecting an external CMS, configure a webhook to this endpoint:

```bash
curl -X POST https://your-domain.com/api/revalidate \
  -H "x-revalidate-secret: $REVALIDATION_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"tag": "articles"}'
```

Available cache tags: `articles`, `categories`, `authors`, `navigation`, `videos`, `newsticker`, `breaking-news`, `search`, `quiz`, `stocks`, `site-config`, `slugs`.

---

## Pre-deployment checklist

Check before every production deployment:

- [ ] Environment variables set in Vercel (`REVALIDATION_SECRET`)
- [ ] Build successful: `npm run build`
- [ ] Tests passed: `npm run test:run`
- [ ] Lint clean: `npm run lint`
- [ ] TypeScript clean: `npx tsc --noEmit`
- [ ] `.env.local` is **not** committed to Git (check `.gitignore`)
- [ ] Privacy policy and legal notice (Impressum) filled in
- [ ] `SITE_CONFIG.url` in `src/lib/config.ts` set to the production URL

---

## Post-deployment checklist

Check after deployment:

- [ ] Website reachable at the production URL
- [ ] Homepage loads articles, newsticker, and videos
- [ ] Article detail page opens correctly
- [ ] Search returns results
- [ ] Mobile view checked (breakpoints: 640px, 768px, 1024px, 1280px)
- [ ] Dark mode toggles correctly
- [ ] Security headers correctly set (check with [securityheaders.com](https://securityheaders.com))
- [ ] `robots.txt` accessible at `/robots.txt`
- [ ] HTTPS active and HTTP redirect works

---

## Rollback

If a deployment fails:

1. Vercel Dashboard → project → **Deployments**
2. Find the last working deployment
3. Three-dot menu → **Promote to Production**

---

## Monitoring & logs

- **Vercel Dashboard** → Deployment → **Functions** → live logs available
- **Build logs** in the Vercel Dashboard under each deployment
- **Runtime errors** appear in the Vercel function log

---

## CI/CD via GitHub Actions

The project includes `.github/workflows/ci.yml` with automated checks on pull requests:
- TypeScript check
- ESLint
- Vitest tests

Vercel deployment runs separately through the native Vercel GitHub integration.
