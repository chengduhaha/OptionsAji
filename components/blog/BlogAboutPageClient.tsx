"use client";

import BlogMarkdown from "@/components/blog/BlogMarkdown";
import BlogShell from "@/components/blog/BlogShell";
import { useI18n } from "@/lib/i18n/context";

const SOCIAL_KEYS = ["douyin", "xiaohongshu", "wechat", "video", "youtube"] as const;

export default function BlogAboutPageClient() {
  const { locale, t } = useI18n();
  const body = locale === "en" ? t("blog.about.bodyEn") : t("blog.about.bodyZh");

  return (
    <BlogShell title={t("blog.about.title")} subtitle={t("blog.about.subtitle")} variant="wide">
      <div className="space-y-12">
        <div className="rounded-2xl border-2 border-border bg-card px-6 py-8 md:px-10">
          <BlogMarkdown content={body} />
        </div>

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
      </div>
    </BlogShell>
  );
}
