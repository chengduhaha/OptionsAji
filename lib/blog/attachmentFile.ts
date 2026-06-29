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

  const blob = await res.blob();
  if (blob.type === "application/pdf" || download) return blob;
  return new Blob([blob], { type: "application/pdf" });
}

/** Fetch a member-gated PDF and return a blob URL for inline preview. Caller must revoke. */
export async function fetchBlogAttachmentPreviewUrl(viewUrl: string): Promise<string> {
  const blob = await readAttachmentBlob(viewUrl, false);
  return URL.createObjectURL(blob);
}

export function revokeBlogAttachmentPreviewUrl(objectUrl: string): void {
  URL.revokeObjectURL(objectUrl);
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
