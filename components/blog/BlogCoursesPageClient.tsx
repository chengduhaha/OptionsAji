"use client";

import { useCallback, useEffect, useState } from "react";

import BlogCourseCard from "@/components/blog/BlogCourseCard";
import BlogCoursePlayer from "@/components/blog/BlogCoursePlayer";
import BlogDocumentsAccessBanner from "@/components/blog/BlogDocumentsAccessBanner";
import BlogShell from "@/components/blog/BlogShell";
import { LeaderboardPagination } from "@/components/v4/LeaderboardPagination";
import { fetchBlogCourses } from "@/lib/blog/api";
import { blogCategoryLabel } from "@/lib/blog/categories";
import type { BlogAttachment, BlogDocumentAccess } from "@/lib/blog/types";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const COURSES_PAGE_SIZE = 20;

export default function BlogCoursesPageClient() {
  const { t } = useI18n();
  const [courses, setCourses] = useState<BlogAttachment[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [access, setAccess] = useState<BlogDocumentAccess | null>(null);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCourse, setActiveCourse] = useState<BlogAttachment | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / COURSES_PAGE_SIZE));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBlogCourses({
        category: category || undefined,
        page,
        page_size: COURSES_PAGE_SIZE,
      });
      setCourses(data.items);
      setCategories(data.categories);
      setAccess(data.access);
      setTotal(data.total);
      setActiveCourse((current) => {
        if (current && data.items.some((item) => item.id === current.id)) {
          return current;
        }
        return data.items[0] ?? null;
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("blog.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [category, page, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [category]);

  const isMember = access?.is_member ?? false;

  return (
    <BlogShell title={t("blog.courses.title")} subtitle={t("blog.courses.subtitle")} variant="wide">
      {access && access.member_total_count > 0 ? (
        <BlogDocumentsAccessBanner
          access={access}
          categoryFilter={category || undefined}
          i18nPrefix="blog.courses.accessBanner"
        />
      ) : null}

      {categories.length > 0 ? (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("")}
            className={cn(
              "rounded-full border-2 px-4 py-1.5 text-xs font-semibold transition-colors",
              category === ""
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-secondary",
            )}
          >
            {t("blog.allCategories")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border-2 px-4 py-1.5 text-xs font-semibold transition-colors",
                category === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-secondary",
              )}
            >
              {blogCategoryLabel(t, cat)}
            </button>
          ))}
        </div>
      ) : null}

      <BlogCoursePlayer course={activeCourse} isMember={isMember} />

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("blog.loading")}</p>
      ) : error ? (
        <p className="rounded-xl border-2 border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-secondary/20 px-6 py-16 text-center">
          <p className="text-muted-foreground">{t("blog.courses.empty")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("blog.courses.emptyHint")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {courses.map((course) => (
            <BlogCourseCard
              key={course.id}
              course={course}
              active={activeCourse?.id === course.id}
              onPlay={setActiveCourse}
            />
          ))}
        </div>
      )}

      {!loading && !error && totalPages > 1 ? (
        <LeaderboardPagination
          page={page}
          totalPages={totalPages}
          totalRows={total}
          onPageChange={setPage}
          className="mt-8"
        />
      ) : null}
    </BlogShell>
  );
}
