import { authFetch } from "@/lib/apiBase";

import { BlogApiError, blogAttachmentHref } from "./api";

function attachmentFileUrl(path: string, download: boolean): string {
  const href = blogAttachmentHref(path);
  if (!download) return href;
  return `${href}${href.includes("?") ? "&" : "?"}download=true`;
}

async function readAttachmentBlob(path: string, download: boolean): Promise<Blob> {
  const res = await authFetch(attachmentFileUrl(path, download), { cache: "no-store" });
  if (!res.ok) {
    const raw: unknown = await res.json().catch(() => ({}));
    if (raw && typeof raw === "object") {
      const wrapped = raw as { error?: { message?: string; code?: string } };
      const message =
        typeof wrapped.error?.message === "string" && wrapped.error.message.trim()
          ? wrapped.error.message
          : "无法打开附件";
      const code =
        typeof wrapped.error?.code === "string" && wrapped.error.code.trim()
          ? wrapped.error.code
          : "request_failed";
      throw new BlogApiError(message, code, res.status);
    }
    throw new BlogApiError("无法打开附件", "request_failed", res.status);
  }
  return res.blob();
}

/** Open a member-gated PDF in a new tab using JWT from localStorage. */
export async function openBlogAttachment(viewUrl: string): Promise<void> {
  const popup = window.open("about:blank", "_blank", "noopener,noreferrer");
  if (!popup) {
    throw new BlogApiError("请允许弹出窗口以预览 PDF", "popup_blocked", 0);
  }

  try {
    const blob = await readAttachmentBlob(viewUrl, false);
    const objectUrl = URL.createObjectURL(blob);
    popup.location.href = objectUrl;
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch (error) {
    popup.close();
    throw error;
  }
}

/** Download a member-gated PDF using JWT from localStorage. */
export async function downloadBlogAttachment(downloadUrl: string, filename: string): Promise<void> {
  const blob = await readAttachmentBlob(downloadUrl, true);
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = "noopener noreferrer";
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
