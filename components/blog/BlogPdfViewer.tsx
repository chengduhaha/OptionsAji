"use client";

import { Download, ExternalLink } from "lucide-react";

import { blogAttachmentHref } from "@/lib/blog/api";
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

type BlogPdfViewerProps = {
  attachments: BlogAttachment[];
};

export default function BlogPdfViewer({ attachments }: BlogPdfViewerProps) {
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
            <iframe
              title={title}
              src={viewHref}
              className="h-[min(70vh,720px)] w-full bg-muted"
            />
          </div>
        );
      })}
    </section>
  );
}
