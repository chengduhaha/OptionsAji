"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, LineChart } from "lucide-react";

import BlogMarkdown from "@/components/blog/BlogMarkdown";
import V4SiteFooter from "@/components/v4/V4SiteFooter";
import V4SiteHeader from "@/components/v4/V4SiteHeader";
import { useI18n } from "@/lib/i18n/context";

const SOCIAL_KEYS = ["douyin", "xiaohongshu", "wechat", "video", "youtube", "x"] as const;

const SOCIAL_LINKS: Record<string, string> = {
  x: "https://x.com/AJiOptions",
  youtube: "https://www.youtube.com/@Happybeanplus",
};

export default function AboutAjiPageClient() {
  const { locale, t } = useI18n();
  const body = locale === "en" ? t("blog.about.bodyEn") : t("blog.about.bodyZh");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <V4SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <div className="mb-10 border-b-2 border-border pb-8">
          <p className="mb-3 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            {t("blog.about.subtitle")}
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">{t("blog.about.title")}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{t("blog.about.teaser")}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-8">
            <div className="rounded-2xl border-2 border-border bg-card px-6 py-8 shadow-[4px_4px_0_0_hsl(var(--border))] md:px-10">
              <BlogMarkdown content={body} />
            </div>

            <section className="rounded-2xl border-2 border-border bg-card px-6 py-8 shadow-[4px_4px_0_0_hsl(var(--border))]">
              <h2 className="font-heading text-2xl font-bold">{t("blog.about.socialTitle")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("blog.about.socialBody")}</p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {SOCIAL_KEYS.map((key) => {
                  const href = SOCIAL_LINKS[key];
                  const label = t(`blog.about.social.${key}`);
                  return (
                    <li
                      key={key}
                      className="rounded-xl border-2 border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:border-primary/40"
                    >
                      {href ? (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary">
                          {label}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        label
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="flex aspect-square items-center justify-center rounded-2xl border-2 border-primary/30 bg-primary/5 shadow-[4px_4px_0_0_hsl(var(--primary)/0.2)] p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/aji-avatar.png"
                alt="阿吉 · OptionsAji 主理人"
                className="h-full w-full rounded-2xl border-2 border-primary object-cover shadow-[2px_2px_0_0_hsl(var(--primary))]"
              />
            </div>
            <div className="rounded-xl border-2 border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("blog.about.platformTitle")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("blog.about.platformBody")}</p>
              <Link
                href="/options/unusual"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                {t("blog.about.platformCta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
              <LineChart className="h-5 w-5 text-primary" />
              <p className="mt-3 font-heading text-sm font-bold">{t("blog.about.membershipTitle")}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("blog.about.membershipBody")}</p>
              <Link
                href="/pricing"
                className="mt-4 inline-flex rounded-md border-2 border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                {t("blog.about.membershipCta")}
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <div className="mx-auto max-w-4xl px-4 pb-10">
        <V4SiteFooter />
      </div>
    </div>
  );
}
