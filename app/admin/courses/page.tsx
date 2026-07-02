"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";

import CourseThumbnailPlaceholder from "@/components/blog/CourseThumbnailPlaceholder";
import { fetchBlogAttachments, uploadBlogAttachmentThumbnail } from "@/lib/blog/api";
import type { BlogAttachment } from "@/lib/blog/types";
import { blogCategoryLabel } from "@/lib/blog/categories";
import { formatVideoDuration, pickLocalized } from "@/lib/blog/format";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

function formatFileSizeLocal(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminCoursesPage() {
  const { token, user, ready, isAdmin } = useAuth();
  const router = useRouter();
  const { locale, t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [courses, setCourses] = useState<BlogAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBlogAttachments(token, { standaloneOnly: true });
      setCourses(data.items.filter((item) => item.media_kind === "video"));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("blog.admin.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    if (!ready) return;
    if (!user) return;
    if (!isAdmin) {
      router.replace("/");
      return;
    }
    void load();
  }, [ready, user, isAdmin, router, load]);

  async function handleThumbnailSelect(courseId: string, file: File | null) {
    if (!token || !file) return;
    if (!file.type.startsWith("image/")) {
      setError(t("blog.admin.courses.imageOnly"));
      return;
    }
    setUploadingId(courseId);
    setError(null);
    try {
      await uploadBlogAttachmentThumbnail(courseId, file, token);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("blog.admin.saveFailed"));
    } finally {
      setUploadingId(null);
      setSelectedId(null);
    }
  }

  if (!ready || !user || !isAdmin) {
    return <div className="p-8 text-sm text-muted-foreground">{t("blog.admin.loading")}</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border pb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">{t("blog.admin.courses.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("blog.admin.courses.subtitle")}</p>
          <p className="mt-2 text-xs text-muted-foreground">{t("blog.admin.courses.coverHint")}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/admin/blog" className="text-muted-foreground hover:text-primary hover:underline">
            {t("blog.admin.nav")}
          </Link>
          <Link href="/admin/documents" className="text-muted-foreground hover:text-primary hover:underline">
            {t("blog.admin.documents.nav")}
          </Link>
          <Link href="/blog/documents?tab=videos" className="font-semibold text-primary hover:underline">
            {t("blog.library.tabVideos")}
          </Link>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border-2 border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="rounded-2xl border-2 border-border bg-card p-6">
        <h2 className="font-heading text-lg font-bold">{t("blog.admin.courses.list")}</h2>
        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">{t("blog.loading")}</p>
        ) : courses.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">{t("blog.admin.courses.empty")}</p>
        ) : (
          <ul className="mt-4 divide-y-2 divide-border">
            {courses.map((course) => {
              const title = pickLocalized(locale, course.title_zh, course.title_en, course.original_filename);
              const isUploading = uploadingId === course.id;
              return (
                <li key={course.id} className="flex flex-wrap items-start gap-4 py-4">
                  <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg border-2 border-border">
                    <CourseThumbnailPlaceholder thumbnailUrl={course.thumbnail_url} alt={title} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{title}</p>
                    <p className="text-xs text-muted-foreground">
                      {blogCategoryLabel(t, course.category)} · {formatFileSizeLocal(course.file_size)}
                      {course.duration_sec ? ` · ${formatVideoDuration(course.duration_sec)}` : ""}
                    </p>
                    {course.description_zh ? (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{course.description_zh}</p>
                    ) : null}
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {course.thumbnail_url
                        ? t("blog.admin.courses.hasCover")
                        : t("blog.admin.courses.noCover")}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => {
                        setSelectedId(course.id);
                        fileInputRef.current?.click();
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border-2 border-primary bg-primary/10 px-3 py-2 text-xs font-semibold text-primary",
                        isUploading && "opacity-60",
                      )}
                    >
                      <ImagePlus className="h-3.5 w-3.5" />
                      {isUploading ? t("blog.admin.saving") : t("blog.admin.courses.uploadCover")}
                    </button>
                    <Link
                      href={`/blog/courses/${course.id}`}
                      className="rounded-lg border-2 border-border px-3 py-2 text-center text-xs hover:bg-secondary"
                    >
                      {t("blog.admin.preview")}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          if (selectedId && file) void handleThumbnailSelect(selectedId, file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
