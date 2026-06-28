"use client";

import { BarChart3, BookOpen, Database } from "lucide-react";

import { useI18n } from "@/lib/i18n/context";

const WORKFLOW_KEYS = ["scan", "interpret", "archive"] as const;

const PILLARS = [
  { icon: Database, titleKey: "blog.advantages.pillar1.title", bodyKey: "blog.advantages.pillar1.body" },
  { icon: BarChart3, titleKey: "blog.advantages.pillar2.title", bodyKey: "blog.advantages.pillar2.body" },
  { icon: BookOpen, titleKey: "blog.advantages.pillar3.title", bodyKey: "blog.advantages.pillar3.body" },
] as const;

export default function BlogAdvantagesSection() {
  const { t } = useI18n();

  return (
    <section id="advantages" className="scroll-mt-24">
      <div className="mb-8 text-center">
        <h2 className="font-heading text-2xl font-bold sm:text-3xl">{t("blog.advantages.title")}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {t("blog.advantages.subtitle")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {PILLARS.map(({ icon: Icon, titleKey, bodyKey }) => (
          <div
            key={titleKey}
            className="rounded-xl border-2 border-border bg-card p-5 transition-shadow hover:shadow-[3px_3px_0_0_hsl(var(--border))]"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-heading font-bold">{t(titleKey)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(bodyKey)}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h3 className="mb-4 text-center font-heading text-lg font-semibold">{t("blog.advantages.platformsTitle")}</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {WORKFLOW_KEYS.map((key, index) => (
            <div key={key} className="rounded-lg border border-border bg-secondary/30 px-4 py-3">
              <div className="mb-2 font-mono text-xs font-semibold text-primary">0{index + 1}</div>
              <p className="text-sm font-semibold">{t(`blog.advantages.workflow.${key}.title`)}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t(`blog.advantages.workflow.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">{t("blog.advantages.platformsNote")}</p>
      </div>
      <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">{t("blog.advantages.closing")}</p>
    </section>
  );
}
