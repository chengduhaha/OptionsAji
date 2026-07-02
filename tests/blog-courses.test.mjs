import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

test("blog courses API client uses authFetch and play-token flow", () => {
  const api = readFileSync(new URL("../lib/blog/api.ts", import.meta.url), "utf8");
  const types = readFileSync(new URL("../lib/blog/types.ts", import.meta.url), "utf8");
  const player = readFileSync(new URL("../components/blog/BlogCoursePlayer.tsx", import.meta.url), "utf8");
  const coursesTab = readFileSync(new URL("../components/blog/BlogCoursesTab.tsx", import.meta.url), "utf8");
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
  assert.match(player, /controlsList="nodownload/);
  assert.match(player, /onContextMenu/);
  assert.match(api, /uploadBlogAttachmentThumbnail/);
  assert.match(api, /uploadBlogCourse/);
  assert.match(coursesTab, /grid-cols-3/);
  assert.match(coursesTab, /COURSES_PAGE_SIZE = 12/);
  assert.doesNotMatch(coursesTab, /BlogCoursePlayer/);
  assert.match(watchPage, /BlogCourseWatchPageClient/);
  assert.match(proxy, /video\//);
  assert.match(proxy, /Range/);
});

test("member library hub uses tabs and redirects legacy /blog/courses", () => {
  const shell = readFileSync(new URL("../components/blog/BlogShell.tsx", import.meta.url), "utf8");
  const library = readFileSync(new URL("../components/blog/BlogLibraryPageClient.tsx", import.meta.url), "utf8");
  const coursesPage = readFileSync(new URL("../app/blog/courses/page.tsx", import.meta.url), "utf8");
  const footer = readFileSync(new URL("../lib/v4/navConfig.ts", import.meta.url), "utf8");
  const i18n = readFileSync(new URL("../lib/i18n/namespaces.ts", import.meta.url), "utf8");

  assert.doesNotMatch(shell, /href: "\/blog\/courses"/);
  assert.match(library, /tabDocuments/);
  assert.match(library, /tabVideos/);
  assert.match(library, /BlogDocumentsTab/);
  assert.match(library, /BlogCoursesTab/);
  assert.match(coursesPage, /redirect\("\/blog\/documents\?tab=videos"\)/);
  assert.equal((footer.match(/\/blog\/courses/g) ?? []).length, 0);
  assert.match(i18n, /library:\s*\{/);
  assert.match(i18n, /tabVideos: "视频课程"/);
});

test("admin courses page and header expose cover management", () => {
  const adminPage = readFileSync(new URL("../app/admin/courses/page.tsx", import.meta.url), "utf8");
  const header = readFileSync(new URL("../components/v4/V4SiteHeader.tsx", import.meta.url), "utf8");
  const navConfig = readFileSync(new URL("../lib/v4/navConfig.ts", import.meta.url), "utf8");
  const siteFooter = readFileSync(new URL("../components/v4/V4SiteFooter.tsx", import.meta.url), "utf8");
  const hub = readFileSync(new URL("../components/blog/BlogHubPageClient.tsx", import.meta.url), "utf8");
  const api = readFileSync(new URL("../lib/blog/api.ts", import.meta.url), "utf8");

  assert.match(adminPage, /uploadBlogAttachmentThumbnail/);
  assert.match(adminPage, /uploadBlogCourse/);
  assert.match(adminPage, /deleteBlogAttachment/);
  assert.match(adminPage, /coverFile/);
  assert.match(adminPage, /confirmDelete/);
  assert.match(adminPage, /uploadNew/);
  assert.match(api, /coverFile\?: File/);
  assert.match(hub, /BLOG_POSTS_PAGE_SIZE = 12/);
  assert.match(hub, /LeaderboardPagination/);
  const placeholder = readFileSync(new URL("../components/blog/CourseThumbnailPlaceholder.tsx", import.meta.url), "utf8");
  assert.match(placeholder, /resolveApiUrl\(thumbnailUrl\)/);
  assert.match(placeholder, /from "next\/image"/);
  assert.match(placeholder, /loading="lazy"/);
  assert.match(header, /blog\.admin\.hub/);
  assert.match(header, /AdminNavDropdown/);
  assert.match(navConfig, /V4_ADMIN_LINKS/);
  assert.match(navConfig, /\/admin\/courses/);
  assert.match(siteFooter, /\/admin\/courses/);
});

test("course player overlays dynamic anti-piracy watermark while playing", () => {
  const player = readFileSync(new URL("../components/blog/BlogCoursePlayer.tsx", import.meta.url), "utf8");
  const watermark = readFileSync(new URL("../components/blog/VideoWatermarkOverlay.tsx", import.meta.url), "utf8");

  assert.match(player, /VideoWatermarkOverlay/);
  assert.match(player, /onPlay=\{\(\) => setIsPlaying\(true\)\}/);
  assert.match(watermark, /watermarkLabel/);
  assert.match(watermark, /pointer-events-none/);
  assert.match(watermark, /randomBetween\(8000, 15000\)/);
  assert.match(watermark, /访客/);
});

test("data boards nav is merged into a single dropdown", () => {
  const header = readFileSync(new URL("../components/v4/V4SiteHeader.tsx", import.meta.url), "utf8");
  const navConfig = readFileSync(new URL("../lib/v4/navConfig.ts", import.meta.url), "utf8");

  assert.match(navConfig, /V4_DATA_BOARDS/);
  assert.match(navConfig, /v4\.nav\.dataBoards/);
  assert.doesNotMatch(navConfig, /V4_NAV_GROUPS/);
  assert.match(header, /DataBoardsDropdown/);
  assert.doesNotMatch(header, /V4_NAV_GROUPS/);
});
