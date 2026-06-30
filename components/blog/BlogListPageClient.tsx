"use client";

import { useCallback, useEffect, useState } from "react";

import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogShell from "@/components/blog/BlogShell";
import { fetchBlogPosts } from "@/lib/blog/api";
import { blogCategoryHint, blogCategoryLabel } from "@/lib/blog/categories";
import type { BlogPostSummary } from "@/lib/blog/types";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export default function BlogListPageClient() {
  const { t } = useI18n();
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBlogPosts({
        page: 1,
        page_size: 50,
        category: category || undefined,
      });
      setPosts(data.items);
      setCategories(data.categories);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("blog.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [category, t]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <BlogShell title={t("blog.listTitle")} subtitle={t("blog.listSubtitle")}>
      {categories.length > 0 ? (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              category === ""
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-secondary",
            )}
          >
            {t("blog.allCategories")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              title={blogCategoryHint(t, cat)}
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                category === cat
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-secondary",
              )}
            >
              {blogCategoryLabel(t, cat)}
            </button>
          ))}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("blog.loading")}</p>
      ) : error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("blog.empty")}</p>
      ) : (
        <div className="grid gap-5">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </BlogShell>
  );
}
