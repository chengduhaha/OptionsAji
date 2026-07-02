import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

test("blog courses API client uses authFetch and play-token flow", () => {
  const api = readFileSync(new URL("../lib/blog/api.ts", import.meta.url), "utf8");
  const types = readFileSync(new URL("../lib/blog/types.ts", import.meta.url), "utf8");
  const player = readFileSync(new URL("../components/blog/BlogCoursePlayer.tsx", import.meta.url), "utf8");
  const listPage = readFileSync(
    new URL("../components/blog/BlogCoursesPageClient.tsx", import.meta.url),
    "utf8",
  );
  const watchPage = readFileSync(new URL("../app/blog/courses/[id]/page.tsx", import.meta.url), "utf8");
  const proxy = readFileSync(new URL("../app/api/blog/[...path]/route.ts", import.meta.url), "utf8");

  assert.match(api, /export async function fetchBlogCourses/);
  assert.match(api, /export async function fetchBlogCourse/);
  assert.match(api, /export async function fetchBlogPlayToken/);
  assert.match(api, /authFetch\(`\/api\/blog\/courses/);
  assert.match(api, /sort/);
  assert.match(api, /method: "POST"/);
  assert.match(types, /BlogPlayTokenResponse/);
  assert.match(types, /duration_sec/);
  assert.match(types, /thumbnail_url/);
  assert.match(types, /media_kind/);
  assert.match(player, /prefetchBlogPlayToken|getCachedPlayToken/);
  assert.match(player, /<video/);
  assert.match(player, /preload="metadata"/);
  assert.match(player, /loadingVideo/);
  assert.doesNotMatch(player, /createObjectURL|blob:/);
  assert.match(player, /previewSeconds/);
  assert.match(listPage, /grid-cols-3/);
  assert.match(listPage, /COURSES_PAGE_SIZE = 12/);
  assert.doesNotMatch(listPage, /BlogCoursePlayer/);
  assert.match(watchPage, /BlogCourseWatchPageClient/);
  assert.match(proxy, /video\//);
  assert.match(proxy, /Range/);
});

test("blog shell and courses page expose /blog/courses navigation", () => {
  const shell = readFileSync(new URL("../components/blog/BlogShell.tsx", import.meta.url), "utf8");
  const page = readFileSync(new URL("../app/blog/courses/page.tsx", import.meta.url), "utf8");
  const i18n = readFileSync(new URL("../lib/i18n/namespaces.ts", import.meta.url), "utf8");

  assert.match(shell, /\/blog\/courses/);
  assert.match(page, /BlogCoursesPageClient/);
  assert.match(i18n, /courses:\s*\{/);
  assert.match(i18n, /courses: "视频课程"/);
  assert.match(i18n, /totalCount/);
});
