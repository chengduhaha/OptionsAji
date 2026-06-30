"use client";

import { useCallback, useEffect, useState } from "react";

import BlogHeroSection from "@/components/blog/BlogHeroSection";
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogShell from "@/components/blog/BlogShell";
import { fetchBlogPosts } from "@/lib/blog/api";
import { blogCategoryHint, blogCategoryLabel } from "@/lib/blog/categories";
import type { BlogPostSummary } from "@/lib/blog/types";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export default function BlogHubPageClient() {
  const { t } = useI18n();
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBlogPosts({
        page: 1,
        page_size: 6,
        category: category || undefined,
      });
      setPosts(data.items);
      setCategories(data.categories);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <BlogShell variant="hub" hideHeader>
      <div className="space-y-10 sm:space-y-12">
        <BlogHeroSection />

        <section id="posts" className="scroll-mt-24">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-bold sm:text-3xl">{t("blog.listTitle")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("blog.listSubtitle")}</p>
            </div>
          </div>

          {categories.length > 0 ? (
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory("")}
                className={cn(
                  "rounded-full border-2 px-3 py-1 text-xs font-semibold transition-colors",
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
                  title={blogCategoryHint(t, cat)}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "rounded-full border-2 px-3 py-1 text-xs font-semibold transition-colors",
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
            <p className="text-sm text-muted-foreground">{t("blog.loading")}</p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("blog.empty")}</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </BlogShell>
  );
}
