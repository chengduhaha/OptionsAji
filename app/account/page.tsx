"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { NeoPanel } from "@/components/v3/NeoPanel";
import LanguageToggle from "@/components/LanguageToggle";
import V3ThemeToggle from "@/components/v3/V3ThemeToggle";
import { useAuth } from "@/lib/auth-context";
import { membershipLabel } from "@/lib/membership";
import { useI18n } from "@/lib/i18n/context";

export default function AccountPage() {
  const { t, locale } = useI18n();
  const { user, ready, isMember, redeemCode, logout } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (ready && !user) {
    return (
      <div className="min-h-screen bg-cream text-ink flex items-center justify-center px-4">
        <NeoPanel title={t("v3.membership.accountTitle")} accent="lavender">
          <p className="text-sm mb-4">{t("v3.membership.loginRequired")}</p>
          <Link href="/login?next=/account" className="neo-button inline-block">
            {t("v3.membership.login")}
          </Link>
        </NeoPanel>
      </div>
    );
  }

  async function onRedeem(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      await redeemCode(code);
      setCode("");
      setMessage(t("v3.membership.redeemSuccess"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Redeem failed");
    } finally {
      setBusy(false);
    }
  }

  const expires = user?.membership?.membership_expires_at
    ? new Date(user.membership.membership_expires_at).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")
    : "—";

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold uppercase">{t("v3.membership.accountTitle")}</h1>
            <p className="text-sm text-ink/70 mt-1">{t("v3.membership.accountSubtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <V3ThemeToggle />
            <LanguageToggle variant="neo" />
            <Link href="/options/unusual" className="font-mono text-xs underline">
              ← Options
            </Link>
          </div>
        </div>

        <NeoPanel title={user?.email ?? "—"} accent="peach">
          <dl className="grid grid-cols-2 gap-4 font-mono text-sm">
            <div>
              <dt className="text-[10px] uppercase text-ink/50">{t("v3.membership.statusLabel")}</dt>
              <dd className="font-bold mt-1">{membershipLabel(user?.membership, locale)}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase text-ink/50">{t("v3.membership.expiresLabel")}</dt>
              <dd className="font-bold mt-1">{isMember ? expires : "—"}</dd>
            </div>
          </dl>
        </NeoPanel>

        <NeoPanel title={t("v3.membership.redeemTitle")} accent="lavender">
          <form onSubmit={onRedeem} className="space-y-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t("v3.membership.redeemPlaceholder")}
              className="neo-input w-full font-mono text-sm uppercase"
              required
            />
            <button type="submit" disabled={busy} className="neo-button">
              {t("v3.membership.redeemSubmit")}
            </button>
          </form>
          {message ? <p className="mt-3 text-sm text-[#0A6B52] font-mono">{message}</p> : null}
          {error ? <p className="mt-3 text-sm text-[#C03030] font-mono">{error}</p> : null}
        </NeoPanel>

        <div className="flex flex-wrap gap-3">
          <Link href="/pricing" className="neo-button">{t("v3.membership.pricing")}</Link>
          {user ? (
            <button
              type="button"
              className="border-[3px] border-ink px-4 py-2 font-mono text-xs font-bold uppercase shadow-neo-sm"
              onClick={async () => {
                await logout();
                router.push("/options/unusual");
              }}
            >
              {t("v3.membership.logout")}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
