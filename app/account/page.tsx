"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import V4Panel from "@/components/v4/V4Panel";
import V4StandaloneShell from "@/components/v4/V4StandaloneShell";
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
      <V4StandaloneShell title={t("v3.membership.accountTitle")} subtitle={t("v3.membership.loginRequired")}>
        <V4Panel>
          <Link
            href="/login?next=/account"
            className="inline-flex rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:brightness-95"
          >
            {t("v3.membership.login")}
          </Link>
        </V4Panel>
      </V4StandaloneShell>
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
    ? new Date(user.membership.membership_expires_at).toLocaleString(
        locale === "zh" ? "zh-CN" : "en-US",
      )
    : "—";

  return (
    <V4StandaloneShell
      title={t("v3.membership.accountTitle")}
      subtitle={t("v3.membership.accountSubtitle")}
    >
      <div className="space-y-6">
        <V4Panel title={user?.email ?? "—"}>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t("v3.membership.statusLabel")}
              </dt>
              <dd className="mt-1 font-mono font-semibold">{membershipLabel(user?.membership, locale)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t("v3.membership.expiresLabel")}
              </dt>
              <dd className="mt-1 font-mono font-semibold">{isMember ? expires : "—"}</dd>
            </div>
          </dl>
        </V4Panel>

        <V4Panel title={t("v3.membership.redeemTitle")}>
          <form onSubmit={onRedeem} className="space-y-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t("v3.membership.redeemPlaceholder")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:brightness-95 disabled:opacity-50"
            >
              {t("v3.membership.redeemSubmit")}
            </button>
          </form>
          {message ? <p className="mt-3 text-sm text-up">{message}</p> : null}
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        </V4Panel>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/pricing"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:brightness-95"
          >
            {t("v3.membership.pricing")}
          </Link>
          {user ? (
            <button
              type="button"
              className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
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
    </V4StandaloneShell>
  );
}
