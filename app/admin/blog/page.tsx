"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  createBlogPost,
  deleteBlogPost,
  fetchBlogPost,
  fetchBlogPosts,
  updateBlogPost,
  uploadBlogPdf,
} from "@/lib/blog/api";
import type { BlogPostSummary } from "@/lib/blog/types";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";

const EMPTY_FORM = {
  slug: "",
  title_zh: "",
  title_en: "",
  excerpt_zh: "",
  body_zh: "",
  category: "insights",
  tags: "",
  status: "draft" as "draft" | "published",
};

export default function AdminBlogPage() {
  const { token, user, ready, isAdmin } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBlogPosts({ include_drafts: true, page_size: 100, token });
      setPosts(data.items);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("blog.admin.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    if (!ready) return;
    if (!user) return;
    if (!isAdmin) {
      router.replace("/");
      return;
    }
    void load();
  }, [ready, user, isAdmin, router, load]);

  async function startEdit(post: BlogPostSummary) {
    if (!token) return;
    setEditingId(post.id);
    setError(null);
    try {
      const detail = await fetchBlogPost(post.slug, token);
      setForm({
        slug: detail.slug,
        title_zh: detail.title_zh,
        title_en: detail.title_en ?? "",
        excerpt_zh: detail.excerpt_zh ?? "",
        body_zh: detail.body_zh,
        category: detail.category,
        tags: detail.tags.join(", "),
        status: detail.status,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("blog.admin.loadFailed"));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const tags = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      if (editingId) {
        await updateBlogPost(
          editingId,
          {
            slug: form.slug,
            title_zh: form.title_zh,
            title_en: form.title_en || undefined,
            excerpt_zh: form.excerpt_zh || undefined,
            body_zh: form.body_zh || undefined,
            category: form.category,
            tags,
            status: form.status,
          },
          token,
        );
      } else {
        const created = await createBlogPost(
          {
            slug: form.slug,
            title_zh: form.title_zh,
            title_en: form.title_en || undefined,
            excerpt_zh: form.excerpt_zh || undefined,
            body_zh: form.body_zh,
            category: form.category,
            tags,
            status: form.status,
          },
          token,
        );
        if (pdfFile) {
          await uploadBlogPdf(pdfFile, token, { postId: created.id, titleZh: form.title_zh });
        }
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      setPdfFile(null);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("blog.admin.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(postId: string) {
    if (!token) return;
    if (!window.confirm(t("blog.admin.confirmDelete"))) return;
    try {
      await deleteBlogPost(postId, token);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("blog.admin.saveFailed"));
    }
  }

  async function handleUploadPdf(postId: string) {
    if (!token || !pdfFile) return;
    try {
      await uploadBlogPdf(pdfFile, token, { postId, titleZh: form.title_zh || undefined });
      setPdfFile(null);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("blog.admin.saveFailed"));
    }
  }

  if (!ready || !user || !isAdmin) {
    return <div className="p-8 text-sm text-muted-foreground">{t("blog.admin.loading")}</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">{t("blog.admin.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("blog.admin.subtitle")}</p>
        </div>
        <Link href="/blog" className="text-sm text-primary hover:underline">
          {t("blog.admin.viewBlog")}
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="font-heading text-lg font-semibold">
          {editingId ? t("blog.admin.editPost") : t("blog.admin.newPost")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">{t("blog.admin.slug")}</span>
            <input
              required
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">{t("blog.admin.category")}</span>
            <input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">{t("blog.admin.titleZh")}</span>
          <input
            required
            value={form.title_zh}
            onChange={(e) => setForm((f) => ({ ...f, title_zh: e.target.value }))}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">{t("blog.admin.excerptZh")}</span>
          <textarea
            value={form.excerpt_zh}
            onChange={(e) => setForm((f) => ({ ...f, excerpt_zh: e.target.value }))}
            rows={2}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">{t("blog.admin.bodyZh")}</span>
          <textarea
            required={!editingId}
            value={form.body_zh}
            onChange={(e) => setForm((f) => ({ ...f, body_zh: e.target.value }))}
            rows={12}
            className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">{t("blog.admin.tags")}</span>
          <input
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="期权,教育"
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm">
            <span className="mr-2 text-muted-foreground">{t("blog.admin.status")}</span>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as "draft" | "published" }))
              }
              className="rounded-md border border-border bg-background px-3 py-2"
            >
              <option value="draft">{t("blog.admin.draft")}</option>
              <option value="published">{t("blog.admin.published")}</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mr-2 text-muted-foreground">{t("blog.admin.pdf")}</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {saving ? t("blog.admin.saving") : t("blog.admin.save")}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY_FORM);
              }}
              className="rounded-md border border-border px-4 py-2 text-sm"
            >
              {t("blog.admin.cancel")}
            </button>
          ) : null}
        </div>
      </form>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-heading text-lg font-semibold">{t("blog.admin.postList")}</h2>
        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">{t("blog.loading")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {posts.map((post) => (
              <li key={post.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{post.title_zh}</p>
                  <p className="text-xs text-muted-foreground">
                    /blog/{post.slug} · {post.status} · {post.category}
                    {post.attachment_count > 0 ? ` · PDF×${post.attachment_count}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary"
                  >
                    {t("blog.admin.preview")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => startEdit(post)}
                    className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary"
                  >
                    {t("blog.admin.edit")}
                  </button>
                  {pdfFile ? (
                    <button
                      type="button"
                      onClick={() => void handleUploadPdf(post.id)}
                      className="rounded-md border border-primary px-3 py-1.5 text-xs text-primary"
                    >
                      {t("blog.admin.attachPdf")}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void handleDelete(post.id)}
                    className="rounded-md border border-destructive/40 px-3 py-1.5 text-xs text-destructive"
                  >
                    {t("blog.admin.delete")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
