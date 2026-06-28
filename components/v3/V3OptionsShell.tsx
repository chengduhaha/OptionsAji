"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

import LanguageToggle from "@/components/LanguageToggle";
import V3SiteFooter from "@/components/v3/V3SiteFooter";
import V3ThemeToggle from "@/components/v3/V3ThemeToggle";
import { NAV_BOARDS } from "@/lib/leaderboard/boardConfig";
import { useAuth } from "@/lib/auth-context";
import { membershipLabel } from "@/lib/membership";
import { useI18n } from "@/lib/i18n/context";

type V3OptionsShellProps = {
  children: React.ReactNode;
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

export default function V3OptionsShell({ children }: V3OptionsShellProps) {
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const { user, ready, isMember, isAdmin, logout } = useAuth();
  const sessionLabel = useMarketSessionLabel();
  const isOpen =
    sessionLabel === t("mvp.session.marketOpen") ||
    sessionLabel === t("mvp.session.preMarket") ||
    sessionLabel === t("mvp.session.afterHours");

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-[1440px] px-4 py-4 md:px-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-[3px] border-ink bg-cream px-4 py-2.5 shadow-neo-sm">
          <div className="flex flex-col gap-2 w-full lg:w-auto">
            <Link href="/options/unusual" className="font-display text-sm font-extrabold uppercase tracking-wider w-fit">
              OptionsAji <span className="opacity-55">v3.0</span>
            </Link>
            <nav
              className="flex flex-wrap items-center gap-1"
              aria-label={t("v3.nav.options")}
            >
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50 mr-1 w-full sm:w-auto">
                {t("v3.nav.options")}
              </span>
              {NAV_BOARDS.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "border-2 border-ink px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide transition-colors",
                      active
                        ? "bg-lavender shadow-neo-sm"
                        : "bg-cream hover:bg-peach/40",
                    )}
                  >
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {ready && user ? (
              <>
                <Link
                  href="/account"
                  className="border-2 border-ink px-2.5 py-1 font-mono text-[10px] font-bold uppercase bg-cream shadow-neo-sm hover:bg-lavender/40"
                >
                  {membershipLabel(user.membership, locale)}
                </Link>
                {isAdmin ? (
                  <Link
                    href="/admin/codes"
                    className="border-2 border-ink px-2.5 py-1 font-mono text-[10px] font-bold uppercase bg-peach shadow-neo-sm"
                  >
                    Admin
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="border-2 border-ink px-2.5 py-1 font-mono text-[10px] font-bold uppercase bg-cream hover:bg-peach/40"
                >
                  {t("v3.membership.logout")}
                </button>
              </>
            ) : ready ? (
              <>
                <Link href="/login" className="border-2 border-ink px-2.5 py-1 font-mono text-[10px] font-bold uppercase bg-cream shadow-neo-sm">
                  {t("v3.membership.login")}
                </Link>
                <Link href="/register" className="border-2 border-ink px-2.5 py-1 font-mono text-[10px] font-bold uppercase bg-lavender shadow-neo-sm">
                  {t("v3.membership.register")}
                </Link>
              </>
            ) : null}
            {!isMember && ready ? (
              <Link href="/pricing" className="border-2 border-ink px-2.5 py-1 font-mono text-[10px] font-bold uppercase bg-peach shadow-neo-sm">
                {t("v3.membership.pricing")}
              </Link>
            ) : null}
            <div className="flex items-center gap-1.5">
              <V3ThemeToggle />
              <LanguageToggle variant="neo" />
            </div>
            <div
              className={clsx(
                "flex items-center gap-2 border-[3px] border-ink px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider shadow-neo-sm",
                isOpen ? "bg-peach" : "bg-cream",
              )}
            >
              <span
                className={clsx(
                  "h-2 w-2 rounded-full border-2 border-ink",
                  isOpen ? "bg-green animate-pulse" : "bg-ink/30",
                )}
              />
              {sessionLabel}
            </div>
          </div>
        </div>
        {children}
        <V3SiteFooter />
      </div>
    </div>
  );
}
