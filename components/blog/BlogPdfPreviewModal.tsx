"use client";

import { useEffect } from "react";
import { Loader2, X } from "lucide-react";

type BlogPdfPreviewModalProps = {
  open: boolean;
  title: string;
  objectUrl: string | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
};

export default function BlogPdfPreviewModal({
  open,
  title,
  objectUrl,
  loading,
  error,
  onClose,
}: BlogPdfPreviewModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        aria-label="关闭预览"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex h-[min(90vh,900px)] w-full max-w-5xl flex-col overflow-hidden border-2 border-foreground bg-card shadow-neo"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-foreground px-4 py-3">
          <h3 className="truncate font-heading text-base font-bold sm:text-lg">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex shrink-0 items-center justify-center border-2 border-foreground bg-background p-1.5 transition-colors hover:bg-secondary"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 bg-secondary/30">
          {loading ? (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              正在加载 PDF…
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-destructive">
              {error}
            </div>
          ) : objectUrl ? (
            <iframe src={objectUrl} title={title} className="h-full w-full border-0" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
