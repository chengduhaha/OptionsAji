import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const SITE_URL = "https://www.options-aji.com";

// Static URL list that MUST appear in app/sitemap.ts. Mirrors the SEO plan:
// home, about, pricing, blog hub, blog/documents, 11 options boards, 5 legal.
const EXPECTED_STATIC_PATHS = [
  "/",
  "/about",
  "/pricing",
  "/blog",
  "/blog/documents",
  "/options/unusual",
  "/options/volume",
  "/options/open-interest",
  "/options/turnover",
  "/options/high-iv",
  "/options/high-gamma",
  "/options/near-atm-gamma",
  "/options/seller",
  "/options/liquidity",
  "/options/sentiment",
  "/options/gex",
  "/terms",
  "/privacy",
  "/disclaimer",
  "/refund",
  "/contact",
];

// Paths that MUST be disallowed in robots.txt (admin, api, auth surfaces).
const EXPECTED_ROBOTS_DISALLOW = ["/admin/", "/api/", "/account", "/login", "/register"];

function read(rel) {
  return readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");
}

test("sitemap.ts emits every required static URL with the production origin", () => {
  const sitemap = read("app/sitemap.ts");

  // Sanity: file exists and exports a default sitemap function.
  assert.match(sitemap, /export default async function sitemap/);
  assert.match(sitemap, /MetadataRoute\.Sitemap/);

  // Static entries are listed in a STATIC_ENTRIES array with path literals.
  for (const path of EXPECTED_STATIC_PATHS) {
    assert.ok(
      sitemap.includes(`path: "${path}"`),
      `sitemap.ts missing static entry path literal: ${path}`,
    );
  }

  // Must resolve URLs against the production origin constant.
  assert.match(sitemap, /SITE_URL/);

  // Dynamic blog slugs must come from fetchAllPublishedBlogSlugs (not hardcoded).
  assert.match(sitemap, /fetchAllPublishedBlogSlugs/);
  // Fail-safe: a catch must downgrade to static URLs only.
  assert.match(sitemap, /catch/);
});

test("sitemap.ts does NOT include admin or member video routes", () => {
  const sitemap = read("app/sitemap.ts");
  assert.ok(!sitemap.includes("/admin"), "sitemap must not include /admin routes");
  assert.ok(
    !sitemap.includes("/blog/courses/"),
    "member video pages must not be in sitemap",
  );
});

test("robots.ts allows root and disallows admin/api/auth paths, declares sitemap", () => {
  const robots = read("app/robots.ts");

  assert.match(robots, /allow:\s*"\//);
  for (const path of EXPECTED_ROBOTS_DISALLOW) {
    assert.ok(
      robots.includes(path),
      `robots.ts missing disallow entry: ${path}`,
    );
  }
  // Sitemap URL must reference the production origin constant (template literal).
  assert.ok(
    robots.includes("${SITE_URL}/sitemap.xml"),
    "robots.ts must declare the sitemap URL via SITE_URL",
  );
  assert.match(robots, /isVercelPreview/);
});

test("lib/seo/site.ts pins the production origin and brand constants", () => {
  const site = read("lib/seo/site.ts");
  assert.match(site, /SITE_URL = "https:\/\/www\.options-aji\.com"/);
  assert.match(site, /SITE_NAME = "OptionsAji"/);
  assert.match(site, /DEFAULT_OG_IMAGE/);
  assert.match(site, /isVercelPreview/);
});

test("root layout upgrades metadataBase, title template, OG, Twitter, robots", () => {
  const layout = read("app/layout.tsx");
  assert.match(layout, /metadataBase:\s*new URL\(SITE_URL\)/);
  assert.match(layout, /template:\s*"%s \| OptionsAji"/);
  assert.match(layout, /openGraph:/);
  assert.match(layout, /twitter:/);
  assert.match(layout, /robots:/);
  assert.match(layout, /OrganizationWebSiteJsonLd/);
  // Stale "Gamma Exposure" root title must be gone.
  assert.ok(
    !/title:\s*"OptionsAji — Gamma Exposure"/.test(layout),
    "stale root title must be removed",
  );
});

test("every /options/* page exports its own metadata via buildBoardMetadata", () => {
  const boards = [
    "unusual",
    "volume",
    "open-interest",
    "turnover",
    "high-iv",
    "high-gamma",
    "near-atm-gamma",
    "seller",
    "liquidity",
    "sentiment",
    "gex",
  ];
  for (const board of boards) {
    const page = read(`app/options/${board}/page.tsx`);
    assert.match(page, /export const metadata/);
    assert.match(page, /buildBoardMetadata/);
    // Page must NOT still inherit the stale root "Gamma Exposure" title.
    assert.ok(
      !/Gamma Exposure/.test(page),
      `app/options/${board}/page.tsx must not contain stale "Gamma Exposure" title`,
    );
  }
});

test("lib/seo/boards.ts covers all 11 board slugs with SEO copy", () => {
  const boards = read("lib/seo/boards.ts");
  for (const slug of [
    "unusual",
    "volume",
    "open-interest",
    "turnover",
    "high-iv",
    "high-gamma",
    "near-atm-gamma",
    "seller",
    "liquidity",
    "sentiment",
    "gex",
  ]) {
    // Slugs with hyphens are quoted keys; bare slugs are unquoted identifiers.
    const ok = boards.includes(`"${slug}":`) || boards.includes(`${slug}:`);
    assert.ok(ok, `boards.ts missing entry for slug: ${slug}`);
  }
  assert.match(boards, /buildBoardMetadata/);
});

test("client-only routes get a server layout that exports metadata", () => {
  for (const route of ["pricing", "terms", "privacy", "disclaimer", "refund", "contact"]) {
    const layout = read(`app/${route}/layout.tsx`);
    assert.match(layout, /export const metadata/);
    assert.match(layout, /buildPageMetadata/);
  }
});

test("login/register/account layouts set noindex (sensitive routes)", () => {
  for (const route of ["login", "register", "account"]) {
    const layout = read(`app/${route}/layout.tsx`);
    assert.match(layout, /export const metadata/);
    assert.match(layout, /index:\s*false/);
  }
});

test("blog/[slug] keeps canonical + OG + Twitter and adds Article JSON-LD", () => {
  const page = read("app/blog/[slug]/page.tsx");
  assert.match(page, /generateMetadata/);
  assert.match(page, /openGraph/);
  assert.match(page, /twitter/);
  assert.match(page, /blogPostCanonicalUrl/);
  assert.match(page, /ArticleJsonLd/);
  // OG image wiring (cover or default fallback) must be present.
  assert.match(page, /images/);
});

test("blog/courses/[id] sets noindex for member video (playback untouched)", () => {
  const page = read("app/blog/courses/[id]/page.tsx");
  assert.match(page, /index:\s*false/);
  assert.match(page, /BlogCourseWatchPageClient/);
});

test("JsonLd component renders Organization + WebSite + Article + Breadcrumb helpers", () => {
  const jsonld = read("components/seo/JsonLd.tsx");
  assert.match(jsonld, /application\/ld\+json/);
  assert.match(jsonld, /OrganizationWebSiteJsonLd/);
  assert.match(jsonld, /ArticleJsonLd/);
  assert.match(jsonld, /BreadcrumbJsonLd/);
  assert.match(jsonld, /WebPageJsonLd/);
});

test("opengraph-image and icon routes exist with correct content type", () => {
  const og = read("app/opengraph-image.tsx");
  assert.match(og, /ImageResponse/);
  assert.match(og, /contentType = "image\/png"/);
  assert.match(og, /1200.*630|width: 1200, height: 630/);

  const icon = read("app/icon.tsx");
  assert.match(icon, /ImageResponse/);
});

test("fetchAllPublishedBlogSlugs is paginated, revalidates hourly, and fails safe", () => {
  const server = read("lib/blog/server.ts");
  assert.match(server, /fetchAllPublishedBlogSlugs/);
  assert.match(server, /revalidate:\s*3600/);
  assert.match(server, /page_size=/);
  assert.match(server, /return \[\]/);
});
