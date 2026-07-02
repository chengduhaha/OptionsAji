import BlogCourseWatchPageClient from "@/components/blog/BlogCourseWatchPageClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `期权视频课程 | ${id.slice(0, 8)}… | 阿吉博客`,
    description: "观看期权视频课程录播，系统学习策略、波动率与 GEX 实战。",
  };
}

export default async function BlogCourseWatchPage({ params }: PageProps) {
  const { id } = await params;
  return <BlogCourseWatchPageClient courseId={id} />;
}
