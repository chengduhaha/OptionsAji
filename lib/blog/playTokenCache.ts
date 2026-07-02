import { fetchBlogPlayToken } from "@/lib/blog/api";
import type { BlogPlayTokenResponse } from "@/lib/blog/types";

type CacheEntry = {
  token: BlogPlayTokenResponse;
  fetchedAt: number;
};

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<BlogPlayTokenResponse>>();

const CACHE_TTL_MS = 5 * 60 * 1000;

function isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.fetchedAt < CACHE_TTL_MS;
}

export function getCachedPlayToken(attachmentId: string): BlogPlayTokenResponse | null {
  const entry = cache.get(attachmentId);
  if (!entry || !isFresh(entry)) return null;
  return entry.token;
}

export async function prefetchBlogPlayToken(attachmentId: string): Promise<BlogPlayTokenResponse> {
  const cached = getCachedPlayToken(attachmentId);
  if (cached) return cached;

  const pending = inflight.get(attachmentId);
  if (pending) return pending;

  const promise = fetchBlogPlayToken(attachmentId)
    .then((token) => {
      cache.set(attachmentId, { token, fetchedAt: Date.now() });
      return token;
    })
    .finally(() => {
      inflight.delete(attachmentId);
    });

  inflight.set(attachmentId, promise);
  return promise;
}
