import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const BLOG_CANONICAL_ORIGIN = "https://www.options-aji.com";

function blogPostCanonicalUrl(slug) {
  const normalized = slug.trim().replace(/^\/+|\/+$/g, "");
  return `${BLOG_CANONICAL_ORIGIN}/blog/${encodeURIComponent(normalized)}`;
}

function buildSocialShareUrl(platform, url, title) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  switch (platform) {
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "telegram":
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
    default:
      throw new Error(`unknown platform: ${platform}`);
  }
}

function buildWeChatQrImageUrl(url) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(url)}`;
}

test("blogPostCanonicalUrl uses production origin and slug", () => {
  assert.equal(blogPostCanonicalUrl("serenity"), `${BLOG_CANONICAL_ORIGIN}/blog/serenity`);
  assert.equal(blogPostCanonicalUrl("/hello-world/"), `${BLOG_CANONICAL_ORIGIN}/blog/hello-world`);
});

test("buildSocialShareUrl encodes url and title for platforms", () => {
  const url = "https://www.options-aji.com/blog/serenity";
  const title = "Serenity 期权分析";

  const twitter = buildSocialShareUrl("twitter", url, title);
  assert.match(twitter, /^https:\/\/twitter\.com\/intent\/tweet\?/);
  assert.ok(twitter.includes(encodeURIComponent(url)));
  assert.ok(twitter.includes(encodeURIComponent(title)));

  const linkedin = buildSocialShareUrl("linkedin", url, title);
  assert.equal(
    linkedin,
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  );

  const telegram = buildSocialShareUrl("telegram", url, title);
  assert.match(telegram, /^https:\/\/t\.me\/share\/url\?/);
  assert.ok(telegram.includes(encodeURIComponent(url)));
});

test("buildWeChatQrImageUrl encodes article url", () => {
  const url = "https://www.options-aji.com/blog/serenity";
  const qr = buildWeChatQrImageUrl(url);
  assert.match(qr, /^https:\/\/api\.qrserver\.com\/v1\/create-qr-code\//);
  assert.ok(qr.includes(encodeURIComponent(url)));
});

test("blog article page wires share UI and OG metadata", () => {
  const page = readFileSync(new URL("../app/blog/[slug]/page.tsx", import.meta.url), "utf8");
  const client = readFileSync(
    new URL("../components/blog/BlogPostPageClient.tsx", import.meta.url),
    "utf8",
  );
  const share = readFileSync(new URL("../components/blog/BlogShareButtons.tsx", import.meta.url), "utf8");
  const shareLib = readFileSync(new URL("../lib/blog/share.ts", import.meta.url), "utf8");
  const i18n = readFileSync(new URL("../lib/i18n/namespaces.ts", import.meta.url), "utf8");

  assert.match(page, /generateMetadata/);
  assert.match(page, /openGraph/);
  assert.match(page, /twitter/);
  assert.match(page, /blogPostCanonicalUrl/);
  assert.match(client, /BlogShareButtons/);
  assert.match(share, /blog\.article\.share\.linkCopied/);
  assert.match(shareLib, /BLOG_CANONICAL_ORIGIN = "https:\/\/www\.options-aji\.com"/);
  assert.match(i18n, /linkCopied: "链接已复制"/);
});
