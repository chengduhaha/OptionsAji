"use client";

import type { ReactNode } from "react";

import V4SiteFooter from "@/components/v4/V4SiteFooter";
import V4SiteHeader from "@/components/v4/V4SiteHeader";
import { useI18n } from "@/lib/i18n/context";

type V4OptionsShellProps = {
  children: ReactNode;
};

function useMarketSessionLabel(): string {
  const { t } = useI18n();
  const now = new Date();
  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day = et.getDay();
  const hour = et.getHours();
  const minute = et.getMinutes();
  const minutes = hour * 60 + minute;

  if (day === 0 || day === 6) return t("mvp.session.closed");
  if (minutes >= 4 * 60 && minutes < 9 * 60 + 30) return t("mvp.session.preMarket");
  if (minutes >= 9 * 60 + 30 && minutes < 16 * 60) return t("mvp.session.marketOpen");
  if (minutes >= 16 * 60 && minutes < 20 * 60) return t("mvp.session.afterHours");
  return t("mvp.session.closed");
}

export default function V4OptionsShell({ children }: V4OptionsShellProps) {
  const { t } = useI18n();
  const sessionLabel = useMarketSessionLabel();
  const isOpen =
    sessionLabel === t("mvp.session.marketOpen") ||
    sessionLabel === t("mvp.session.preMarket") ||
    sessionLabel === t("mvp.session.afterHours");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <V4SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={
              isOpen
                ? "inline-flex items-center gap-1"
                : "inline-flex items-center gap-1 opacity-80"
            }
          >
            <span
              className={
                isOpen
                  ? "h-1.5 w-1.5 rounded-full bg-up"
                  : "h-1.5 w-1.5 rounded-full bg-muted-foreground"
              }
            />
            {sessionLabel}
          </span>
        </div>
        {children}
      </main>
      <V4SiteFooter />
    </div>
  );
}
