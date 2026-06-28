import BlogPostPageClient from "@/components/blog/BlogPostPageClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  return <BlogPostPageClient slug={slug} />;
}
