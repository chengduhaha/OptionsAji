"use client";

import { Download, Eye, ExternalLink, Loader2 } from "lucide-react";

import { useBlogAttachmentActions } from "@/lib/blog/useBlogAttachmentActions";
import type { BlogAttachment } from "@/lib/blog/types";
import { cn } from "@/lib/utils";

type BlogAttachmentActionButtonsProps = {
  attachment: Pick<BlogAttachment, "view_url" | "download_url" | "original_filename">;
  openLabel: string;
  downloadLabel: string;
  variant?: "card" | "article" | "admin";
};

const variantClasses = {
  card: {
    open: "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-border py-2 text-xs font-semibold transition-colors hover:bg-secondary disabled:opacity-60",
    download:
      "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-primary bg-primary/10 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-60",
    wrap: "mt-3 flex gap-2",
    OpenIcon: Eye,
  },
  article: {
    open: "inline-flex flex-1 items-center justify-center gap-1.5 border-2 border-foreground bg-card px-4 py-2.5 text-[0.8rem] font-bold text-foreground shadow-neo-sm transition-transform hover:-translate-x-px hover:-translate-y-px disabled:opacity-60 sm:flex-none",
    download:
      "inline-flex flex-1 items-center justify-center gap-1.5 border-2 border-foreground bg-foreground px-4 py-2.5 text-[0.8rem] font-bold text-background shadow-neo-sm transition-transform hover:-translate-x-px hover:-translate-y-px disabled:opacity-60 dark:bg-primary dark:text-primary-foreground sm:flex-none",
    wrap: "flex w-full shrink-0 flex-wrap gap-2 sm:ml-auto sm:w-auto",
    OpenIcon: ExternalLink,
  },
  admin: {
    open: "inline-flex items-center gap-1 rounded-lg border-2 border-border px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-60",
    download: "inline-flex items-center gap-1 rounded-lg border-2 border-border px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-60",
    wrap: "flex flex-wrap gap-2",
    OpenIcon: Eye,
  },
} as const;

export default function BlogAttachmentActionButtons({
  attachment,
  openLabel,
  downloadLabel,
  variant = "card",
}: BlogAttachmentActionButtonsProps) {
  const { open, download, isViewing, isDownloading, error } = useBlogAttachmentActions();
  const styles = variantClasses[variant];
  const OpenIcon = styles.OpenIcon;

  return (
    <div>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      <div className={cn(styles.wrap)}>
        <button
          type="button"
          disabled={isViewing || isDownloading}
          onClick={() => void open(attachment.view_url)}
          className={styles.open}
        >
          {isViewing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <OpenIcon className="h-3.5 w-3.5" />}
          {openLabel}
        </button>
        <button
          type="button"
          disabled={isViewing || isDownloading}
          onClick={() => void download(attachment.download_url, attachment.original_filename)}
          className={styles.download}
        >
          {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          {downloadLabel}
        </button>
      </div>
    </div>
  );
}
