"use client";

import { Lock, Play } from "lucide-react";

import { blogCategoryLabel } from "@/lib/blog/categories";
import { formatFileSize, pickLocalized } from "@/lib/blog/format";
import type { BlogAttachment } from "@/lib/blog/types";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type BlogCourseCardProps = {
  course: BlogAttachment;
  active?: boolean;
  locked?: boolean;
  onPlay: (course: BlogAttachment) => void;
};

export default function BlogCourseCard({ course, active = false, locked = false, onPlay }: BlogCourseCardProps) {
  const { locale, t } = useI18n();
  const title = pickLocalized(locale, course.title_zh, course.title_en, course.original_filename);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border-2 border-border bg-card transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_hsl(var(--primary)/0.35)]",
        active && "border-primary shadow-[4px_4px_0_0_hsl(var(--primary)/0.35)]",
      )}
    >
      <div className="relative aspect-video border-b-2 border-border bg-[linear-gradient(145deg,#e8e4e0_0%,#d4cfc8_100%)]">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, hsl(var(--foreground)) 0, hsl(var(--foreground)) 1px, transparent 1px, transparent 12px)",
          }}
        />
        {locked ? (
          <span className="absolute left-2 top-2 rounded border-2 border-foreground bg-primary px-2 py-0.5 text-[10px] font-extrabold">
            {t("blog.courses.memberOnly")}
          </span>
        ) : null}
        <div
          className={cn(
            "absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-foreground bg-primary shadow-[2px_2px_0_0_hsl(var(--foreground))]",
            locked && "opacity-50",
          )}
        >
          <Play className="h-4 w-4 fill-foreground text-foreground" />
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <span className="inline-block rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
          {blogCategoryLabel(t, course.category)}
        </span>
        <h3 className="mt-2 font-heading text-base font-bold leading-snug">{title}</h3>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-3 font-mono text-xs text-muted-foreground">
            <span>{formatFileSize(course.file_size)}</span>
            <span>{locked ? t("blog.courses.memberOnly") : t("blog.courses.previewAvailable")}</span>
          </div>
          <button
            type="button"
            disabled={locked}
            onClick={() => onPlay(course)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-2 text-xs font-bold transition-colors",
              locked
                ? "cursor-not-allowed border-border text-muted-foreground"
                : "border-foreground bg-foreground text-background hover:bg-primary hover:text-foreground",
            )}
            aria-label={locked ? t("blog.courses.playLocked") : t("blog.courses.playCourse", { title })}
          >
            {locked ? <Lock className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            {t("blog.courses.play")}
          </button>
        </div>
      </div>
    </article>
  );
}
