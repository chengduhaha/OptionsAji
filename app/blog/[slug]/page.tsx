import type { Metadata } from "next";

import BlogPostPageClient from "@/components/blog/BlogPostPageClient";
import { fetchPublishedBlogPost } from "@/lib/blog/server";
import { blogPostCanonicalUrl } from "@/lib/blog/share";

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
      siteName: "OptionsAji",
      type: "article",
      locale: "zh_CN",
      publishedTime: post?.published_at ?? undefined,
      modifiedTime: post?.updated_at ?? undefined,
      tags: post?.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@OptionsAji",
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  return <BlogPostPageClient slug={slug} />;
}
