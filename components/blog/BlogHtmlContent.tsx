"use client";

import { useMemo } from "react";

import { sanitizeBlogHtml } from "@/lib/blog/sanitizeHtml";
import { cn } from "@/lib/utils";

type BlogHtmlContentProps = {
  html: string;
  className?: string;
};

export default function BlogHtmlContent({ html, className }: BlogHtmlContentProps) {
  const sanitized = useMemo(() => sanitizeBlogHtml(html), [html]);

  if (!sanitized) {
    return null;
  }

  return (
    <div
      className={cn("blog-html-article", className)}
      // Admin-only trusted HTML; sanitized with DOMPurify (jsDelivr scripts + safe tags only).
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
