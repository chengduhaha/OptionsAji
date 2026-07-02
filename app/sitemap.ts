import type { MetadataRoute } from "next";

import { fetchAllPublishedBlogSlugs } from "@/lib/blog/server";
import { SITE_URL } from "@/lib/seo/site";

type StaticEntry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const STATIC_ENTRIES: StaticEntry[] = [
  { path: "/", changeFrequency: "hourly", priority: 1.0 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.7 },
  { path: "/blog", changeFrequency: "daily", priority: 0.8 },
  { path: "/blog/documents", changeFrequency: "daily", priority: 0.6 },
  // 11 options boards
  { path: "/options/unusual", changeFrequency: "hourly", priority: 0.9 },
  { path: "/options/volume", changeFrequency: "hourly", priority: 0.8 },
  { path: "/options/open-interest", changeFrequency: "hourly", priority: 0.8 },
  { path: "/options/turnover", changeFrequency: "hourly", priority: 0.8 },
  { path: "/options/high-iv", changeFrequency: "hourly", priority: 0.8 },
  { path: "/options/high-gamma", changeFrequency: "hourly", priority: 0.7 },
  { path: "/options/near-atm-gamma", changeFrequency: "hourly", priority: 0.7 },
  { path: "/options/seller", changeFrequency: "hourly", priority: 0.7 },
  { path: "/options/liquidity", changeFrequency: "hourly", priority: 0.7 },
  { path: "/options/sentiment", changeFrequency: "hourly", priority: 0.7 },
  { path: "/options/gex", changeFrequency: "hourly", priority: 0.8 },
  // Legal pages
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/disclaimer", changeFrequency: "yearly", priority: 0.3 },
  { path: "/refund", changeFrequency: "yearly", priority: 0.3 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.4 },
];

/**
 * Sitemap entry builder — never throws. If the backend blog API is down, we
 * emit only the static URLs (the fail-safe promised in the SEO plan).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ENTRIES.map((entry) => ({
    url: `${SITE_URL}${entry.path}`,
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  let blogSlugs: { slug: string; updatedAt: string | null }[] = [];
  try {
    blogSlugs = await fetchAllPublishedBlogSlugs();
  } catch {
    blogSlugs = [];
  }

  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map(({ slug, updatedAt }) => ({
    url: `${SITE_URL}/blog/${encodeURIComponent(slug)}`,
    lastModified: updatedAt ?? now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...blogEntries];
}
