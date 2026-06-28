"use client";

import { Mail, MessageCircle } from "lucide-react";

import { useI18n } from "@/lib/i18n/context";

export default function BlogContactSection() {
  const { t } = useI18n();

  return (
    <section id="contact" className="scroll-mt-24">
      <div className="mb-8 text-center">
        <h2 className="font-heading text-2xl font-bold sm:text-3xl">{t("blog.contact.title")}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{t("blog.contact.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <a
          href="mailto:support@options-aji.com"
          className="group rounded-xl border-2 border-border bg-card p-5 transition-all hover:border-primary hover:shadow-[3px_3px_0_0_hsl(var(--primary)/0.2)]"
        >
          <Mail className="h-6 w-6 text-primary" />
          <h3 className="mt-3 font-heading font-semibold">{t("blog.contact.email.title")}</h3>
          <p className="mt-1 text-sm text-primary group-hover:underline">support@options-aji.com</p>
        </a>

        <div className="rounded-xl border-2 border-border bg-card p-5">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h3 className="mt-3 font-heading font-semibold">{t("blog.contact.wechat.title")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("blog.contact.wechat.body")}</p>
        </div>

        <div className="rounded-xl border-2 border-border bg-card p-5">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h3 className="mt-3 font-heading font-semibold">{t("blog.contact.discord.title")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("blog.contact.discord.body")}</p>
        </div>
      </div>
    </section>
  );
}
