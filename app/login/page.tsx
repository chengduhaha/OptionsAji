"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import TurnstileWidget from "@/components/auth/TurnstileWidget";
import V4AuthShell from "@/components/v4/V4AuthShell";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";

function LoginInner() {
  const { ready, user, login } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/options/unusual";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  useEffect(() => {
    if (ready && user) router.replace(nextPath);
  }, [ready, user, router, nextPath]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (turnstileSiteKey && !turnstileToken) {
      setError(t("v3.auth.turnstileRequired"));
      return;
    }
    setBusy(true);
    try {
      await login(email.trim(), password, turnstileToken);
      router.replace(nextPath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("v3.auth.loginFailed"));
      setTurnstileToken(null);
      setTurnstileResetKey((value) => value + 1);
    } finally {
      setBusy(false);
    }
  }

  const handleTurnstileError = useCallback(() => {
    setError(t("v3.auth.turnstileFailed"));
  }, [t]);

  return (
    <V4AuthShell title={t("v3.auth.titleLogin")} subtitle={t("v3.auth.subtitleLogin")}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {t("v3.auth.email")}
          </label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {t("v3.auth.password")}
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        {turnstileSiteKey ? (
          <TurnstileWidget
            siteKey={turnstileSiteKey}
            action="login"
            resetKey={turnstileResetKey}
            onToken={setTurnstileToken}
            onError={handleTurnstileError}
          />
        ) : null}
        {error ? <p className="font-mono text-[12px] text-destructive">{error}</p> : null}
        <button
          type="submit"
          disabled={busy || !ready || (Boolean(turnstileSiteKey) && !turnstileToken)}
          className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:brightness-95 disabled:opacity-50"
        >
          {busy ? t("v3.auth.busyLogin") : t("v3.auth.submitLogin")}
        </button>
      </form>
      <p className="mt-5 text-center font-mono text-[12px] text-ink/70">
        {t("v3.auth.noAccount")}{" "}
        <Link href="/register" className="font-bold underline hover:text-ink">
          {t("v3.auth.registerLink")}
        </Link>
        {" · "}
        <Link href="/landing" className="underline hover:text-ink">
          {t("v3.auth.landingLink")}
        </Link>
      </p>
    </V4AuthShell>
  );
}

export default function LoginPage() {
  const { t } = useI18n();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background font-mono text-[13px] text-muted-foreground">
          {t("v3.auth.loading")}
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
