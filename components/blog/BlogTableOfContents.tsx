"use client";

import { useEffect, useState } from "react";

import type { TocHeading } from "@/lib/blog/headings";
import { cn } from "@/lib/utils";

type BlogTableOfContentsProps = {
  headings: TocHeading[];
  title: string;
  navLabel: string;
};

export default function BlogTableOfContents({ headings, title, navLabel }: BlogTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
          return;
        }

        const above = entries
          .filter((e) => e.boundingClientRect.top < 120)
          .sort((a, b) => b.boundingClientRect.top - a.boundingClientRect.top);

        if (above.length > 0) {
          setActiveId(above[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  function handleClick(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  }

  return (
    <nav
      aria-label={navLabel}
      className="border-2 border-foreground bg-card p-4 shadow-neo-sm"
    >
      <p className="mb-3 border-b-2 border-foreground pb-2 font-heading text-xs font-black uppercase tracking-widest text-foreground">
        {title}
      </p>
      <ol className="space-y-0.5">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const indent =
            heading.level === 2 ? "pl-0" : heading.level === 3 ? "pl-3" : "pl-6";

          return (
            <li key={heading.id} className={indent}>
              <button
                type="button"
                onClick={() => handleClick(heading.id)}
                className={cn(
                  "w-full border-l-[3px] py-1.5 pl-2.5 text-left text-[0.8125rem] leading-snug transition-colors",
                  isActive
                    ? "border-primary bg-primary/10 font-bold text-foreground"
                    : "border-transparent font-medium text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {heading.text}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
