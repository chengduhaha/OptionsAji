"use client";

import BlogAttachmentActionButtons from "@/components/blog/BlogAttachmentActionButtons";
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

function BlogPdfAttachmentRow({ attachment }: { attachment: BlogAttachment }) {
  const { locale, t } = useI18n();
  const title = pickTitle(locale, attachment);
  const description = pickDescription(locale, attachment);
  const meta = description
    ? `${formatBytes(attachment.file_size)} · ${description}`
    : `${attachment.original_filename} · ${formatBytes(attachment.file_size)}`;

  return (
    <div className="flex flex-wrap items-center gap-5 border-2 border-foreground bg-background p-5 dark:bg-background/60 sm:flex-nowrap">
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
      <BlogAttachmentActionButtons
        attachment={attachment}
        previewTitle={title}
        openLabel={t("blog.openPdf")}
        downloadLabel={formatMessage(t("blog.article.downloadAttachment"))}
        variant="article"
      />
    </div>
  );
}

export default function BlogPdfViewer({ attachments }: BlogPdfViewerProps) {
  const { t } = useI18n();

  if (attachments.length === 0) return null;

  return (
    <div className="mt-10 space-y-4">
      {attachments.length > 1 ? (
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {t("blog.article.pdfAttachment")}
        </p>
      ) : null}
      {attachments.map((attachment) => (
        <BlogPdfAttachmentRow key={attachment.id} attachment={attachment} />
      ))}
    </div>
  );
}
