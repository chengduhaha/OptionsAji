"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { BlogApiError, fetchBlogPlayToken } from "@/lib/blog/api";
import { formatFileSize, formatVideoDuration, pickLocalized } from "@/lib/blog/format";
import { blogCategoryLabel } from "@/lib/blog/categories";
import type { BlogAttachment } from "@/lib/blog/types";
import { useI18n } from "@/lib/i18n/context";

type BlogCoursePlayerProps = {
  course: BlogAttachment | null;
  isMember: boolean;
  onEndedPreview?: () => void;
};

export default function BlogCoursePlayer({ course, isMember, onEndedPreview }: BlogCoursePlayerProps) {
  const { locale, t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [previewSeconds, setPreviewSeconds] = useState<number | null>(null);
  const [previewEnded, setPreviewEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const reset = useCallback(() => {
    setStreamUrl(null);
    setPreviewSeconds(null);
    setPreviewEnded(false);
    setError(null);
    setDuration(0);
    setCurrentTime(0);
  }, []);

  useEffect(() => {
    reset();
  }, [course?.id, reset]);

  const loadStream = useCallback(async () => {
    if (!course) return;
    setLoading(true);
    setError(null);
    setPreviewEnded(false);
    try {
      const token = await fetchBlogPlayToken(course.id);
      setStreamUrl(token.stream_url);
      setPreviewSeconds(token.preview ? token.preview_seconds : null);
      requestAnimationFrame(() => {
        void videoRef.current?.play().catch(() => undefined);
      });
    } catch (e: unknown) {
      if (e instanceof BlogApiError && e.status === 404) {
        setError(t("blog.courses.player.locked"));
      } else {
        setError(e instanceof Error ? e.message : t("blog.loadFailed"));
      }
    } finally {
      setLoading(false);
    }
  }, [course, t]);

  useEffect(() => {
    if (course) {
      void loadStream();
    }
  }, [course, loadStream]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (previewSeconds != null && video.currentTime >= previewSeconds) {
      video.pause();
      setPreviewEnded(true);
      onEndedPreview?.();
    }
  };

  if (!course) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border bg-secondary/20 px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">{t("blog.courses.player.selectCourse")}</p>
      </div>
    );
  }

  const title = pickLocalized(locale, course.title_zh, course.title_en, course.original_filename);

  return (
    <section className="mb-8 overflow-hidden rounded-xl border-2 border-border bg-card shadow-[4px_4px_0_0_hsl(var(--foreground)/0.08)]">
      <div className="border-b-2 border-border bg-secondary/30 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {isMember ? t("blog.courses.player.playingMember") : t("blog.courses.player.playingGuest")}
      </div>

      <div className="relative aspect-video bg-[linear-gradient(145deg,#e8e4e0_0%,#d4cfc8_100%)]">
        {streamUrl ? (
          <video
            ref={videoRef}
            className="h-full w-full bg-black object-contain"
            controls
            playsInline
            preload="metadata"
            src={streamUrl}
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
            onTimeUpdate={handleTimeUpdate}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {loading ? (
              <p className="text-sm text-muted-foreground">{t("blog.loading")}</p>
            ) : error ? (
              <p className="px-4 text-center text-sm text-destructive">{error}</p>
            ) : (
              <button
                type="button"
                onClick={() => void loadStream()}
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-foreground bg-primary shadow-[2px_2px_0_0_hsl(var(--foreground))]"
                aria-label={t("blog.courses.play")}
              >
                <Play className="h-5 w-5 fill-foreground text-foreground" />
              </button>
            )}
          </div>
        )}

        {previewEnded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/70 p-4 backdrop-blur-sm">
            <div className="max-w-md rounded-xl border-2 border-primary bg-card p-6 text-center shadow-[4px_4px_0_0_hsl(var(--primary)/0.35)]">
              <span className="inline-block rounded-md bg-foreground px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                {t("blog.courses.player.previewEndedBadge")}
              </span>
              <h3 className="mt-3 font-heading text-lg font-bold">{t("blog.courses.player.previewEndedTitle")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t("blog.courses.player.previewEndedBody")}</p>
              <Link
                href="/pricing"
                className="mt-4 inline-flex items-center justify-center rounded-lg border-2 border-primary bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-95"
              >
                {t("blog.courses.player.previewCta")}
              </Link>
            </div>
          </div>
        ) : null}

        {streamUrl && duration > 0 ? (
          <span className="pointer-events-none absolute bottom-3 right-3 rounded bg-foreground px-2 py-0.5 font-mono text-[11px] font-semibold text-background">
            {formatVideoDuration(currentTime)} / {formatVideoDuration(duration)}
          </span>
        ) : null}
      </div>

      <div className="border-t-2 border-border px-4 py-4 sm:px-5">
        <h2 className="font-heading text-lg font-bold">{title}</h2>
        <div className="mt-2 flex flex-wrap gap-3 font-mono text-xs text-muted-foreground">
          {duration > 0 ? <span>{formatVideoDuration(duration)}</span> : null}
          <span>{formatFileSize(course.file_size)}</span>
          <span>
            {t("blog.courses.categoryLabel")}: {blogCategoryLabel(t, course.category)}
          </span>
        </div>
      </div>
    </section>
  );
}
