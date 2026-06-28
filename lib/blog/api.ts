import { apiFetch } from "@/lib/apiBase";
import type {
  BlogPostCreateInput,
  BlogPostDetail,
  BlogPostListResponse,
  BlogPostUpdateInput,
  BlogUploadPdfResponse,
} from "@/lib/blog/types";

function parseError(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "请求失败";
  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (
    detail &&
    typeof detail === "object" &&
    "message" in detail &&
    typeof (detail as { message: unknown }).message === "string"
  ) {
    return (detail as { message: string }).message;
  }
  return "请求失败";
}

async function readJson<T>(res: Response): Promise<T> {
  const raw: unknown = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseError(raw));
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
  const res = await apiFetch(`/api/blog/posts${suffix}`, { headers, cache: "no-store" });
  return readJson<BlogPostListResponse>(res);
}

export async function fetchBlogPost(slug: string, token?: string): Promise<BlogPostDetail> {
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await apiFetch(`/api/blog/posts/${encodeURIComponent(slug)}`, {
    headers,
    cache: "no-store",
  });
  return readJson<BlogPostDetail>(res);
}

export async function createBlogPost(
  input: BlogPostCreateInput,
  token: string,
): Promise<BlogPostDetail> {
  const res = await apiFetch("/api/blog/posts", {
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
  const res = await apiFetch(`/api/blog/posts/${encodeURIComponent(postId)}`, {
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
  const res = await apiFetch(`/api/blog/posts/${encodeURIComponent(postId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const raw: unknown = await res.json().catch(() => ({}));
    throw new Error(parseError(raw));
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

  const res = await apiFetch("/api/blog/upload-pdf", {
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
