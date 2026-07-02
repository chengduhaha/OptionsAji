"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useCallback, useRef } from "react";

import CourseThumbnailPlaceholder from "@/components/blog/CourseThumbnailPlaceholder";
import { blogCategoryLabel } from "@/lib/blog/categories";
import { formatFileSize, formatVideoDuration, pickLocalized } from "@/lib/blog/format";
import { prefetchBlogPlayToken } from "@/lib/blog/playTokenCache";
import type { BlogAttachment } from "@/lib/blog/types";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type BlogCourseCardProps = {
  course: BlogAttachment;
  locked?: boolean;
};

const PREFETCH_DEBOUNCE_MS = 200;

function durationLabel(course: BlogAttachment): string {
  if (course.duration_sec != null && course.duration_sec > 0) {
    return formatVideoDuration(course.duration_sec);
  }
  return formatFileSize(course.file_size);
}

export default function BlogCourseCard({ course, locked = false }: BlogCourseCardProps) {
  const { locale, t } = useI18n();
  const prefetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const title = pickLocalized(locale, course.title_zh, course.title_en, course.original_filename);
  const href = locked ? "/pricing" : `/blog/courses/${course.id}`;

  const handlePrefetch = useCallback(() => {
    if (locked) return;
    if (prefetchTimerRef.current) {
      clearTimeout(prefetchTimerRef.current);
    }
    prefetchTimerRef.current = setTimeout(() => {
      prefetchTimerRef.current = null;
      void prefetchBlogPlayToken(course.id).catch(() => undefined);
    }, PREFETCH_DEBOUNCE_MS);
  }, [course.id, locked]);

  const cancelPrefetch = useCallback(() => {
    if (prefetchTimerRef.current) {
      clearTimeout(prefetchTimerRef.current);
      prefetchTimerRef.current = null;
    }
  }, []);

  return (
    <article className="group">
      <Link
        href={href}
        onMouseEnter={handlePrefetch}
        onFocus={handlePrefetch}
        onMouseLeave={cancelPrefetch}
        onBlur={cancelPrefetch}
        className={cn(
          "block overflow-hidden rounded-xl border-2 border-border bg-card transition-all",
          !locked &&
            "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[4px_4px_0_0_hsl(var(--primary)/0.35)]",
          locked && "cursor-not-allowed opacity-80",
        )}
        aria-label={locked ? t("blog.courses.playLocked") : title}
      >
        <div className="relative aspect-video overflow-hidden border-b-2 border-border">
          <CourseThumbnailPlaceholder thumbnailUrl={course.thumbnail_url} alt={title} />
          {locked ? (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded border-2 border-foreground bg-primary px-2 py-0.5 text-[10px] font-extrabold">
              <Lock className="h-3 w-3" />
              {t("blog.courses.memberOnly")}
            </span>
          ) : null}
          <span className="absolute bottom-2 right-2 rounded border border-foreground/80 bg-foreground/90 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-background">
            {durationLabel(course)}
          </span>
        </div>

        <div className="p-3 sm:p-3.5">
          <h3 className="line-clamp-2 font-heading text-sm font-bold leading-snug text-foreground">{title}</h3>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {blogCategoryLabel(t, course.category)}
            {course.is_preview ? ` · ${t("blog.courses.previewAvailable")}` : null}
          </p>
        </div>
      </Link>
    </article>
  );
}
