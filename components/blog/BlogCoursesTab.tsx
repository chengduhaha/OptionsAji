"use client";

import { useCallback, useEffect, useState } from "react";

import BlogCourseCard from "@/components/blog/BlogCourseCard";
import { LeaderboardPagination } from "@/components/v4/LeaderboardPagination";
import { fetchBlogCourses } from "@/lib/blog/api";
import { blogCategoryLabel } from "@/lib/blog/categories";
import type { BlogAttachment, BlogDocumentAccess } from "@/lib/blog/types";
import { formatMessage } from "@/lib/i18n/dictionary";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const COURSES_PAGE_SIZE = 12;

type CourseSort = "newest" | "oldest";

type BlogCoursesTabProps = {
  onAccessChange?: (access: BlogDocumentAccess | null) => void;
};

export default function BlogCoursesTab({ onAccessChange }: BlogCoursesTabProps) {
  const { t } = useI18n();
  const [courses, setCourses] = useState<BlogAttachment[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<CourseSort>("newest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / COURSES_PAGE_SIZE));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBlogCourses({
        category: category || undefined,
        page,
        page_size: COURSES_PAGE_SIZE,
        sort,
      });
      setCourses(data.items);
      setCategories(data.categories);
      setTotal(data.total);
      onAccessChange?.(data.access);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("blog.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [category, page, sort, t, onAccessChange]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [category, sort]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {!loading && !error ? (
          <p className="text-sm font-medium text-foreground">
            {formatMessage(t("blog.courses.totalCount"), { count: String(total) })}
          </p>
        ) : (
          <span className="h-5" />
        )}

        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "newest" as const, label: t("blog.courses.sortNewest") },
              { key: "oldest" as const, label: t("blog.courses.sortOldest") },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSort(item.key)}
              className={cn(
                "rounded-full border-2 px-4 py-1.5 text-xs font-semibold transition-colors",
                sort === item.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-secondary",
              )}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            disabled
            title={t("blog.courses.sortPopularSoon")}
            className="cursor-not-allowed rounded-full border-2 border-dashed border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground/60"
          >
            {t("blog.courses.sortPopular")}
          </button>
        </div>
      </div>

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

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-xl border-2 border-border bg-card">
              <div className="aspect-video bg-secondary/50" />
              <div className="space-y-2 p-3.5">
                <div className="h-4 w-4/5 rounded bg-secondary/60" />
                <div className="h-3 w-1/3 rounded bg-secondary/40" />
              </div>
            </div>
          ))}
        </div>
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
            <BlogCourseCard
              key={course.id}
              course={course}
              locked={course.is_locked === true}
              priorityThumbnail={index < 3}
            />
          ))}
        </div>
      )}

      {!loading && !error && totalPages > 1 ? (
        <LeaderboardPagination
          page={page}
          totalPages={totalPages}
          totalRows={total}
          loading={loading}
          onPageChange={setPage}
          className="mt-8 rounded-xl border-2 border-border"
        />
      ) : null}
    </>
  );
}
