"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

import type { BlogPostSummary } from "@/lib/blog/types";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/types";

function pickLocalized(
  locale: Locale,
  zh: string | null | undefined,
  en: string | null | undefined,
  fallback: string,
): string {
  if (locale === "en" && en?.trim()) return en;
  if (zh?.trim()) return zh;
  if (en?.trim()) return en;
  return fallback;
}

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
    <article className="group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
          {post.category}
        </span>
        {post.published_at ? (
          <time dateTime={post.published_at}>{formatDate(post.published_at, locale)}</time>
        ) : null}
        {post.attachment_count > 0 ? (
          <span className="inline-flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {t("blog.pdfCount").replace("{count}", String(post.attachment_count))}
          </span>
        ) : null}
      </div>
      <h2 className="mt-3 font-heading text-xl font-bold tracking-tight group-hover:text-primary">
        <Link href={`/blog/${post.slug}`} className="hover:underline">
          {title}
        </Link>
      </h2>
      {excerpt ? <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{excerpt}</p> : null}
      {post.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-border bg-secondary/60 px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
      <Link
        href={`/blog/${post.slug}`}
        className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
      >
        {t("blog.readMore")} →
      </Link>
    </article>
  );
}
