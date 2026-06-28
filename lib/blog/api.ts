import { apiFetch, authFetch } from "@/lib/apiBase";
import type {
  BlogPostCreateInput,
  BlogPostDetail,
  BlogPostListResponse,
  BlogPostUpdateInput,
  BlogUploadPdfResponse,
} from "@/lib/blog/types";

export class BlogApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "BlogApiError";
    this.code = code;
    this.status = status;
  }
}

function parseError(payload: unknown, status: number): BlogApiError {
  if (!payload || typeof payload !== "object") {
    return new BlogApiError("请求失败", "request_failed", status);
  }

  const wrapped = payload as { error?: unknown; detail?: unknown };
  if (wrapped.error && typeof wrapped.error === "object") {
    const error = wrapped.error as { code?: unknown; message?: unknown };
    const message =
      typeof error.message === "string" && error.message.trim() ? error.message : "请求失败";
    const code =
      typeof error.code === "string" && error.code.trim() ? error.code : "request_failed";
    return new BlogApiError(message, code, status);
  }

  const detail = wrapped.detail;
  if (typeof detail === "string") {
    return new BlogApiError(detail, "request_failed", status);
  }
  if (detail && typeof detail === "object") {
    const message =
      "message" in detail && typeof (detail as { message: unknown }).message === "string"
        ? (detail as { message: string }).message
        : "请求失败";
    const code =
      "code" in detail && typeof (detail as { code: unknown }).code === "string"
        ? (detail as { code: string }).code
        : "request_failed";
    return new BlogApiError(message, code, status);
  }
  return new BlogApiError("请求失败", "request_failed", status);
}

async function readJson<T>(res: Response): Promise<T> {
  const raw: unknown = await res.json().catch(() => ({}));
  if (!res.ok) throw parseError(raw, res.status);
  return raw as T;
}

export async function fetchBlogPosts(params?: {
  page?: number;
  page_size?: number;
  category?: string;
  include_drafts?: boolean;
  token?: string;
}): Promise<BlogPostListResponse> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.page_size) qs.set("page_size", String(params.page_size));
  if (params?.category) qs.set("category", params.category);
  if (params?.include_drafts) qs.set("include_drafts", "true");
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const headers: HeadersInit = {};
  if (params?.token) headers.Authorization = `Bearer ${params.token}`;
  const fetcher = params?.token || params?.include_drafts ? authFetch : apiFetch;
  const res = await fetcher(`/api/blog/posts${suffix}`, { headers, cache: "no-store" });
  return readJson<BlogPostListResponse>(res);
}

export async function fetchBlogPost(slug: string, token?: string): Promise<BlogPostDetail> {
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await authFetch(`/api/blog/posts/${encodeURIComponent(slug)}`, {
    headers,
    cache: "no-store",
  });
  return readJson<BlogPostDetail>(res);
}

export async function createBlogPost(
  input: BlogPostCreateInput,
  token: string,
): Promise<BlogPostDetail> {
  const res = await authFetch("/api/blog/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  return readJson<BlogPostDetail>(res);
}

export async function updateBlogPost(
  postId: string,
  input: BlogPostUpdateInput,
  token: string,
): Promise<BlogPostDetail> {
  const res = await authFetch(`/api/blog/posts/${encodeURIComponent(postId)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  return readJson<BlogPostDetail>(res);
}

export async function deleteBlogPost(postId: string, token: string): Promise<void> {
  const res = await authFetch(`/api/blog/posts/${encodeURIComponent(postId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const raw: unknown = await res.json().catch(() => ({}));
    throw parseError(raw, res.status);
  }
}

export async function uploadBlogPdf(
  file: File,
  token: string,
  options?: { postId?: string; titleZh?: string; titleEn?: string },
): Promise<BlogUploadPdfResponse> {
  const form = new FormData();
  form.append("file", file);
  if (options?.postId) form.append("post_id", options.postId);
  if (options?.titleZh) form.append("title_zh", options.titleZh);
  if (options?.titleEn) form.append("title_en", options.titleEn);

  const res = await authFetch("/api/blog/upload-pdf", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return readJson<BlogUploadPdfResponse>(res);
}

export function blogAttachmentHref(path: string): string {
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? path : `/${path}`;
}
