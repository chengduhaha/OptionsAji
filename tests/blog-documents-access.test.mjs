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

test("blog attachment preview uses authenticated blob fetch", () => {
  const attachmentFile = readFileSync(
    new URL("../lib/blog/attachmentFile.ts", import.meta.url),
    "utf8",
  );
  const actionButtons = readFileSync(
    new URL("../components/blog/BlogAttachmentActionButtons.tsx", import.meta.url),
    "utf8",
  );
  const documentCard = readFileSync(
    new URL("../components/blog/BlogDocumentCard.tsx", import.meta.url),
    "utf8",
  );
  const pdfViewer = readFileSync(new URL("../components/blog/BlogPdfViewer.tsx", import.meta.url), "utf8");

  assert.match(attachmentFile, /authFetch/);
  assert.match(attachmentFile, /createObjectURL/);
  assert.match(actionButtons, /useBlogAttachmentActions/);
  assert.match(actionButtons, /void open\(attachment\.view_url\)/);
  assert.doesNotMatch(actionButtons, /<a[\s\S]*href=/);
  assert.match(documentCard, /BlogAttachmentActionButtons/);
  assert.match(pdfViewer, /BlogAttachmentActionButtons/);
});
