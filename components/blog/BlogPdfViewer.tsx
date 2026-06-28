"use client";

import { Download, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

import { blogAttachmentHref } from "@/lib/blog/api";
import { authFetch } from "@/lib/apiBase";
import type { BlogAttachment } from "@/lib/blog/types";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/types";

function pickTitle(locale: Locale, attachment: BlogAttachment): string {
  if (locale === "en" && attachment.title_en?.trim()) return attachment.title_en;
  if (attachment.title_zh?.trim()) return attachment.title_zh;
  return attachment.original_filename;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type AuthenticatedPdfFrameProps = {
  viewHref: string;
  title: string;
};

function AuthenticatedPdfFrame({ viewHref, title }: AuthenticatedPdfFrameProps) {
  const { t } = useI18n();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    void authFetch(viewHref)
      .then(async (res) => {
        if (!res.ok) throw new Error("pdf_load_failed");
        const blob = await res.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setError(t("blog.pdfLoadFailed"));
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [viewHref, t]);

  if (error) {
    return <p className="px-4 py-6 text-sm text-destructive">{error}</p>;
  }
  if (!blobUrl) {
    return <p className="px-4 py-6 text-sm text-muted-foreground">{t("blog.loading")}</p>;
  }
  return <iframe title={title} src={blobUrl} className="h-[min(70vh,720px)] w-full bg-muted" />;
}

type BlogPdfViewerProps = {
  attachments: BlogAttachment[];
  requireAuth?: boolean;
};

export default function BlogPdfViewer({ attachments, requireAuth = false }: BlogPdfViewerProps) {
  const { locale, t } = useI18n();

  if (attachments.length === 0) return null;

  return (
    <section className="mt-8 space-y-4">
      <h2 className="font-heading text-lg font-semibold">{t("blog.attachments")}</h2>
      {attachments.map((attachment) => {
        const viewHref = blogAttachmentHref(attachment.view_url);
        const downloadHref = `${viewHref}${viewHref.includes("?") ? "&" : "?"}download=true`;
        const title = pickTitle(locale, attachment);
        return (
          <div
            key={attachment.id}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">
                  {attachment.original_filename} · {formatBytes(attachment.file_size)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={viewHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t("blog.openPdf")}
                </a>
                <a
                  href={downloadHref}
                  className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                >
                  <Download className="h-3.5 w-3.5" />
                  {t("blog.downloadPdf")}
                </a>
              </div>
            </div>
            {requireAuth ? (
              <AuthenticatedPdfFrame viewHref={viewHref} title={title} />
            ) : (
              <iframe
                title={title}
                src={viewHref}
                className="h-[min(70vh,720px)] w-full bg-muted"
              />
            )}
          </div>
        );
      })}
    </section>
  );
}
