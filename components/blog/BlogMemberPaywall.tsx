"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type BlogMemberPaywallProps = {
  className?: string;
};

export default function BlogMemberPaywall({ className }: BlogMemberPaywallProps) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        "relative mt-0 overflow-hidden rounded-b-lg border-t-2 border-dashed border-primary/30 bg-gradient-to-b from-transparent via-card/80 to-card px-6 pb-8 pt-16 text-center sm:px-10",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 h-24 bg-gradient-to-b from-transparent to-card"
      />
      <div className="relative mx-auto max-w-md">
        <span className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-full border-2 border-[#5865F2]/40 bg-[#5865F2]/10 text-[#5865F2]">
          <Lock className="size-5" aria-hidden />
        </span>
        <h2 className="font-heading text-xl font-bold">{t("blog.article.memberPaywall.title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("blog.article.memberPaywall.body")}</p>
        <Link
          href="/pricing"
          className="mt-5 inline-flex items-center justify-center border-2 border-foreground bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-neo-sm transition-transform hover:-translate-x-px hover:-translate-y-px"
        >
          {t("blog.article.memberPaywall.cta")}
        </Link>
      </div>
    </div>
  );
}
