import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

test("blog about route redirects to site-level about page", () => {
  const page = readFileSync(new URL("../app/blog/about/page.tsx", import.meta.url), "utf8");
  assert.match(page, /redirect\("\/about"\)/);
});

test("site about page uses dedicated AboutAjiPageClient", () => {
  const page = readFileSync(new URL("../app/about/page.tsx", import.meta.url), "utf8");
  const client = readFileSync(new URL("../components/about/AboutAjiPageClient.tsx", import.meta.url), "utf8");

  assert.match(page, /AboutAjiPageClient/);
  assert.match(client, /V4SiteHeader/);
  assert.match(client, /blog\.about\.bodyZh/);
});

test("blog post categories use localized labels instead of raw slugs", () => {
  const helper = readFileSync(new URL("../lib/blog/categories.ts", import.meta.url), "utf8");
  const postCard = readFileSync(new URL("../components/blog/BlogPostCard.tsx", import.meta.url), "utf8");
  const hub = readFileSync(new URL("../components/blog/BlogHubPageClient.tsx", import.meta.url), "utf8");

  assert.match(helper, /blog\.documents\.categories\./);
  assert.match(postCard, /blogCategoryLabel\(t, post\.category\)/);
  assert.match(hub, /blogCategoryLabel\(t, cat\)/);
  assert.doesNotMatch(postCard, /\{post\.category\}/);
});

test("blog documents types include preview metadata for guest teasers", () => {
  const types = readFileSync(new URL("../lib/blog/types.ts", import.meta.url), "utf8");
  assert.match(types, /is_preview\?: boolean/);
});
