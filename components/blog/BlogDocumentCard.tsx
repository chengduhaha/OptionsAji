"use client";

import { FileText } from "lucide-react";

import BlogAttachmentActionButtons from "@/components/blog/BlogAttachmentActionButtons";
import type { BlogAttachment } from "@/lib/blog/types";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/types";

function pickLocalized(
  locale: Locale,
  zh: string | null | undefined,
  en: string | null | undefined,
  fallback: string,
): string {
  if (locale === "en" && en?.trim()) return en;
  if (zh?.trim()) return zh;
  if (en?.trim()) return en;
  return fallback;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function categoryLabel(t: (key: string) => string, category: string): string {
  const key = `blog.documents.categories.${category}`;
  const translated = t(key);
  return translated === key ? category : translated;
}

type BlogDocumentCardProps = {
  doc: BlogAttachment;
};

export default function BlogDocumentCard({ doc }: BlogDocumentCardProps) {
  const { locale, t } = useI18n();
  const title = pickLocalized(locale, doc.title_zh, doc.title_en, doc.original_filename);
  const description = pickLocalized(locale, doc.description_zh, doc.description_en, "");

  return (
    <article className="group flex flex-col rounded-xl border-2 border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-[4px_4px_0_0_hsl(var(--primary)/0.15)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-primary/20 bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {categoryLabel(t, doc.category)}
        </span>
      </div>

      <h3 className="font-heading text-base font-bold leading-snug group-hover:text-primary">{title}</h3>
      {description ? (
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : (
        <div className="flex-1" />
      )}

      <div className="mt-4 border-t border-border pt-4">
        <p className="truncate font-mono text-[11px] text-muted-foreground">{doc.original_filename}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{formatFileSize(doc.file_size)}</p>
        <BlogAttachmentActionButtons
          attachment={doc}
          openLabel={t("blog.openPdf")}
          downloadLabel={t("blog.downloadPdf")}
          variant="card"
        />
      </div>
    </article>
  );
}
