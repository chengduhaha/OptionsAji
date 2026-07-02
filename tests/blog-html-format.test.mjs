import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

import DOMPurify from "isomorphic-dompurify";

const ALLOWED_SCRIPT_SRC = /^https:\/\/cdn\.jsdelivr\.net\//;

function splitBlogHtmlParts(raw) {
  const styles = [];
  let html = raw.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_full, body) => {
    const trimmed = body.trim();
    if (trimmed) styles.push(trimmed);
    return "";
  });

  const inlineScripts = [];
  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (_full, attrs, body) => {
    const srcMatch = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(attrs);
    const src = srcMatch?.[1] ?? "";
    if (src && ALLOWED_SCRIPT_SRC.test(src)) {
      return `<script src="${src}"></script>`;
    }
    const trimmed = body.trim();
    if (trimmed) inlineScripts.push(trimmed);
    return "";
  });

  return { html, styles, inlineScripts };
}

function sanitizeBlogHtml(raw) {
  if (!raw.trim()) return "";
  const { html } = splitBlogHtmlParts(raw);
  return DOMPurify.sanitize(html, {
    ADD_TAGS: [
      "canvas",
      "iframe",
      "script",
      "input",
      "label",
      "div",
      "p",
      "h2",
      "h3",
      "span",
      "b",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    ADD_ATTR: [
      "id",
      "class",
      "style",
      "width",
      "height",
      "src",
      "sandbox",
      "loading",
      "data-chart",
      "aria-label",
      "role",
      "type",
      "min",
      "step",
      "value",
      "inputmode",
      "for",
    ],
    ALLOW_DATA_ATTR: true,
    FORBID_TAGS: ["object", "embed", "form", "button"],
  });
}

test("blog supports markdown and html content formats end-to-end", () => {
  const types = readFileSync(new URL("../lib/blog/types.ts", import.meta.url), "utf8");
  const sanitize = readFileSync(new URL("../lib/blog/sanitizeHtml.ts", import.meta.url), "utf8");
  const htmlContent = readFileSync(new URL("../components/blog/BlogHtmlContent.tsx", import.meta.url), "utf8");
  const postPage = readFileSync(new URL("../components/blog/BlogPostPageClient.tsx", import.meta.url), "utf8");
  const admin = readFileSync(new URL("../app/admin/blog/page.tsx", import.meta.url), "utf8");
  const helper = readFileSync(new URL("../components/blog/BlogHtmlAdminHelper.tsx", import.meta.url), "utf8");
  const api = readFileSync(new URL("../lib/blog/api.ts", import.meta.url), "utf8");

  assert.match(types, /content_format: "markdown" \| "html"/);
  assert.match(sanitize, /sanitizeBlogHtml/);
  assert.match(sanitize, /jsdelivr/);
  assert.match(sanitize, /splitBlogHtmlParts/);
  assert.match(htmlContent, /BlogHtmlContent/);
  assert.match(htmlContent, /blog-html-article/);
  assert.match(htmlContent, /activateScripts/);
  assert.match(postPage, /content_format === "html"/);
  assert.match(postPage, /BlogHtmlContent/);
  assert.match(postPage, /BlogMarkdown/);
  assert.match(admin, /content_format/);
  assert.match(admin, /BlogHtmlAdminHelper/);
  assert.match(helper, /chart-card/);
  assert.match(api, /token \? authFetch : apiFetch/);
});

test("sanitizeBlogHtml keeps chart.js and strips inline script without throwing", () => {
  const raw = `
<style>.aji-guide { color: red; }</style>
<div class="aji-guide">
  <canvas id="ajiVolOiBar"></canvas>
  <input id="ajiVol" type="number" value="1">
</div>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script>window.__ajiTest = true;</script>
`;

  const parts = splitBlogHtmlParts(raw);
  assert.equal(parts.styles.length, 1);
  assert.match(parts.styles[0], /\.aji-guide/);
  assert.equal(parts.inlineScripts.length, 1);
  assert.match(parts.inlineScripts[0], /__ajiTest/);

  const cleaned = sanitizeBlogHtml(raw);
  assert.doesNotThrow(() => DOMPurify.sanitize(cleaned, { ADD_TAGS: ["canvas", "input"] }));
  assert.match(cleaned, /chart\.js/);
  assert.match(cleaned, /ajiVolOiBar/);
  assert.match(cleaned, /<input/);
  assert.doesNotMatch(cleaned, /__ajiTest/);
});
