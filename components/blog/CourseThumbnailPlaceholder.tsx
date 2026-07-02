"use client";

import { Play } from "lucide-react";

import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type CourseThumbnailPlaceholderProps = {
  className?: string;
  thumbnailUrl?: string | null;
  alt?: string;
};

export default function CourseThumbnailPlaceholder({
  className,
  thumbnailUrl,
  alt = "",
}: CourseThumbnailPlaceholderProps) {
  const { t } = useI18n();

  if (thumbnailUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={thumbnailUrl} alt={alt} className={cn("h-full w-full object-cover", className)} />
    );
  }

  return (
    <div
      className={cn(
        "relative h-full w-full bg-[linear-gradient(145deg,#e8e4e0_0%,#d4cfc8_55%,#c9c2b8_100%)]",
        className,
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, hsl(var(--foreground)) 0, hsl(var(--foreground)) 1px, transparent 1px, transparent 12px)",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-foreground bg-primary shadow-[2px_2px_0_0_hsl(var(--foreground))]">
          <Play className="h-4 w-4 fill-foreground text-foreground" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {t("blog.courses.thumbnailPending")}
        </span>
      </div>
    </div>
  );
}
