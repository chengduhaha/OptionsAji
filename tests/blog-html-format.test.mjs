import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

test("blog supports markdown and html content formats end-to-end", () => {
  const types = readFileSync(new URL("../lib/blog/types.ts", import.meta.url), "utf8");
  const sanitize = readFileSync(new URL("../lib/blog/sanitizeHtml.ts", import.meta.url), "utf8");
  const htmlContent = readFileSync(new URL("../components/blog/BlogHtmlContent.tsx", import.meta.url), "utf8");
  const postPage = readFileSync(new URL("../components/blog/BlogPostPageClient.tsx", import.meta.url), "utf8");
  const admin = readFileSync(new URL("../app/admin/blog/page.tsx", import.meta.url), "utf8");
  const helper = readFileSync(new URL("../components/blog/BlogHtmlAdminHelper.tsx", import.meta.url), "utf8");

  assert.match(types, /content_format: "markdown" \| "html"/);
  assert.match(sanitize, /sanitizeBlogHtml/);
  assert.match(sanitize, /jsdelivr/);
  assert.match(htmlContent, /BlogHtmlContent/);
  assert.match(htmlContent, /blog-html-article/);
  assert.match(postPage, /content_format === "html"/);
  assert.match(postPage, /BlogHtmlContent/);
  assert.match(postPage, /BlogMarkdown/);
  assert.match(admin, /content_format/);
  assert.match(admin, /BlogHtmlAdminHelper/);
  assert.match(helper, /chart-card/);
});
