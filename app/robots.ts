import type { MetadataRoute } from "next";

import { SITE_URL, isVercelPreview } from "@/lib/seo/site";

/**
 * robots.txt — allow public pages, block admin/API/auth areas.
 *
 * Member-only document library `/blog/documents` is ALLOWED: the page is
 * indexable (so Google can surface the offering) while content stays
 * member-gated at the API layer. Preview deployments block everything.
 */
export default function robots(): MetadataRoute.Robots {
  if (isVercelPreview()) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
      sitemap: `${SITE_URL}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/account", "/login", "/register"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
