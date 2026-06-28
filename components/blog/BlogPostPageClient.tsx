"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import BlogMarkdown from "@/components/blog/BlogMarkdown";
import BlogPdfViewer from "@/components/blog/BlogPdfViewer";
import BlogShell from "@/components/blog/BlogShell";
import { BlogApiError, fetchBlogPost } from "@/lib/blog/api";
import type { BlogPostDetail } from "@/lib/blog/types";
import { useAuth } from "@/lib/auth-context";
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
    month: "long",
    day: "numeric",
  });
}

type BlogPostPageClientProps = {
  slug: string;
};

export default function BlogPostPageClient({ slug }: BlogPostPageClientProps) {
  const { locale, t } = useI18n();
  const { isAdmin } = useAuth();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setErrorCode(null);
    fetchBlogPost(slug)
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (e instanceof BlogApiError) {
          setErrorCode(e.code);
          if (e.code === "draft") {
            setError(t("blog.draftNotPublic"));
          } else if (e.code === "not_found") {
            setError(t("blog.notFound"));
          } else {
            setError(e.message || t("blog.loadFailed"));
          }
        } else {
          setError(e instanceof Error ? e.message : t("blog.loadFailed"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, t]);

  if (loading) {
    return (
      <BlogShell title={t("blog.loading")}>
        <p className="text-sm text-muted-foreground">{t("blog.loading")}</p>
      </BlogShell>
    );
  }

  if (error || !post) {
    const title =
      errorCode === "draft"
        ? t("blog.draftTitle")
        : errorCode === "not_found"
          ? t("blog.notFound")
          : t("blog.loadFailed");
    return (
      <BlogShell title={title}>
        <p className="text-sm text-destructive">{error ?? t("blog.notFound")}</p>
        {errorCode === "draft" ? (
          <p className="mt-2 text-sm text-muted-foreground">{t("blog.draftHint")}</p>
        ) : null}
        <Link href="/blog" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← {t("blog.backToList")}
        </Link>
      </BlogShell>
    );
  }

  const title = pickLocalized(locale, post.title_zh, post.title_en, post.slug);
  const body = pickLocalized(locale, post.body_zh, post.body_en, post.body_zh);

  return (
    <BlogShell title={title} subtitle={formatDate(post.published_at, locale)}>
      {post.status === "draft" && isAdmin ? (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {t("blog.draftPreviewBanner")}
        </div>
      ) : null}
      <article className="rounded-xl border border-border bg-card px-5 py-6 md:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
            {post.category}
          </span>
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-md border border-border px-2 py-0.5">
              #{tag}
            </span>
          ))}
        </div>
        <BlogMarkdown content={body} />
        <BlogPdfViewer attachments={post.attachments} requireAuth={post.status === "draft"} />
      </article>
      <div className="mt-6">
        <Link href="/blog" className="text-sm text-primary hover:underline">
          ← {t("blog.backToList")}
        </Link>
      </div>
    </BlogShell>
  );
}
