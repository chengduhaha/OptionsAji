"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

type BlogMarkdownProps = {
  content: string;
  className?: string;
};

export default function BlogMarkdown({ content, className }: BlogMarkdownProps) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert prose-headings:font-heading prose-headings:tracking-tight prose-a:text-primary",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
