import type { Metadata } from "next";

import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_OG_LOCALE,
  SITE_TWITTER,
  SITE_URL,
  isVercelPreview,
} from "./site";

export type BuildPageMetadataInput = {
  /** Page title without the "| OptionsAji" suffix (template adds it). */
  title: string;
  /** Meta description (≤ ~160 chars recommended). */
  description: string;
  /** Path beginning with `/` (no trailing slash). Used for canonical URL. */
  path: string;
  /** OpenGraph type. Defaults to `website`. Use `article` for blog posts. */
  type?: "website" | "article";
  /** Optional override OG image (absolute URL or path under SITE_URL). */
  image?: string;
  /** Optional article metadata (only honored when type === "article"). */
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  /** Optional meta keywords (kept for legacy crawlers; little SEO weight). */
  keywords?: string[];
  /** When true, sets `robots: { index: false, follow: false }`. */
  noindex?: boolean;
};

function resolveUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

function resolveImage(image: string): string {
  if (/^https?:\/\//i.test(image)) return image;
  const normalized = image.startsWith("/") ? image : `/${image}`;
  return `${SITE_URL}${normalized}`;
}

/**
 * Build a fully-populated `Metadata` object for a page: canonical, OpenGraph,
 * Twitter card, and robots directives. Preview deployments are forced to
 * `noindex` so they never appear in Google results.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  type = "website",
  image,
  publishedTime,
  modifiedTime,
  tags,
  keywords,
  noindex = false,
}: BuildPageMetadataInput): Metadata {
  const canonical = resolveUrl(path);
  const ogImage = image ? resolveImage(image) : DEFAULT_OG_IMAGE;
  const previewNoindex = isVercelPreview();
  const shouldIndex = !noindex && !previewNoindex;
  const shouldFollow = !noindex;

  const baseOpenGraph = {
    title,
    description,
    url: canonical,
    siteName: SITE_NAME,
    locale: SITE_OG_LOCALE,
    type,
    images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
  };

  const openGraph: Metadata["openGraph"] =
    type === "article"
      ? {
          ...baseOpenGraph,
          publishedTime,
          modifiedTime,
          tags,
        }
      : baseOpenGraph;

  return {
    // `absolute` opts out of the root layout's `%s | OptionsAji` template so
    // titles that already include the brand suffix (e.g. board SEO copy) are
    // not doubled to "... | OptionsAji | OptionsAji".
    title: { absolute: title },
    description,
    alternates: { canonical },
    keywords,
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: SITE_TWITTER,
      images: [ogImage],
    },
    robots: {
      index: shouldIndex,
      follow: shouldFollow,
      googleBot: {
        index: shouldIndex,
        follow: shouldFollow,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}
