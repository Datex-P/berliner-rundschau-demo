import "server-only";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Pause execution for `ms` milliseconds. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// sanitizeError — strip secrets & query params from error output
// ---------------------------------------------------------------------------

const SENSITIVE_SUFFIXES = ["_TOKEN", "_SECRET", "_API_KEY"] as const;

function collectSecretValues(): string[] {
  const values: string[] = [];
  for (const [key, value] of Object.entries(process.env)) {
    if (value && SENSITIVE_SUFFIXES.some((suffix) => key.endsWith(suffix))) {
      values.push(value);
    }
  }
  return values;
}

/** Redact query parameters from any URL found in the string. */
function redactQueryParams(text: string): string {
  return text.replace(/https?:\/\/[^\s"')]+/g, (match) => {
    try {
      const u = new URL(match);
      if (u.search) {
        u.search = "?REDACTED";
      }
      return u.toString();
    } catch {
      return match;
    }
  });
}

/**
 * Turn any thrown value into a string safe for logging.
 * Strips env-var secret values and URL query parameters.
 */
export function sanitizeError(err: unknown): string {
  let message: string;

  if (err instanceof Error) {
    message = err.stack ?? err.message;
  } else if (typeof err === "string") {
    message = err;
  } else {
    message = String(err);
  }

  // Redact every env-var value that looks like a secret
  const secrets = collectSecretValues();
  for (const secret of secrets) {
    message = message.replaceAll(secret, "[REDACTED]");
  }

  message = redactQueryParams(message);

  return message;
}

// ---------------------------------------------------------------------------
// SSRF protection
// ---------------------------------------------------------------------------

/**
 * Returns `true` when `hostname` resolves to a private / loopback /
 * link-local address that must not be reached from the server.
 */
export function isPrivateIp(hostname: string): boolean {
  const lower = hostname.toLowerCase();

  // Cloud metadata endpoints
  if (lower === "metadata.google.internal" || lower === "169.254.169.254") {
    return true;
  }

  // IPv6 loopback & link-local
  if (lower === "::1" || lower.startsWith("fe80:")) {
    return true;
  }

  // IPv4-mapped IPv6  (::ffff:A.B.C.D or [::ffff:A.B.C.D])
  const mappedMatch = lower.match(
    /^(?:\[)?::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?:])?$/,
  );
  if (mappedMatch) {
    return isPrivateIp(mappedMatch[1]);
  }

  // Plain IPv4
  const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number) as [
      number,
      number,
      number,
      number,
      number,
    ];

    if (a === 10) return true; // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 127) return true; // 127.0.0.0/8
    if (a === 0) return true; // 0.0.0.0/8
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local

    return false;
  }

  return false;
}

// ---------------------------------------------------------------------------
// URL validation
// ---------------------------------------------------------------------------

/**
 * Parse and validate a URL for safe server-side fetching.
 * Throws on invalid protocol or SSRF-violating hosts.
 */
export function validateUrl(url: string): URL {
  const parsed = new URL(url); // throws on malformed input

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Disallowed protocol: ${parsed.protocol}`);
  }

  const isDev = process.env.NODE_ENV === "development";

  if (!isDev && isPrivateIp(parsed.hostname)) {
    throw new Error(`SSRF blocked: private IP ${parsed.hostname}`);
  }

  return parsed;
}

// ---------------------------------------------------------------------------
// Retry helpers
// ---------------------------------------------------------------------------

const RETRYABLE_CODES = new Set(["ENOTFOUND", "ECONNRESET", "ETIMEDOUT"]);

/** Detect transient network errors worth retrying. */
export function isRetryableNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const code = (err as NodeJS.ErrnoException).code;
  return typeof code === "string" && RETRYABLE_CODES.has(code);
}

const MAX_NETWORK_RETRIES = 1;
const MAX_SERVER_RETRIES = 3;
const BASE_BACKOFF_MS = 500;

function jitter(base: number): number {
  return base + Math.random() * base;
}

/** Read Retry-After header (seconds or HTTP-date) and return ms to wait. */
function parseRetryAfter(response: Response): number | null {
  const header = response.headers.get("retry-after");
  if (!header) return null;

  const seconds = Number(header);
  if (!Number.isNaN(seconds)) return seconds * 1_000;

  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());

  return null;
}

// ---------------------------------------------------------------------------
// safeFetch
// ---------------------------------------------------------------------------

/**
 * Production-grade fetch wrapper with timeout, SSRF protection,
 * redirect validation, and differentiated retry logic.
 */
export async function safeFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  validateUrl(url);

  const controller = new AbortController();
  const timeout = AbortSignal.timeout(10_000);

  // Abort our controller when the timeout fires
  timeout.addEventListener("abort", () => controller.abort(timeout.reason), {
    once: true,
  });

  // Merge with caller-provided signal (if any)
  if (init?.signal) {
    init.signal.addEventListener(
      "abort",
      () => controller.abort(init.signal?.reason),
      { once: true },
    );
  }

  const merged: RequestInit = {
    ...init,
    signal: controller.signal,
    redirect: "manual",
  };

  let lastError: unknown;

  // Total attempts = 1 initial + max retries
  const totalAttempts = 1 + MAX_SERVER_RETRIES;

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    try {
      const response = await fetch(url, merged);

      // Handle redirects manually so we can validate the target
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) {
          throw new Error("Redirect without Location header");
        }
        const target = new URL(location, url).toString();
        validateUrl(target);
        return safeFetch(target, init);
      }

      // Retry on 429 / 5xx
      if (response.status === 429 || response.status >= 500) {
        lastError = new Error(
          `HTTP ${response.status} from ${redactQueryParams(url)}`,
        );

        if (attempt < MAX_SERVER_RETRIES) {
          const retryAfter = parseRetryAfter(response);
          const backoff = retryAfter ?? jitter(BASE_BACKOFF_MS * 2 ** attempt);
          await sleep(backoff);
          continue;
        }
      }

      return response;
    } catch (err: unknown) {
      lastError = err;

      // Network errors get 1 retry only
      if (isRetryableNetworkError(err) && attempt < MAX_NETWORK_RETRIES) {
        await sleep(jitter(BASE_BACKOFF_MS));
        continue;
      }

      // Non-retryable — bail out immediately
      if (!isRetryableNetworkError(err)) {
        throw new Error(sanitizeError(err));
      }
    }
  }

  throw new Error(sanitizeError(lastError));
}
