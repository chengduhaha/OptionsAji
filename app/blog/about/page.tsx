"use client";

import Link from "next/link";

import BlogMarkdown from "@/components/blog/BlogMarkdown";
import BlogShell from "@/components/blog/BlogShell";
import { useI18n } from "@/lib/i18n/context";

export default function BlogAboutPage() {
  const { locale, t } = useI18n();
  const body = locale === "en" ? t("blog.about.bodyEn") : t("blog.about.bodyZh");

  return (
    <BlogShell title={t("blog.about.title")} subtitle={t("blog.about.subtitle")}>
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card px-5 py-6 md:px-8">
          <BlogMarkdown content={body} />
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-heading text-lg font-semibold">{t("blog.about.membershipTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("blog.about.membershipBody")}</p>
            <Link
              href="/pricing"
              className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              {t("blog.about.membershipCta")}
            </Link>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-heading text-lg font-semibold">{t("blog.about.platformTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("blog.about.platformBody")}</p>
            <Link
              href="/options/unusual"
              className="mt-4 inline-flex rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              {t("blog.about.platformCta")}
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-lg font-semibold">{t("blog.about.socialTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("blog.about.socialBody")}</p>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {(["douyin", "xiaohongshu", "wechat", "video", "youtube"] as const).map((key) => (
              <li key={key} className="rounded-md border border-border bg-secondary/40 px-3 py-2">
                {t(`blog.about.social.${key}`)}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </BlogShell>
  );
}
