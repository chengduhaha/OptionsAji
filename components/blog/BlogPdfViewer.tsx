"use client";

import { Download, ExternalLink } from "lucide-react";

import { blogAttachmentHref } from "@/lib/blog/api";
import type { BlogAttachment } from "@/lib/blog/types";
import { formatMessage } from "@/lib/i18n/dictionary";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/types";

function pickTitle(locale: Locale, attachment: BlogAttachment): string {
  if (locale === "en" && attachment.title_en?.trim()) return attachment.title_en;
  if (attachment.title_zh?.trim()) return attachment.title_zh;
  return attachment.original_filename;
}

function pickDescription(locale: Locale, attachment: BlogAttachment): string | null {
  if (locale === "en" && attachment.description_en?.trim()) return attachment.description_en;
  if (attachment.description_zh?.trim()) return attachment.description_zh;
  return null;
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
    <div className="mt-10 space-y-4">
      {attachments.length > 1 ? (
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {t("blog.article.pdfAttachment")}
        </p>
      ) : null}
      {attachments.map((attachment) => {
        const viewHref = blogAttachmentHref(attachment.view_url);
        const downloadHref = `${viewHref}${viewHref.includes("?") ? "&" : "?"}download=true`;
        const title = pickTitle(locale, attachment);
        const description = pickDescription(locale, attachment);
        const meta = description
          ? `${formatBytes(attachment.file_size)} · ${description}`
          : `${attachment.original_filename} · ${formatBytes(attachment.file_size)}`;

        return (
          <div
            key={attachment.id}
            className="flex flex-wrap items-center gap-5 border-2 border-foreground bg-background p-5 dark:bg-background/60 sm:flex-nowrap"
          >
            <div
              className="flex h-16 w-[52px] shrink-0 items-center justify-center border-2 border-foreground bg-primary font-heading text-[0.7rem] font-black text-primary-foreground"
              aria-hidden
            >
              PDF
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[0.95rem] font-extrabold leading-snug">{title}</h4>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-muted-foreground">{meta}</p>
            </div>
            <div className="flex w-full shrink-0 flex-wrap gap-2 sm:ml-auto sm:w-auto">
              <a
                href={viewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-1.5 border-2 border-foreground bg-card px-4 py-2.5 text-[0.8rem] font-bold text-foreground shadow-neo-sm transition-transform hover:-translate-x-px hover:-translate-y-px sm:flex-none"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {t("blog.openPdf")}
              </a>
              <a
                href={downloadHref}
                className="inline-flex flex-1 items-center justify-center gap-1.5 border-2 border-foreground bg-foreground px-4 py-2.5 text-[0.8rem] font-bold text-background shadow-neo-sm transition-transform hover:-translate-x-px hover:-translate-y-px dark:bg-primary dark:text-primary-foreground sm:flex-none"
              >
                <Download className="h-3.5 w-3.5" />
                {formatMessage(t("blog.article.downloadAttachment"))}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
