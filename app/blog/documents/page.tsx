import { Suspense } from "react";

import BlogLibraryPageClient from "@/components/blog/BlogLibraryPageClient";

export const metadata = {
  title: "会员资料库 | 阿吉博客",
  description: "浏览历史报告、课程资料、研究文档与视频课程。",
};

export default function BlogDocumentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">加载中…</div>}>
      <BlogLibraryPageClient />
    </Suspense>
  );
}
