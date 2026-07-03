/**
 * Resolve browser API URLs.
 * When NEXT_PUBLIC_API_BASE is set (e.g. https://api.options-aji.com), the browser
 * calls FastAPI directly and skips the Vercel /api proxy hop.
 */
export function apiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE?.trim() ?? "";
  return raw.replace(/\/$/, "");
}

/** Next.js proxy paths that differ on the direct FastAPI host. */
export function remapDirectBackendPath(path: string): string {
  const stockGexHistory = path.match(/^\/api\/stock\/([^/]+)\/gex\/history(\?.*)?$/);
  if (stockGexHistory) {
    const [, symbol, query = ""] = stockGexHistory;
    return `/api/options/gex/history/${symbol}${query}`;
  }
  return path;
}

export function resolveApiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = apiBaseUrl();
  if (!base) return normalized;
  return `${base}${remapDirectBackendPath(normalized)}`;
}

export function usesDirectBackend(): boolean {
  return apiBaseUrl().length > 0;
}

const JWT_STORAGE_KEY = "optionsaji_jwt";

function withApiKeyHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers ?? undefined);
  const apiKey = process.env.NEXT_PUBLIC_API_KEY?.trim();
  if (apiKey && !headers.has("X-API-Key")) {
    headers.set("X-API-Key", apiKey);
  }
  return headers;
}

/** Inject JWT from localStorage when available (browser only). */
export function withAuthHeaders(init?: RequestInit): Headers {
  const headers = withApiKeyHeaders(init);
  if (typeof window !== "undefined") {
    try {
      const token = window.localStorage.getItem(JWT_STORAGE_KEY);
      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    } catch {
      /* ignore */
    }
  }
  return headers;
}

/** Client-side fetch that honors NEXT_PUBLIC_API_BASE and injects X-API-Key. */
export function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const url =
    input.startsWith("http://") || input.startsWith("https://")
      ? input
      : resolveApiUrl(input);
  return fetch(url, { ...init, headers: withApiKeyHeaders(init) });
}

/** Same as apiFetch but forwards JWT for membership-gated endpoints. */
export function authFetch(input: string, init?: RequestInit): Promise<Response> {
  const url =
    input.startsWith("http://") || input.startsWith("https://")
      ? input
      : resolveApiUrl(input);
  return fetch(url, { ...init, headers: withAuthHeaders(init) });
}
