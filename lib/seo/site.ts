/**
 * Central SEO constants for OptionsAji.
 *
 * The canonical production origin is `https://www.options-aji.com`. All
 * metadata (canonical URLs, OpenGraph, Twitter, sitemap, robots) MUST resolve
 * to this origin so Google indexes the www host and never the preview
 * `*.vercel.app` URLs.
 */
export const SITE_URL = "https://www.options-aji.com";

export const SITE_NAME = "OptionsAji";

/** Default social share image. Served by `app/opengraph-image.tsx`. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`;

/** Default Twitter handle shown in twitter:site metadata. */
export const SITE_TWITTER = "@OptionsAji";

/** Default locale string used in OpenGraph metadata. */
export const SITE_OG_LOCALE = "zh_CN";

/**
 * Returns true when the current Vercel deployment is a preview build (not
 * production). Used to inject `robots: { index: false }` so preview URLs
 * never get indexed and compete with the production host for rankings.
 */
export function isVercelPreview(): boolean {
  const env = (process.env.VERCEL_ENV ?? "").trim();
  return env !== "" && env !== "production";
}
