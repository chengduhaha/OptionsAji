"use client";

import { useI18n } from "@/lib/i18n/context";

type V3LegalSectionsProps = {
  pageKey: "about" | "terms" | "privacy" | "refund" | "disclaimer" | "contact";
};

export default function V3LegalSections({ pageKey }: V3LegalSectionsProps) {
  const { t } = useI18n();
  const sectionCount = Number(t(`v3.legal.${pageKey}.sectionCount`)) || 0;

  if (pageKey === "contact") {
    return (
      <div className="space-y-4">
        <p>{t("v3.legal.contact.intro")}</p>
        <ul className="space-y-2 font-mono text-[13px]">
          <li>
            <span className="font-bold">{t("v3.legal.contact.emailLabel")}: </span>
            <a href="mailto:support@options-aji.com" className="underline underline-offset-2">
              support@options-aji.com
            </a>
          </li>
          <li>
            <span className="font-bold">{t("v3.legal.contact.wechatLabel")}: </span>
            183456821
          </li>
          <li>
            <span className="font-bold">{t("v3.legal.contact.discordLabel")}: </span>
            ajifinance
          </li>
        </ul>
        <p className="text-ink/60 text-xs">{t("v3.legal.contact.responseTime")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Array.from({ length: sectionCount }, (_, i) => i + 1).map((n) => (
        <section key={n}>
          <h2 className="font-display text-base font-extrabold uppercase tracking-wide mb-2">
            {t(`v3.legal.${pageKey}.s${n}.heading`)}
          </h2>
          <p className="whitespace-pre-line">{t(`v3.legal.${pageKey}.s${n}.body`)}</p>
        </section>
      ))}
    </div>
  );
}
