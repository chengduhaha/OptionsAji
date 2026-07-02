"use client";

import { useEffect, useMemo, useRef } from "react";

import {
  extractBlogHtmlInlineScripts,
  extractBlogHtmlStyles,
  sanitizeBlogHtml,
} from "@/lib/blog/sanitizeHtml";
import { cn } from "@/lib/utils";

type BlogHtmlContentProps = {
  html: string;
  className?: string;
};

function activateScripts(container: HTMLElement, inlineScripts: string[]): void {
  const external = [...container.querySelectorAll("script[src]")];
  let pending = external.length;

  const runInline = () => {
    inlineScripts.forEach((code) => {
      const script = document.createElement("script");
      script.textContent = code;
      container.appendChild(script);
    });
  };

  if (pending === 0) {
    runInline();
    return;
  }

  external.forEach((old) => {
    const script = document.createElement("script");
    script.src = (old as HTMLScriptElement).src;
    script.async = false;
    const done = () => {
      pending -= 1;
      if (pending === 0) runInline();
    };
    script.onload = done;
    script.onerror = done;
    old.replaceWith(script);
  });
}

export default function BlogHtmlContent({ html, className }: BlogHtmlContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sanitized = useMemo(() => {
    try {
      return sanitizeBlogHtml(html);
    } catch {
      return "";
    }
  }, [html]);
  const styles = useMemo(() => extractBlogHtmlStyles(html), [html]);
  const inlineScripts = useMemo(() => extractBlogHtmlInlineScripts(html), [html]);
  const styleMarkup = styles.join("\n");

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !sanitized) return;
    activateScripts(el, inlineScripts);
  }, [sanitized, inlineScripts]);

  if (!sanitized) {
    return <p className="text-sm text-destructive">文章内容无法安全渲染。</p>;
  }

  return (
    <div className={cn("blog-html-article", className)}>
      {styleMarkup ? <style>{styleMarkup}</style> : null}
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    </div>
  );
}
