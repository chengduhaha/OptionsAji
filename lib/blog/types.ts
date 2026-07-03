export type BlogAttachment = {
  id: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  title_zh: string | null;
  title_en: string | null;
  category: string;
  description_zh: string | null;
  description_en: string | null;
  is_sample: boolean;
  is_preview?: boolean;
  is_locked?: boolean;
  media_kind?: "document" | "video";
  post_id: string | null;
  download_url: string;
  view_url: string;
  created_at: string | null;
  duration_sec?: number | null;
  thumbnail_url?: string | null;
};

export type BlogDocumentListResponse = {
  items: BlogAttachment[];
  total: number;
  page: number;
  page_size: number;
  categories: string[];
  access: BlogDocumentAccess;
};

export type BlogDocumentCategoryBreakdown = {
  category: string;
  member_count: number;
  guest_visible_count: number;
};

export type BlogDocumentAccess = {
  tier: "guest" | "free" | "member" | "admin";
  is_member: boolean;
  is_full_member?: boolean;
  is_trial_member?: boolean;
  membership_kind?: "trial" | "full" | null;
  membership_expires_at: string | null;
  days_remaining: number | null;
  expiring_soon: boolean;
  visible_count: number;
  member_total_count: number;
  guest_teaser_count: number;
  trial_teaser_count?: number;
  category_breakdown: BlogDocumentCategoryBreakdown[];
};

export type BlogPostSummary = {
  id: string;
  slug: string;
  title_zh: string;
  title_en: string | null;
  excerpt_zh: string | null;
  excerpt_en: string | null;
  content_format: "markdown" | "html";
  category: string;
  tags: string[];
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string | null;
  attachment_count: number;
};

export type BlogPostDetail = BlogPostSummary & {
  body_zh: string;
  body_en: string | null;
  attachments: BlogAttachment[];
};

export type BlogPostListResponse = {
  items: BlogPostSummary[];
  total: number;
  page: number;
  page_size: number;
  categories: string[];
};

export type BlogPostCreateInput = {
  slug: string;
  title_zh: string;
  title_en?: string;
  excerpt_zh?: string;
  excerpt_en?: string;
  body_zh: string;
  body_en?: string;
  content_format?: "markdown" | "html";
  category: string;
  tags: string[];
  status: "draft" | "published";
};

export type BlogPostUpdateInput = Partial<BlogPostCreateInput>;

export type BlogUploadPdfResponse = {
  attachment: BlogAttachment;
  post_id: string | null;
};

export type BlogUploadCourseResponse = {
  attachment: BlogAttachment;
};

export type BlogPlayTokenResponse = {
  token: string;
  stream_url: string;
  expires_at: string;
  preview: boolean;
  preview_seconds: number | null;
};
