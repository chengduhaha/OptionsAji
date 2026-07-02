"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import BlogCoursesTab from "@/components/blog/BlogCoursesTab";
import BlogDocumentsAccessBanner from "@/components/blog/BlogDocumentsAccessBanner";
import BlogDocumentsTab from "@/components/blog/BlogDocumentsTab";
import BlogShell from "@/components/blog/BlogShell";
import type { BlogDocumentAccess } from "@/lib/blog/types";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export type LibraryTab = "documents" | "videos";

function parseTab(value: string | null): LibraryTab {
  return value === "videos" ? "videos" : "documents";
}

export default function BlogLibraryPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const tab = useMemo(() => parseTab(searchParams.get("tab")), [searchParams]);
  const [access, setAccess] = useState<BlogDocumentAccess | null>(null);

  const setTab = useCallback(
    (next: LibraryTab) => {
      const query = next === "documents" ? "" : `?tab=${next}`;
      router.replace(`/blog/documents${query}`, { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    setAccess(null);
  }, [tab]);

  const accessPrefix = tab === "videos" ? "blog.courses.accessBanner" : "blog.documents.accessBanner";

  return (
    <BlogShell title={t("blog.library.title")} subtitle={t("blog.library.subtitle")} variant="wide">
      <div className="mb-8 flex flex-wrap gap-2 border-b-2 border-border pb-4">
        {(
          [
            { key: "documents" as const, label: t("blog.library.tabDocuments") },
            { key: "videos" as const, label: t("blog.library.tabVideos") },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-colors",
              tab === item.key
                ? "border-primary bg-primary text-primary-foreground shadow-[2px_2px_0_0_hsl(var(--primary))]"
                : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {access && access.member_total_count > 0 ? (
        <BlogDocumentsAccessBanner access={access} i18nPrefix={accessPrefix} />
      ) : null}

      {tab === "documents" ? (
        <BlogDocumentsTab onAccessChange={setAccess} />
      ) : (
        <BlogCoursesTab onAccessChange={setAccess} />
      )}
    </BlogShell>
  );
}
