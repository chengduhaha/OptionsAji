"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileUp, Trash2, Upload } from "lucide-react";

import {
  deleteBlogAttachment,
  fetchBlogAttachments,
  updateBlogAttachment,
  uploadBlogPdf,
} from "@/lib/blog/api";
import BlogAttachmentActionButtons from "@/components/blog/BlogAttachmentActionButtons";
import type { BlogAttachment } from "@/lib/blog/types";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const DOC_CATEGORIES = [
  "daily-report",
  "unusual",
  "course",
  "analysis",
  "premkt",
  "insights",
  "general",
] as const;

const EMPTY_FORM = {
  title_zh: "",
  category: "daily-report",
  description_zh: "",
  is_sample: true,
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminDocumentsPage() {
  const { token, user, ready, isAdmin } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<BlogAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBlogAttachments(token, { standaloneOnly: true });
      setDocs(data.items);
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

  function handleFileSelect(file: File | null) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError(t("blog.admin.documents.pdfOnly"));
      return;
    }
    setPdfFile(file);
    if (!form.title_zh) {
      setForm((f) => ({ ...f, title_zh: file.name.replace(/\.pdf$/i, "") }));
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !pdfFile) return;
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateBlogAttachment(
          editingId,
          {
            title_zh: form.title_zh,
            category: form.category,
            description_zh: form.description_zh || undefined,
            is_sample: form.is_sample,
          },
          token,
        );
      } else {
        await uploadBlogPdf(pdfFile, token, {
          titleZh: form.title_zh,
          category: form.category,
          descriptionZh: form.description_zh || undefined,
          isSample: form.is_sample,
        });
      }
      setForm(EMPTY_FORM);
      setPdfFile(null);
      setEditingId(null);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("blog.admin.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    if (!window.confirm(t("blog.admin.documents.confirmDelete"))) return;
    try {
      await deleteBlogAttachment(id, token);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("blog.admin.saveFailed"));
    }
  }

  function startEdit(doc: BlogAttachment) {
    setEditingId(doc.id);
    setForm({
      title_zh: doc.title_zh ?? "",
      category: doc.category,
      description_zh: doc.description_zh ?? "",
      is_sample: doc.is_sample,
    });
    setPdfFile(null);
  }

  if (!ready || !user || !isAdmin) {
    return <div className="p-8 text-sm text-muted-foreground">{t("blog.admin.loading")}</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border pb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">{t("blog.admin.documents.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("blog.admin.documents.subtitle")}</p>
        </div>
        <div className="flex gap-3 text-sm">
          <Link href="/admin/blog" className="text-muted-foreground hover:text-primary hover:underline">
            {t("blog.admin.nav")}
          </Link>
          <Link href="/blog/documents" className="font-semibold text-primary hover:underline">
            {t("blog.admin.viewDocuments")}
          </Link>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border-2 border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleUpload} className="space-y-5 rounded-2xl border-2 border-border bg-card p-6">
        <h2 className="font-heading text-lg font-bold">
          {editingId ? t("blog.admin.documents.editDoc") : t("blog.admin.documents.uploadDoc")}
        </h2>

        {!editingId ? (
          <div
            role="button"
            tabIndex={0}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFileSelect(e.dataTransfer.files[0] ?? null);
            }}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
              dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-secondary/30",
            )}
          >
            <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">{t("blog.admin.documents.dropHint")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("blog.admin.documents.dropSubhint")}</p>
            {pdfFile ? (
              <p className="mt-3 rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {pdfFile.name}
              </p>
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
            />
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-muted-foreground">{t("blog.admin.documents.titleZh")}</span>
            <input
              required
              value={form.title_zh}
              onChange={(e) => setForm((f) => ({ ...f, title_zh: e.target.value }))}
              className="w-full rounded-lg border-2 border-border bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-muted-foreground">{t("blog.admin.category")}</span>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-lg border-2 border-border bg-background px-3 py-2"
            >
              {DOC_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`blog.documents.categories.${cat}`)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-muted-foreground">{t("blog.admin.documents.description")}</span>
          <textarea
            value={form.description_zh}
            onChange={(e) => setForm((f) => ({ ...f, description_zh: e.target.value }))}
            rows={2}
            className="w-full rounded-lg border-2 border-border bg-background px-3 py-2"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_sample}
            onChange={(e) => setForm((f) => ({ ...f, is_sample: e.target.checked }))}
            className="rounded"
          />
          <span>{t("blog.admin.documents.isSample")}</span>
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving || (!editingId && !pdfFile)}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            <FileUp className="h-4 w-4" />
            {saving ? t("blog.admin.saving") : editingId ? t("blog.admin.save") : t("blog.admin.documents.upload")}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY_FORM);
                setPdfFile(null);
              }}
              className="rounded-lg border-2 border-border px-4 py-2 text-sm"
            >
              {t("blog.admin.cancel")}
            </button>
          ) : null}
        </div>
      </form>

      <section className="rounded-2xl border-2 border-border bg-card p-6">
        <h2 className="font-heading text-lg font-bold">{t("blog.admin.documents.list")}</h2>
        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">{t("blog.loading")}</p>
        ) : docs.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">{t("blog.admin.documents.empty")}</p>
        ) : (
          <ul className="mt-4 divide-y-2 divide-border">
            {docs.map((doc) => (
              <li key={doc.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{doc.title_zh ?? doc.original_filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.category} · {formatFileSize(doc.file_size)}
                    {doc.is_sample ? ` · ${t("blog.admin.documents.sample")}` : ""}
                  </p>
                  {doc.description_zh ? (
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{doc.description_zh}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <BlogAttachmentActionButtons
                    attachment={doc}
                    previewTitle={doc.title_zh ?? doc.original_filename}
                    openLabel={t("blog.admin.preview")}
                    downloadLabel={t("blog.downloadPdf")}
                    variant="admin"
                  />
                  <button
                    type="button"
                    onClick={() => startEdit(doc)}
                    className="rounded-lg border-2 border-border px-3 py-1.5 text-xs hover:bg-secondary"
                  >
                    {t("blog.admin.edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(doc.id)}
                    className="inline-flex items-center gap-1 rounded-lg border-2 border-destructive/40 px-3 py-1.5 text-xs text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
