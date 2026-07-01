"use client";

import { useMemo, useRef } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { TocHeading } from "@/lib/blog/headings";
import { cn } from "@/lib/utils";

type BlogMarkdownProps = {
  content: string;
  className?: string;
  headings?: TocHeading[];
};

function createBlogComponents(headings: TocHeading[]): Components {
  let headingIndex = 0;
  let fallbackIndex = 0;

  function nextHeadingId(): string {
    const match = headings[headingIndex];
    headingIndex += 1;
    if (match) return match.id;
    fallbackIndex += 1;
    return `heading-fallback-${fallbackIndex}`;
  }

  return {
    h1: ({ children }) => (
      <h1 className="mb-5 mt-8 font-heading text-[1.65rem] font-extrabold leading-tight tracking-tight first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }) => {
      const id = nextHeadingId();
      return (
        <h2
          id={id}
          className="scroll-mt-24 mb-4 mt-9 flex items-baseline gap-2.5 font-heading text-[1.45rem] font-extrabold leading-snug first:mt-0"
        >
          <span className="inline-block h-[1.1em] w-2 shrink-0 bg-primary" aria-hidden />
          <span>{children}</span>
        </h2>
      );
    },
    h3: ({ children }) => {
      const id = nextHeadingId();
      return (
        <h3
          id={id}
          className="scroll-mt-24 mb-3.5 mt-7 text-[1.1rem] font-bold leading-snug text-foreground"
        >
          {children}
        </h3>
      );
    },
    h4: ({ children }) => {
      const id = nextHeadingId();
      return (
        <h4
          id={id}
          className="scroll-mt-24 mb-3 mt-6 text-[1rem] font-bold leading-snug text-foreground"
        >
          {children}
        </h4>
      );
    },
    p: ({ children }) => (
      <p className="mb-5 text-[1.0625rem] leading-[1.8] text-foreground last:mb-0">{children}</p>
    ),
    strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
    em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
    ul: ({ children }) => (
      <ul className="mb-6 ml-5 list-disc space-y-2 text-[1.0625rem] leading-[1.8] text-foreground marker:text-primary">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-6 ml-5 list-decimal space-y-2 text-[1.0625rem] leading-[1.8] text-foreground marker:font-semibold marker:text-primary">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-1">{children}</li>,
    a: ({ href, children }) => (
      <a
        href={href ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-[3px] transition-colors hover:text-primary dark:text-primary dark:hover:text-primary/90"
      >
        {children}
      </a>
    ),
    hr: () => <hr className="my-8 border-t-2 border-border" />,
    blockquote: ({ children }) => (
      <blockquote className="my-7 border-2 border-foreground bg-background px-6 py-5 text-[1.05rem] italic leading-[1.75] text-muted-foreground dark:bg-background/60">
        {children}
      </blockquote>
    ),
    code: ({ className, children }) => {
      const inline = !className;
      if (inline) {
        return (
          <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[0.9em] text-primary">
            {children}
          </code>
        );
      }
      return <code className={cn("font-mono text-[0.9em]", className)}>{children}</code>;
    },
    pre: ({ children }) => (
      <pre className="mb-6 overflow-x-auto rounded-none border-2 border-foreground bg-background p-4 font-mono text-sm leading-relaxed dark:bg-background/60">
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className="mb-6 w-full overflow-x-auto border-2 border-foreground">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-secondary text-foreground">{children}</thead>,
    th: ({ children }) => (
      <th className="border border-border px-3 py-2 text-left font-bold">{children}</th>
    ),
    td: ({ children }) => (
      <td className="border border-border px-3 py-2 text-muted-foreground">{children}</td>
    ),
  };
}

export default function BlogMarkdown({ content, className, headings = [] }: BlogMarkdownProps) {
  const componentsRef = useRef<Components | null>(null);
  const headingsKeyRef = useRef("");

  const headingsKey = headings.map((h) => `${h.level}:${h.id}`).join("|");

  const components = useMemo(() => {
    if (componentsRef.current && headingsKeyRef.current === headingsKey) {
      return componentsRef.current;
    }
    componentsRef.current = createBlogComponents([...headings]);
    headingsKeyRef.current = headingsKey;
    return componentsRef.current;
  }, [headings, headingsKey]);

  return (
    <div className={cn("prose-blog w-full max-w-none", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
