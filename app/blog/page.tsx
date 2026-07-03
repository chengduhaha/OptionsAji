import type { Metadata } from "next";

import BlogHubPageClient from "@/components/blog/BlogHubPageClient";
import { getServerLocale } from "@/lib/i18n/server-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  if (locale === "en") {
    return {
      title: "Aji Blog",
      description: "US options articles, market notes, sample library, and education.",
    };
  }
  return {
    title: "阿吉博客",
    description: "美股期权文章、市场观察、资料库示例与期权教育内容。",
  };
}

export default function BlogPage() {
  return <BlogHubPageClient />;
}
