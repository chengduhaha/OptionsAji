"use client";

import { useCallback, useState } from "react";

import { BlogApiError } from "@/lib/blog/api";
import { downloadBlogAttachment, openBlogAttachment } from "@/lib/blog/attachmentFile";

type AttachmentAction = "view" | "download" | null;

export function useBlogAttachmentActions() {
  const [activeAction, setActiveAction] = useState<AttachmentAction>(null);
  const [error, setError] = useState<string | null>(null);

  const open = useCallback(async (viewUrl: string) => {
    setActiveAction("view");
    setError(null);
    try {
      await openBlogAttachment(viewUrl);
    } catch (e: unknown) {
      const message =
        e instanceof BlogApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "无法打开附件";
      setError(message);
    } finally {
      setActiveAction(null);
    }
  }, []);

  const download = useCallback(async (downloadUrl: string, filename: string) => {
    setActiveAction("download");
    setError(null);
    try {
      await downloadBlogAttachment(downloadUrl, filename);
    } catch (e: unknown) {
      const message =
        e instanceof BlogApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "无法下载附件";
      setError(message);
    } finally {
      setActiveAction(null);
    }
  }, []);

  return {
    open,
    download,
    activeAction,
    isViewing: activeAction === "view",
    isDownloading: activeAction === "download",
    error,
    clearError: () => setError(null),
  };
}
