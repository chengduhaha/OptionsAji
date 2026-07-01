export const BLOG_CANONICAL_ORIGIN = "https://www.options-aji.com";

export type SocialSharePlatform = "twitter" | "linkedin" | "telegram";

export function blogPostCanonicalUrl(slug: string): string {
  const normalized = slug.trim().replace(/^\/+|\/+$/g, "");
  return `${BLOG_CANONICAL_ORIGIN}/blog/${encodeURIComponent(normalized)}`;
}

export function buildSocialShareUrl(
  platform: SocialSharePlatform,
  url: string,
  title: string,
): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  switch (platform) {
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "telegram":
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
    default: {
      const _exhaustive: never = platform;
      return _exhaustive;
    }
  }
}

export function buildWeChatQrImageUrl(url: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(url)}`;
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}
