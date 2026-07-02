import type { BlogPostDetail, BlogPostListResponse, BlogPostSummary } from "@/lib/blog/types";
import { backendBaseUrl } from "@/lib/proxyBackend";

export async function fetchPublishedBlogPost(slug: string): Promise<BlogPostDetail | null> {
  const base = backendBaseUrl();
  if (!base) return null;

  const headers: HeadersInit = { Accept: "application/json" };
  const apiKey = process.env.OPTIONS_AJI_API_KEY?.trim();
  if (apiKey) headers["X-API-Key"] = apiKey;

  try {
    const res = await fetch(
      `${base.replace(/\/$/, "")}/api/blog/posts/${encodeURIComponent(slug)}`,
      {
        headers,
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as BlogPostDetail;
    if (data.status !== "published") return null;
    return data;
  } catch {
    return null;
  }
}

export type PublishedBlogSlug = {
  slug: string;
  updatedAt: string | null;
};

/**
 * Page through the backend blog list endpoint and return every published post
 * slug (with `updated_at` for the sitemap). Used by `app/sitemap.ts`.
 *
 * Fail-safe: any network/parse error or missing backend URL returns `[]` so
 * the sitemap still emits static URLs — SEO infrastructure must never throw
 * 500s. Revalidated hourly via `next: { revalidate: 3600 }`.
 */
export async function fetchAllPublishedBlogSlugs(): Promise<PublishedBlogSlug[]> {
  const base = backendBaseUrl();
  if (!base) return [];

  const headers: HeadersInit = { Accept: "application/json" };
  const apiKey = process.env.OPTIONS_AJI_API_KEY?.trim();
  if (apiKey) headers["X-API-Key"] = apiKey;

  const root = base.replace(/\/$/, "");
  const pageSize = 100;
  const maxPages = 20; // hard cap (20 * 100 = 2000 posts) to bound runtime
  const out: PublishedBlogSlug[] = [];
  const seen = new Set<string>();

  try {
    for (let page = 1; page <= maxPages; page += 1) {
      const url = `${root}/api/blog/posts?page=${page}&page_size=${pageSize}`;
      const res = await fetch(url, {
        headers,
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;

      const data = (await res.json()) as BlogPostListResponse;
      const items = Array.isArray(data?.items) ? data.items : [];
      for (const item of items) {
        if (item?.status !== "published") continue;
        const slug = item.slug?.trim();
        if (!slug || seen.has(slug)) continue;
        seen.add(slug);
        out.push({ slug, updatedAt: item.updated_at ?? null });
      }

      const total = typeof data?.total === "number" ? data.total : out.length;
      const lastPage = Math.max(1, Math.ceil(total / pageSize));
      if (page >= lastPage || items.length === 0) break;
    }
  } catch {
    return out;
  }

  return out;
}

export type { BlogPostSummary };

