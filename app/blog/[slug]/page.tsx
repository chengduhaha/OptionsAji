import type { Metadata } from "next";

import BlogPostPageClient from "@/components/blog/BlogPostPageClient";
import { ArticleJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { fetchPublishedBlogPost } from "@/lib/blog/server";
import { blogPostCanonicalUrl } from "@/lib/blog/share";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function pickMetadataText(
  zh: string | null | undefined,
  en: string | null | undefined,
  fallback: string,
): string {
  if (zh?.trim()) return zh.trim();
  if (en?.trim()) return en.trim();
  return fallback;
}

function pickOgImage(post: { attachments?: { thumbnail_url?: string | null }[] } | null): string {
  const thumb = post?.attachments?.find((a) => a.thumbnail_url)?.thumbnail_url;
  if (thumb && /^https?:\/\//i.test(thumb)) return thumb;
  return DEFAULT_OG_IMAGE;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPublishedBlogPost(slug);
  const url = blogPostCanonicalUrl(slug);

  const title = post
    ? pickMetadataText(post.title_zh, post.title_en, post.slug)
    : slug;
  const description = post
    ? pickMetadataText(post.excerpt_zh, post.excerpt_en, "OptionsAji 阿吉博客")
    : "OptionsAji 阿吉博客 — 美股期权深度分析";

  const pageTitle = `${title} | OptionsAji`;
  const ogImage = pickOgImage(post);

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "article",
      locale: "zh_CN",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      publishedTime: post?.published_at ?? undefined,
      modifiedTime: post?.updated_at ?? undefined,
      tags: post?.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@OptionsAji",
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchPublishedBlogPost(slug);
  const url = blogPostCanonicalUrl(slug);

  return (
    <>
      {post ? (
        <ArticleJsonLd
          headline={pickMetadataText(post.title_zh, post.title_en, post.slug)}
          description={pickMetadataText(
            post.excerpt_zh,
            post.excerpt_en,
            "OptionsAji 阿吉博客 — 美股期权深度分析",
          )}
          url={url}
          datePublished={post.published_at ?? undefined}
          dateModified={post.updated_at ?? undefined}
          tags={post.tags}
          image={pickOgImage(post)}
        />
      ) : (
        <JsonLd
          schema={{
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: slug,
            url,
            isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
          }}
        />
      )}
      <BlogPostPageClient slug={slug} />
    </>
  );
}
