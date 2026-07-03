import type { Metadata } from "next";

import BlogCourseWatchPageClient from "@/components/blog/BlogCourseWatchPageClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

// Member-only video page: do not index in search engines, but keep playback
// logic untouched. `follow` stays true so links inside still resolve.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `期权视频课程 | ${id.slice(0, 8)}…`,
    description: "观看期权视频课程录播，系统学习策略、波动率与 GEX 实战。",
    robots: { index: false, follow: true },
  };
}

export default async function BlogCourseWatchPage({ params }: PageProps) {
  const { id } = await params;
  return <BlogCourseWatchPageClient courseId={id} />;
}
