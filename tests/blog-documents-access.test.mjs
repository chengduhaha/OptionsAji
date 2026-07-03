import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

test("blog documents client forwards auth and exposes access metadata", () => {
  const api = readFileSync(new URL("../lib/blog/api.ts", import.meta.url), "utf8");
  const types = readFileSync(new URL("../lib/blog/types.ts", import.meta.url), "utf8");

  const fnStart = api.indexOf("export async function fetchBlogDocuments");
  assert.notEqual(fnStart, -1);
  const fnBody = api.slice(fnStart, api.indexOf("export async function fetchBlogAttachments", fnStart));

  assert.match(fnBody, /authFetch\(`/);
  assert.doesNotMatch(fnBody, /apiFetch\(`/);
  assert.match(types, /access:\s*BlogDocumentAccess/);
  assert.match(types, /is_member:\s*boolean/);
});

test("blog attachment preview uses authenticated blob fetch and inline iframe modal", () => {
  const attachmentFile = readFileSync(
    new URL("../lib/blog/attachmentFile.ts", import.meta.url),
    "utf8",
  );
  const actionButtons = readFileSync(
    new URL("../components/blog/BlogAttachmentActionButtons.tsx", import.meta.url),
    "utf8",
  );
  const previewModal = readFileSync(
    new URL("../components/blog/BlogPdfPreviewModal.tsx", import.meta.url),
    "utf8",
  );
  const attachmentActions = readFileSync(
    new URL("../lib/blog/useBlogAttachmentActions.ts", import.meta.url),
    "utf8",
  );
  const documentCard = readFileSync(
    new URL("../components/blog/BlogDocumentCard.tsx", import.meta.url),
    "utf8",
  );
  const pdfViewer = readFileSync(new URL("../components/blog/BlogPdfViewer.tsx", import.meta.url), "utf8");

  assert.match(attachmentFile, /authFetch/);
  assert.match(attachmentFile, /fetchBlogAttachmentPreviewUrl/);
  assert.match(attachmentFile, /revokeBlogAttachmentPreviewUrl/);
  assert.doesNotMatch(attachmentFile, /window\.open/);
  assert.match(previewModal, /<iframe/);
  assert.match(actionButtons, /BlogPdfPreviewModal/);
  assert.match(actionButtons, /useBlogAttachmentActions/);
  assert.match(actionButtons, /void open\(attachment\.view_url, previewTitle\)/);
  assert.doesNotMatch(actionButtons, /<a[\s\S]*href=/);
  assert.match(attachmentActions, /closePreview/);
  assert.match(documentCard, /BlogAttachmentActionButtons/);
  assert.match(documentCard, /previewTitle=\{title\}/);
  assert.match(pdfViewer, /BlogAttachmentActionButtons/);
  assert.match(pdfViewer, /previewTitle=\{title\}/);
});

test("CSP allows blob URLs in PDF preview iframe", () => {
  const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(config, /frame-src[^;]*blob:/);
  assert.match(config, /object-src[^;]*blob:/);
});
