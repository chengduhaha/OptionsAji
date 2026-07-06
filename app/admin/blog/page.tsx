"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import BlogHtmlAdminHelper from "@/components/blog/BlogHtmlAdminHelper";
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
  excerpt_en: "",
  body_zh: "",
  body_en: "",
  category: "insights",
  tags: "",
  status: "draft" as "draft" | "published",
  content_format: "markdown" as "markdown" | "html",
  members_only: false,
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
        excerpt_en: detail.excerpt_en ?? "",
        body_zh: detail.body_zh,
        body_en: detail.body_en ?? "",
        category: detail.category,
        tags: detail.tags.join(", "),
        status: detail.status,
        content_format: detail.content_format ?? "markdown",
        members_only: detail.members_only ?? false,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("blog.admin.loadFailed"));
    }
  }

  async function handleHtmlFile(file: File | null, locale: "zh" | "en") {
    if (!file) return;
    const text = await file.text();
    if (locale === "zh") {
      setForm((f) => ({ ...f, body_zh: text, content_format: "html" }));
    } else {
      setForm((f) => ({ ...f, body_en: text, content_format: "html" }));
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
      const payload = {
        slug: form.slug,
        title_zh: form.title_zh,
        title_en: form.title_en || undefined,
        excerpt_zh: form.excerpt_zh || undefined,
        excerpt_en: form.excerpt_en || undefined,
        body_zh: form.body_zh,
        body_en: form.body_en || undefined,
        content_format: form.content_format,
        category: form.category,
        tags,
        status: form.status,
        members_only: form.members_only,
      };
      if (editingId) {
        await updateBlogPost(editingId, payload, token);
        if (pdfFile) {
          await uploadBlogPdf(pdfFile, token, {
            postId: editingId,
            titleZh: form.title_zh || undefined,
          });
        }
      } else {
        const created = await createBlogPost(payload, token);
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

  const isHtml = form.content_format === "html";

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">{t("blog.admin.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("blog.admin.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/blog" className="text-sm text-primary hover:underline">
            {t("blog.admin.viewBlog")}
          </Link>
          <Link href="/admin/documents" className="text-sm font-semibold text-primary hover:underline">
            {t("blog.admin.documents.nav")}
          </Link>
          <Link href="/admin/courses" className="text-muted-foreground hover:text-primary hover:underline">
            {t("blog.admin.courses.nav")}
          </Link>
        </div>
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

        <fieldset className="space-y-3">
          <legend className="text-sm text-muted-foreground">{t("blog.admin.contentFormat")}</legend>
          <div className="flex flex-wrap gap-4">
            {(["markdown", "html"] as const).map((format) => (
              <label key={format} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="content_format"
                  checked={form.content_format === format}
                  onChange={() => setForm((f) => ({ ...f, content_format: format }))}
                />
                {format === "markdown" ? t("blog.admin.formatMarkdown") : t("blog.admin.formatHtml")}
              </label>
            ))}
          </div>
        </fieldset>

        {isHtml ? <BlogHtmlAdminHelper /> : null}

        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">
            {isHtml ? t("blog.admin.bodyHtml") : t("blog.admin.bodyMarkdown")}
          </span>
          <textarea
            required={!editingId}
            value={form.body_zh}
            onChange={(e) => setForm((f) => ({ ...f, body_zh: e.target.value }))}
            rows={isHtml ? 16 : 12}
            className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
          />
        </label>

        {isHtml ? (
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">{t("blog.admin.htmlUpload")}</span>
            <input
              type="file"
              accept=".html,text/html"
              onChange={(e) => void handleHtmlFile(e.target.files?.[0] ?? null, "zh")}
            />
          </label>
        ) : null}

        <fieldset className="space-y-4 rounded-lg border border-border/60 bg-secondary/20 p-4">
          <legend className="px-1 text-sm font-semibold text-muted-foreground">
            {t("blog.admin.englishSection")}
          </legend>
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">{t("blog.admin.titleEn")}</span>
            <input
              value={form.title_en}
              onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))}
              className="w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">{t("blog.admin.excerptEn")}</span>
            <textarea
              value={form.excerpt_en}
              onChange={(e) => setForm((f) => ({ ...f, excerpt_en: e.target.value }))}
              rows={2}
              className="w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">
              {isHtml ? t("blog.admin.bodyHtmlEn") : t("blog.admin.bodyMarkdownEn")}
            </span>
            <textarea
              value={form.body_en}
              onChange={(e) => setForm((f) => ({ ...f, body_en: e.target.value }))}
              rows={isHtml ? 16 : 12}
              className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
            />
          </label>
          {isHtml ? (
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">{t("blog.admin.htmlUploadEn")}</span>
              <input
                type="file"
                accept=".html,text/html"
                onChange={(e) => void handleHtmlFile(e.target.files?.[0] ?? null, "en")}
              />
            </label>
          ) : null}
        </fieldset>

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
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.members_only}
              onChange={(e) => setForm((f) => ({ ...f, members_only: e.target.checked }))}
            />
            <span className="text-muted-foreground">{t("blog.admin.membersOnly")}</span>
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
                    {post.content_format === "html" ? " · HTML" : " · MD"}
                    {post.title_en ? ` · ${t("blog.admin.hasEnglish")}` : ""}
                    {post.attachment_count > 0 ? ` · PDF×${post.attachment_count}` : ""}
                  </p>
                  {post.status === "draft" ? (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      {t("blog.admin.draftPublicHint")}
                    </p>
                  ) : null}
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
