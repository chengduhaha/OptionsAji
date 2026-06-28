"use client";

import Link from "next/link";

import BlogAdvantagesSection from "@/components/blog/BlogAdvantagesSection";
import BlogContactSection from "@/components/blog/BlogContactSection";
import BlogMarkdown from "@/components/blog/BlogMarkdown";
import BlogMembershipSection from "@/components/blog/BlogMembershipSection";
import BlogShell from "@/components/blog/BlogShell";
import { useI18n } from "@/lib/i18n/context";

const SOCIAL_KEYS = ["douyin", "xiaohongshu", "wechat", "video", "youtube"] as const;

export default function BlogAboutPageClient() {
  const { locale, t } = useI18n();
  const body = locale === "en" ? t("blog.about.bodyEn") : t("blog.about.bodyZh");

  return (
    <BlogShell title={t("blog.about.title")} subtitle={t("blog.about.subtitle")} variant="wide">
      <div className="space-y-16">
        <div className="rounded-2xl border-2 border-border bg-card px-6 py-8 md:px-10">
          <BlogMarkdown content={body} />
        </div>

        <BlogMembershipSection />

        <section>
          <h2 className="mb-6 font-heading text-2xl font-bold">{t("blog.about.platformTitle")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-border bg-card p-5">
              <p className="text-sm leading-relaxed text-muted-foreground">{t("blog.about.platformBody")}</p>
              <Link
                href="/options/unusual"
                className="mt-4 inline-flex rounded-lg border-2 border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                {t("blog.about.platformCta")}
              </Link>
            </div>
            <div className="rounded-xl border-2 border-border bg-card p-5">
              <p className="text-sm leading-relaxed text-muted-foreground">{t("blog.about.membershipBody")}</p>
              <Link
                href="/pricing"
                className="mt-4 inline-flex rounded-lg border-2 border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                {t("blog.about.membershipCta")}
              </Link>
            </div>
          </div>
        </section>

        <BlogAdvantagesSection />

        <section>
          <h2 className="mb-2 font-heading text-2xl font-bold">{t("blog.about.socialTitle")}</h2>
          <p className="mb-6 text-sm text-muted-foreground">{t("blog.about.socialBody")}</p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SOCIAL_KEYS.map((key) => (
              <li
                key={key}
                className="rounded-xl border-2 border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-primary/30"
              >
                {t(`blog.about.social.${key}`)}
              </li>
            ))}
          </ul>
        </section>

        <BlogContactSection />
      </div>
    </BlogShell>
  );
}
