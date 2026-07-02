"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileUp, ImagePlus, Upload } from "lucide-react";

import CourseThumbnailPlaceholder from "@/components/blog/CourseThumbnailPlaceholder";
import {
  fetchBlogAttachments,
  uploadBlogAttachmentThumbnail,
  uploadBlogCourse,
} from "@/lib/blog/api";
import type { BlogAttachment } from "@/lib/blog/types";
import { blogCategoryLabel } from "@/lib/blog/categories";
import { formatVideoDuration, pickLocalized } from "@/lib/blog/format";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const COURSE_CATEGORIES = [
  "course",
  "market-report",
  "unusual",
  "analysis",
  "premkt",
  "insights",
  "general",
] as const;

const EMPTY_UPLOAD_FORM = {
  title_zh: "",
  category: "course",
};

function formatFileSizeLocal(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function AdminCoursesPage() {
  const { token, user, ready, isAdmin } = useAuth();
  const router = useRouter();
  const { locale, t } = useI18n();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [courses, setCourses] = useState<BlogAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState(EMPTY_UPLOAD_FORM);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDragOver, setVideoDragOver] = useState(false);
  const [uploadingCourse, setUploadingCourse] = useState(false);

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

  function handleVideoSelect(file: File | null) {
    if (!file) return;
    const isMp4 =
      file.type === "video/mp4" ||
      file.type === "application/octet-stream" ||
      file.name.toLowerCase().endsWith(".mp4");
    if (!isMp4) {
      setError(t("blog.admin.courses.mp4Only"));
      return;
    }
    setVideoFile(file);
    if (!uploadForm.title_zh) {
      setUploadForm((f) => ({
        ...f,
        title_zh: file.name.replace(/\.mp4$/i, ""),
      }));
    }
  }

  async function handleCourseUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !videoFile) return;
    if (!uploadForm.title_zh.trim()) {
      setError(t("blog.admin.courses.titleRequired"));
      return;
    }
    setUploadingCourse(true);
    setError(null);
    try {
      await uploadBlogCourse(videoFile, token, {
        titleZh: uploadForm.title_zh.trim(),
        category: uploadForm.category,
      });
      setUploadForm(EMPTY_UPLOAD_FORM);
      setVideoFile(null);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("blog.admin.saveFailed"));
    } finally {
      setUploadingCourse(false);
    }
  }

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
        <h2 className="font-heading text-lg font-bold">{t("blog.admin.courses.uploadNew")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{t("blog.admin.courses.uploadHint")}</p>
        <form onSubmit={(e) => void handleCourseUpload(e)} className="mt-4 space-y-4">
          <div
            role="button"
            tabIndex={0}
            onDragOver={(e) => {
              e.preventDefault();
              setVideoDragOver(true);
            }}
            onDragLeave={() => setVideoDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setVideoDragOver(false);
              handleVideoSelect(e.dataTransfer.files?.[0] ?? null);
            }}
            onClick={() => videoInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                videoInputRef.current?.click();
              }
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
              videoDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
            )}
          >
            <FileUp className="mb-2 h-8 w-8 text-primary" />
            <p className="text-sm font-medium">{t("blog.admin.courses.dropHint")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("blog.admin.courses.dropSubhint")}</p>
            {videoFile ? (
              <p className="mt-3 rounded-lg border-2 border-border bg-secondary px-3 py-1.5 text-xs font-mono">
                {videoFile.name} · {formatFileSizeLocal(videoFile.size)}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-muted-foreground">
                {t("blog.admin.courses.titleZh")}
              </span>
              <input
                value={uploadForm.title_zh}
                onChange={(e) => setUploadForm((f) => ({ ...f, title_zh: e.target.value }))}
                className="w-full rounded-lg border-2 border-border bg-background px-3 py-2"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-muted-foreground">{t("blog.admin.category")}</span>
              <select
                value={uploadForm.category}
                onChange={(e) => setUploadForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg border-2 border-border bg-background px-3 py-2"
              >
                {COURSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {blogCategoryLabel(t, cat)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={uploadingCourse || !videoFile || !uploadForm.title_zh.trim()}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
              (uploadingCourse || !videoFile || !uploadForm.title_zh.trim()) && "opacity-60",
            )}
          >
            <Upload className="h-4 w-4" />
            {uploadingCourse ? t("blog.admin.courses.uploading") : t("blog.admin.courses.uploadVideo")}
          </button>
        </form>
      </section>

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
                        coverInputRef.current?.click();
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
        ref={videoInputRef}
        type="file"
        accept="video/mp4,.mp4"
        className="hidden"
        onChange={(e) => {
          handleVideoSelect(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      <input
        ref={coverInputRef}
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
