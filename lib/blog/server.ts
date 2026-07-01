import type { BlogPostDetail } from "@/lib/blog/types";
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
