"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import BlogDocumentCard from "@/components/blog/BlogDocumentCard";
import BlogShell from "@/components/blog/BlogShell";
import { fetchBlogDocuments } from "@/lib/blog/api";
import type { BlogAttachment } from "@/lib/blog/types";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export default function BlogDocumentsPageClient() {
  const { t } = useI18n();
  const [docs, setDocs] = useState<BlogAttachment[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBlogDocuments({ category: category || undefined });
      setDocs(data.items);
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
    <BlogShell title={t("blog.documents.title")} subtitle={t("blog.documents.subtitle")} variant="wide">
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
              {t(`blog.documents.categories.${cat}`) === `blog.documents.categories.${cat}` ? cat : t(`blog.documents.categories.${cat}`)}
            </button>
          ))}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("blog.loading")}</p>
      ) : error ? (
        <p className="rounded-xl border-2 border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : docs.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-secondary/20 px-6 py-16 text-center">
          <p className="text-muted-foreground">{t("blog.documents.empty")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("blog.documents.emptyHint")}</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => (
            <BlogDocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}

      <div className="mt-12 rounded-xl border-2 border-primary/30 bg-primary/5 px-6 py-8 text-center">
        <h3 className="font-heading text-lg font-bold">{t("blog.documents.ctaTitle")}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t("blog.documents.ctaBody")}</p>
        <Link
          href="/pricing"
          className="mt-4 inline-flex rounded-lg border-2 border-primary bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          {t("blog.documents.ctaButton")}
        </Link>
      </div>
    </BlogShell>
  );
}
