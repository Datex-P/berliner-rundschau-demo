import "server-only";
import type { CmsAdapter } from "./types";

/** Env-var signatures per CMS */
const CMS_ENV_MAP: Record<string, string[]> = {
  contentful: ["CONTENTFUL_SPACE_ID", "CONTENTFUL_ACCESS_TOKEN"],
  storyblok: ["STORYBLOK_ACCESS_TOKEN"],
  datocms: ["DATOCMS_API_TOKEN"],
  sanity: ["SANITY_PROJECT_ID"],
  prismic: ["PRISMIC_REPOSITORY"],
  strapi: ["STRAPI_URL"],
  directus: ["DIRECTUS_URL"],
  hygraph: ["HYGRAPH_ENDPOINT"],
  payload: ["PAYLOAD_URL"],
  wordpress: ["WORDPRESS_URL"],
  typo3: ["TYPO3_URL"],
};

const ALL_KNOWN_VARS = Object.values(CMS_ENV_MAP).flat();

/** Minimal Levenshtein distance (no external deps). */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0),
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
}

function findTypoSuggestions(): string[] {
  const suggestions: string[] = [];
  for (const key of Object.keys(process.env)) {
    for (const known of ALL_KNOWN_VARS) {
      if (key === known) continue;
      if (key.length < 5) continue; // skip short vars to avoid noise
      if (levenshtein(key.toUpperCase(), known) <= 2) {
        suggestions.push(`"${key}" looks like a typo for "${known}"`);
      }
    }
  }
  return suggestions;
}

/** Determine which CMS adapter to use. Priority: explicit > auto-detect > mock. */
export function detectAdapter(): string {
  const explicit = process.env.CMS_ADAPTER;
  if (explicit) {
    return explicit.toLowerCase().trim();
  }

  const detected: string[] = [];
  for (const [cms, vars] of Object.entries(CMS_ENV_MAP)) {
    if (vars.some((v) => process.env[v])) {
      detected.push(cms);
    }
  }

  if (detected.length === 1) {
    return detected[0];
  }

  if (detected.length > 1) {
    const details = detected
      .map((cms) => {
        const present = CMS_ENV_MAP[cms].filter((v) => process.env[v]);
        return `  - ${cms}: ${present.join(", ")}`;
      })
      .join("\n");

    throw new Error(
      `[cms] Multiple CMS env var sets detected without explicit CMS_ADAPTER:\n${details}\n` +
        `Set CMS_ADAPTER to one of: ${detected.join(", ")}`,
    );
  }

  return "mock";
}

/** Verify required env vars are present; warn about possible typos. */
export function validateStartupEnv(name: string): void {
  const requiredVars = CMS_ENV_MAP[name];
  if (!requiredVars) {
    // Unknown adapter (custom or mock) — nothing to validate
    return;
  }

  const present = requiredVars.filter((v) => process.env[v]);
  const missing = requiredVars.filter((v) => !process.env[v]);

  if (present.length > 0 && missing.length > 0) {
    throw new Error(
      `[cms] Adapter "${name}": ${present.join(", ")} is set but ` +
        `${missing.join(", ")} is missing. Both are required.`,
    );
  }

  // Typo detection
  const typos = findTypoSuggestions();
  if (typos.length > 0) {
    console.warn(
      `[cms] Possible env var typos detected:\n  ${typos.join("\n  ")}`,
    );
  }
}

// Circuit-breaker singleton state
let _promise: Promise<CmsAdapter> | null = null;
let _failCount = 0;
let _cooldownUntil = 0;

async function initAdapter(): Promise<CmsAdapter> {
  const name = detectAdapter();
  validateStartupEnv(name);

  const { loadAdapter } = await import("./index");
  const adapter = await loadAdapter(name);

  console.log("[cms] Using adapter:", name);

  if (name !== "mock" && process.env.NODE_ENV === "development") {
    runHealthCheck(adapter, name).catch(() => {});
  }

  return adapter;
}

async function runHealthCheck(
  adapter: CmsAdapter,
  name: string,
): Promise<void> {
  try {
    const [articles, categories, authors] = await Promise.all([
      adapter.fetchAllArticles().catch(() => []),
      adapter.fetchAllCategories().catch(() => []),
      adapter.fetchAllAuthors().catch(() => []),
    ]);
    const empty: string[] = [];
    if (!Array.isArray(articles) || articles.length === 0)
      empty.push("articles");
    if (!Array.isArray(categories) || categories.length === 0)
      empty.push("categories");
    if (!Array.isArray(authors) || authors.length === 0) empty.push("authors");

    if (empty.length > 0) {
      console.warn(
        `[cms] Health check (${name}): ${empty.join(", ")} returned empty. ` +
          `Verify your CMS has published content and the env vars are correct.`,
      );
    }
  } catch {
    console.warn(`[cms] Health check (${name}): failed to run.`);
  }
}

/** Singleton adapter resolution with circuit-breaker (30 s cooldown after 3 failures). */
export function resolveAdapter(): Promise<CmsAdapter> {
  if (!_promise) {
    if (Date.now() < _cooldownUntil) {
      return Promise.reject(
        new Error("[cms] Adapter init in cooldown after repeated failures"),
      );
    }

    _promise = initAdapter()
      .then((adapter) => {
        _failCount = 0;
        return adapter;
      })
      .catch((err) => {
        _promise = null;
        _failCount++;
        if (_failCount >= 3) {
          _cooldownUntil = Date.now() + 30_000;
          console.error("[cms] 3 consecutive init failures. Cooldown 30s.");
        }
        throw err;
      });
  }

  return _promise;
}
