"use client";

import Link from "next/link";
import { Calendar, FileText, Lock } from "lucide-react";

import { blogCategoryLabel } from "@/lib/blog/categories";
import { pickLocalized } from "@/lib/blog/format";
import type { BlogPostSummary } from "@/lib/blog/types";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/types";

function formatDate(value: string | null, locale: Locale): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale === "en" ? "en-US" : "zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type BlogPostCardProps = {
  post: BlogPostSummary;
};

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const { locale, t } = useI18n();
  const title = pickLocalized(locale, post.title_zh, post.title_en, post.slug);
  const excerpt = pickLocalized(locale, post.excerpt_zh, post.excerpt_en, "");

  return (
    <article className="group flex h-full flex-col rounded-xl border-2 border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-[4px_4px_0_0_hsl(var(--primary)/0.12)]">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">
          {blogCategoryLabel(t, post.category)}
        </span>
        {post.members_only ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 font-semibold text-amber-700 dark:text-amber-200">
            <Lock className="h-3 w-3" aria-hidden />
            {t("blog.article.membersOnlyBadge")}
          </span>
        ) : null}
        {post.published_at ? (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <time dateTime={post.published_at}>{formatDate(post.published_at, locale)}</time>
          </span>
        ) : null}
        {post.attachment_count > 0 ? (
          <span className="inline-flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {t("blog.pdfCount").replace("{count}", String(post.attachment_count))}
          </span>
        ) : null}
      </div>

      <h2 className="mt-3 font-heading text-xl font-bold leading-snug tracking-tight transition-colors group-hover:text-primary">
        <Link href={`/blog/${post.slug}`}>{title}</Link>
      </h2>

      {excerpt ? (
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">{excerpt}</p>
      ) : (
        <div className="flex-1" />
      )}

      {post.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      <Link
        href={`/blog/${post.slug}`}
        className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
      >
        {t("blog.readMore")} →
      </Link>
    </article>
  );
}
