/**
 * Resolve browser API URLs.
 * When NEXT_PUBLIC_API_BASE is set (e.g. https://api.options-aji.com), the browser
 * calls FastAPI directly and skips the Vercel /api proxy hop.
 */
export function apiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE?.trim() ?? "";
  return raw.replace(/\/$/, "");
}

export function resolveApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = apiBaseUrl();
  if (!base) return normalized;
  return `${base}${normalized}`;
}

export function usesDirectBackend(): boolean {
  return apiBaseUrl().length > 0;
}

function withApiKeyHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers ?? undefined);
  const apiKey = process.env.NEXT_PUBLIC_API_KEY?.trim();
  if (apiKey && !headers.has("X-API-Key")) {
    headers.set("X-API-Key", apiKey);
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
