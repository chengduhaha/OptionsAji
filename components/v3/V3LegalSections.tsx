"use client";

import { Fragment, type ReactNode } from "react";

import { useI18n } from "@/lib/i18n/context";

type V3LegalSectionsProps = {
  pageKey: "about" | "terms" | "privacy" | "refund" | "disclaimer" | "contact";
};

function renderInlineBold(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function renderBody(text: string): ReactNode {
  return text.split("\n").map((line, index, lines) => (
    <Fragment key={index}>
      {renderInlineBold(line)}
      {index < lines.length - 1 ? <br /> : null}
    </Fragment>
  ));
}

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
            futurepulse5788
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

  const intro = t(`v3.legal.${pageKey}.intro`);
  const introKey = `v3.legal.${pageKey}.intro`;

  return (
    <div className="space-y-6">
      {intro !== introKey ? <p>{renderBody(intro)}</p> : null}
      {Array.from({ length: sectionCount }, (_, i) => i + 1).map((n) => (
        <section key={n}>
          <h2 className="font-display text-base font-extrabold uppercase tracking-wide mb-2">
            {t(`v3.legal.${pageKey}.s${n}.heading`)}
          </h2>
          <div className="leading-relaxed">{renderBody(t(`v3.legal.${pageKey}.s${n}.body`))}</div>
        </section>
      ))}
    </div>
  );
}
