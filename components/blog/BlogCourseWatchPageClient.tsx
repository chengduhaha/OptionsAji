"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import BlogCoursePlayer from "@/components/blog/BlogCoursePlayer";
import BlogShell from "@/components/blog/BlogShell";
import { BlogApiError, fetchBlogCourse } from "@/lib/blog/api";
import { prefetchBlogPlayToken } from "@/lib/blog/playTokenCache";
import type { BlogAttachment } from "@/lib/blog/types";
import { useI18n } from "@/lib/i18n/context";

type BlogCourseWatchPageClientProps = {
  courseId: string;
};

export default function BlogCourseWatchPageClient({ courseId }: BlogCourseWatchPageClientProps) {
  const { t } = useI18n();
  const [course, setCourse] = useState<BlogAttachment | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data] = await Promise.all([
        fetchBlogCourse(courseId),
        prefetchBlogPlayToken(courseId).catch(() => undefined),
      ]);
      setCourse(data);
      setIsMember(!data.is_preview);
    } catch (e: unknown) {
      if (e instanceof BlogApiError && e.status === 404) {
        setError(t("blog.courses.player.locked"));
      } else {
        setError(e instanceof Error ? e.message : t("blog.loadFailed"));
      }
    } finally {
      setLoading(false);
    }
  }, [courseId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <BlogShell title={t("blog.courses.watchTitle")} subtitle={t("blog.courses.watchSubtitle")} variant="wide">
      <Link
        href="/blog/documents?tab=videos"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("blog.courses.backToList")}
      </Link>

      {loading ? (
        <div className="overflow-hidden rounded-xl border-2 border-border bg-card">
          <div className="aspect-video animate-pulse bg-secondary/40" />
          <div className="space-y-2 border-t-2 border-border p-4">
            <div className="h-5 w-2/3 animate-pulse rounded bg-secondary/50" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-secondary/30" />
          </div>
        </div>
      ) : error ? (
        <p className="rounded-xl border-2 border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : course ? (
        <BlogCoursePlayer course={course} isMember={isMember} autoPlay />
      ) : null}
    </BlogShell>
  );
}
