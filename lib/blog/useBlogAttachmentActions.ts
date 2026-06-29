"use client";

import { useCallback, useEffect, useState } from "react";

import { BlogApiError } from "@/lib/blog/api";
import {
  downloadBlogAttachment,
  fetchBlogAttachmentPreviewUrl,
  revokeBlogAttachmentPreviewUrl,
} from "@/lib/blog/attachmentFile";

type AttachmentAction = "view" | "download" | null;

type PreviewState = {
  title: string;
  objectUrl: string | null;
};

export function useBlogAttachmentActions() {
  const [activeAction, setActiveAction] = useState<AttachmentAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const closePreview = useCallback(() => {
    setPreview((current) => {
      if (current?.objectUrl) revokeBlogAttachmentPreviewUrl(current.objectUrl);
      return null;
    });
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (preview?.objectUrl) revokeBlogAttachmentPreviewUrl(preview.objectUrl);
    };
  }, [preview?.objectUrl]);

  const open = useCallback(async (viewUrl: string, title: string) => {
    setActiveAction("view");
    setError(null);
    setPreview({ title, objectUrl: null });
    try {
      const objectUrl = await fetchBlogAttachmentPreviewUrl(viewUrl);
      setPreview({ title, objectUrl });
    } catch (e: unknown) {
      const message =
        e instanceof BlogApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "无法打开附件";
      setError(message);
      setPreview(null);
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
    closePreview,
    previewOpen: preview !== null,
    previewTitle: preview?.title ?? "",
    previewObjectUrl: preview?.objectUrl ?? null,
    activeAction,
    isViewing: activeAction === "view" || (preview !== null && preview.objectUrl === null),
    isDownloading: activeAction === "download",
    error,
    clearError: () => setError(null),
  };
}
