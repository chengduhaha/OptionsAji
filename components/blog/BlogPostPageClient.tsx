"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

import BlogMarkdown from "@/components/blog/BlogMarkdown";
import BlogPdfViewer from "@/components/blog/BlogPdfViewer";
import BlogReadingProgress from "@/components/blog/BlogReadingProgress";
import BlogShareButtons from "@/components/blog/BlogShareButtons";
import BlogShell from "@/components/blog/BlogShell";
import BlogTableOfContents from "@/components/blog/BlogTableOfContents";
import { BlogApiError, fetchBlogPost } from "@/lib/blog/api";
import { blogCategoryLabel } from "@/lib/blog/categories";
import { isEnglishFallback, pickLocalized } from "@/lib/blog/format";
import { extractHeadings } from "@/lib/blog/headings";
import { estimateReadingMinutes } from "@/lib/blog/reading-time";
import type { BlogPostDetail } from "@/lib/blog/types";
import { useAuth } from "@/lib/auth-context";
import { formatMessage } from "@/lib/i18n/dictionary";
import { useI18n } from "@/lib/i18n/context";

const BlogHtmlContent = dynamic(() => import("@/components/blog/BlogHtmlContent"), {
  ssr: false,
  loading: () => <HtmlLoadingFallback />,
});

function HtmlLoadingFallback() {
  const { t } = useI18n();
  return <p className="text-sm text-muted-foreground">{t("blog.article.htmlLoading")}</p>;
}

function formatDate(value: string | null, locale: "zh" | "en"): string {
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
      <BlogShell title={t("blog.loading")} variant="wide">
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
      <BlogShell title={title} variant="wide">
        <p className="text-sm text-destructive">{error ?? t("blog.notFound")}</p>
        {errorCode === "draft" ? (
          <p className="mt-2 text-sm text-muted-foreground">{t("blog.draftHint")}</p>
        ) : null}
        <Link
          href="/blog#posts"
          className="mt-4 inline-block text-sm font-bold text-primary underline decoration-primary decoration-2 underline-offset-4 hover:opacity-90"
        >
          ← {t("blog.article.backToList")}
        </Link>
      </BlogShell>
    );
  }

  const title = pickLocalized(locale, post.title_zh, post.title_en, post.slug);
  const body = pickLocalized(locale, post.body_zh, post.body_en, post.body_zh);
  const excerpt = pickLocalized(locale, post.excerpt_zh, post.excerpt_en, "");
  const showingChineseFallback = isEnglishFallback(locale, post.body_en, post.body_zh);
  const isHtml = post.content_format === "html";
  const dateStr = formatDate(post.published_at, locale);
  const readingMinutes = estimateReadingMinutes(body);
  const readTimeLabel = formatMessage(t("blog.article.readTime"), { minutes: readingMinutes });

  const metaParts = [blogCategoryLabel(t, post.category), dateStr, readTimeLabel].filter(Boolean);
  const tocHeadings = isHtml ? [] : extractHeadings(body);
  const hasToc = tocHeadings.length > 0;

  return (
    <BlogShell variant="wide" hideHeader>
      <BlogReadingProgress />

      {post.status === "draft" && isAdmin ? (
        <div className="mb-6 border-2 border-amber-500/60 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-800 shadow-neo-sm dark:text-amber-200">
          {t("blog.draftPreviewBanner")}
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 border-2 border-foreground bg-card p-6 shadow-neo sm:p-8 md:p-9">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <p className="text-[0.8rem] font-bold tracking-wide text-muted-foreground">
              {metaParts.map((part, index) => (
                <span key={`${part}-${index}`}>
                  {index > 0 ? (
                    <span className="mx-1.5 text-primary" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  {part}
                </span>
              ))}
            </p>
            <BlogShareButtons slug={post.slug} title={title} />
          </div>
          <h1 className="border-b-2 border-foreground pb-5 font-heading text-[clamp(1.85rem,4.5vw,2.5rem)] font-black leading-[1.2] tracking-tight">
            {title}
          </h1>
          {excerpt ? (
            <p className="mt-5 border-l-[5px] border-primary pl-5 text-[1.1rem] font-medium leading-[1.7] text-muted-foreground">
              {excerpt}
            </p>
          ) : null}
          {post.tags.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-border bg-background px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        {showingChineseFallback ? (
          <div className="mb-6 border-2 border-primary/40 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
            {t("blog.article.translationFallback")}
          </div>
        ) : null}

        <div
          className={
            hasToc
              ? "lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_16.5rem] xl:gap-10"
              : undefined
          }
        >
          <div className="min-w-0">
            <div className="border-2 border-foreground bg-card p-6 shadow-neo sm:p-8 md:px-11 md:py-10">
              {isHtml ? (
                <BlogHtmlContent html={body} />
              ) : (
                <BlogMarkdown content={body} headings={tocHeadings} />
              )}
              {post.attachments.length > 0 ? <BlogPdfViewer attachments={post.attachments} /> : null}
            </div>

            <footer className="mt-10 border-t-2 border-border pt-6">
              <Link
                href="/blog#posts"
                className="inline-flex items-center gap-1 text-sm font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4 transition-colors hover:text-primary"
              >
                ← {t("blog.article.backToList")}
              </Link>
            </footer>
          </div>

          {hasToc ? (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <BlogTableOfContents
                  headings={tocHeadings}
                  title={t("blog.article.toc")}
                  navLabel={t("blog.article.tocNav")}
                />
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </BlogShell>
  );
}
