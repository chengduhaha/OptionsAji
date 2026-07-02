import { apiFetch, authFetch } from "@/lib/apiBase";
import type {
  BlogAttachment,
  BlogPostCreateInput,
  BlogPostDetail,
  BlogPostListResponse,
  BlogPostUpdateInput,
  BlogDocumentListResponse,
  BlogPlayTokenResponse,
  BlogUploadCourseResponse,
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
  const fetcher = token ? authFetch : apiFetch;
  const res = await fetcher(`/api/blog/posts/${encodeURIComponent(slug)}`, {
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
  options?: {
    postId?: string;
    titleZh?: string;
    titleEn?: string;
    category?: string;
    descriptionZh?: string;
    descriptionEn?: string;
    isSample?: boolean;
  },
): Promise<BlogUploadPdfResponse> {
  const form = new FormData();
  form.append("file", file);
  if (options?.postId) form.append("post_id", options.postId);
  if (options?.titleZh) form.append("title_zh", options.titleZh);
  if (options?.titleEn) form.append("title_en", options.titleEn);
  if (options?.category) form.append("category", options.category);
  if (options?.descriptionZh) form.append("description_zh", options.descriptionZh);
  if (options?.descriptionEn) form.append("description_en", options.descriptionEn);
  if (options?.isSample !== undefined) form.append("is_sample", options.isSample ? "true" : "false");

  const res = await authFetch("/api/blog/upload-pdf", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return readJson<BlogUploadPdfResponse>(res);
}

export async function fetchBlogDocuments(params?: {
  category?: string;
  page?: number;
  page_size?: number;
}): Promise<BlogDocumentListResponse> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.page_size) qs.set("page_size", String(params.page_size));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const res = await authFetch(`/api/blog/documents${suffix}`, { cache: "no-store" });
  return readJson<BlogDocumentListResponse>(res);
}

export async function fetchBlogCourses(params?: {
  category?: string;
  page?: number;
  page_size?: number;
  sort?: "newest" | "oldest";
}): Promise<BlogDocumentListResponse> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.page_size) qs.set("page_size", String(params.page_size));
  if (params?.sort) qs.set("sort", params.sort);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const res = await authFetch(`/api/blog/courses${suffix}`, { cache: "no-store" });
  return readJson<BlogDocumentListResponse>(res);
}

export async function fetchBlogCourse(attachmentId: string): Promise<BlogAttachment> {
  const res = await authFetch(`/api/blog/courses/${encodeURIComponent(attachmentId)}`, {
    cache: "no-store",
  });
  return readJson<BlogAttachment>(res);
}

export async function fetchBlogPlayToken(attachmentId: string): Promise<BlogPlayTokenResponse> {
  const res = await authFetch(`/api/blog/attachments/${encodeURIComponent(attachmentId)}/play-token`, {
    method: "POST",
    cache: "no-store",
  });
  return readJson<BlogPlayTokenResponse>(res);
}

export async function fetchBlogAttachments(
  token: string,
  params?: { standaloneOnly?: boolean },
): Promise<BlogDocumentListResponse> {
  const qs = new URLSearchParams();
  if (params?.standaloneOnly) qs.set("standalone_only", "true");
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const res = await authFetch(`/api/blog/attachments${suffix}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return readJson<BlogDocumentListResponse>(res);
}

export async function updateBlogAttachment(
  attachmentId: string,
  input: {
    title_zh?: string;
    title_en?: string;
    category?: string;
    description_zh?: string;
    description_en?: string;
    is_sample?: boolean;
    post_id?: string | null;
  },
  token: string,
): Promise<BlogAttachment> {
  const res = await authFetch(`/api/blog/attachments/${encodeURIComponent(attachmentId)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  return readJson<BlogAttachment>(res);
}

export async function uploadBlogCourse(
  file: File,
  token: string,
  options: {
    titleZh: string;
    category?: string;
  },
): Promise<BlogUploadCourseResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("title_zh", options.titleZh);
  if (options.category) form.append("category", options.category);

  const res = await authFetch("/api/blog/admin/courses", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return readJson<BlogUploadCourseResponse>(res);
}

export async function uploadBlogAttachmentThumbnail(
  attachmentId: string,
  file: File,
  token: string,
): Promise<BlogAttachment> {
  const form = new FormData();
  form.append("file", file);

  const res = await authFetch(`/api/blog/attachments/${encodeURIComponent(attachmentId)}/thumbnail`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return readJson<BlogAttachment>(res);
}

export async function deleteBlogAttachment(attachmentId: string, token: string): Promise<void> {
  const res = await authFetch(`/api/blog/attachments/${encodeURIComponent(attachmentId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const raw: unknown = await res.json().catch(() => ({}));
    throw parseError(raw, res.status);
  }
}

export function blogAttachmentHref(path: string): string {
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? path : `/${path}`;
}
