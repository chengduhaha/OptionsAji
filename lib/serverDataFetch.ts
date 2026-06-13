import { getServerOrigin } from "@/lib/serverOrigin";

function backendBaseUrl(): string {
  return (process.env.OPTIONS_AJI_BACKEND_URL ?? "").trim().replace(/\/$/, "");
}

function backendHeaders(base: string): HeadersInit | undefined {
  const apiKey = (process.env.OPTIONS_AJI_API_KEY ?? "").trim();
  if (!base || !apiKey) return undefined;
  return { "X-API-Key": apiKey };
}

export async function fetchServerJson<T>(
  backendPath: string,
  sameOriginPath: string,
  fallback: T,
): Promise<T> {
  const base = backendBaseUrl();
  const targets = base ? [`${base}${backendPath}`] : [];
  const origin = await getServerOrigin();
  targets.push(`${origin}${sameOriginPath}`);

  for (const target of targets) {
    try {
      const res = await fetch(target, {
        cache: "no-store",
        headers: target.startsWith(base) ? backendHeaders(base) : undefined,
      });
      if (res.ok) return (await res.json()) as T;
    } catch {
      // Try the next target. Server Components should render a fallback instead of blocking navigation.
    }
  }
  return fallback;
}
