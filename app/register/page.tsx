"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import TurnstileWidget from "@/components/auth/TurnstileWidget";
import V4AuthShell from "@/components/v4/V4AuthShell";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { formatMessage } from "@/lib/i18n/dictionary";

export default function RegisterPage() {
  const { ready, user, register, verifyRegistration, resendVerification } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [phase, setPhase] = useState<"register" | "verify">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [code, setCode] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [resendTurnstileToken, setResendTurnstileToken] = useState<string | null>(null);
  const [resendTurnstileResetKey, setResendTurnstileResetKey] = useState(0);
  const [pendingEmail, setPendingEmail] = useState("");
  const [verificationExpiresAt, setVerificationExpiresAt] = useState<string | null>(null);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  useEffect(() => {
    if (ready && user) router.replace("/options/unusual");
  }, [ready, user, router]);

  async function onRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (turnstileSiteKey && !turnstileToken) {
      setError(t("v3.auth.turnstileRequired"));
      return;
    }
    setBusy(true);
    try {
      const resp = await register(email.trim(), password, displayName.trim() || undefined, turnstileToken);
      setPendingEmail(resp.user.email);
      setVerificationExpiresAt(resp.verification_expires_at);
      setDebugCode(resp.verification_code);
      setPhase("verify");
      setInfo(t("v3.auth.verifySent"));
      setResendTurnstileToken(null);
      setResendTurnstileResetKey((value) => value + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("v3.auth.registerFailed"));
      setTurnstileToken(null);
      setTurnstileResetKey((value) => value + 1);
    } finally {
      setBusy(false);
    }
  }

  const handleTurnstileError = useCallback(() => {
    setError(t("v3.auth.turnstileFailed"));
  }, [t]);

  async function onResendCode() {
    if (!pendingEmail.trim()) return;
    setError(null);
    setInfo(null);
    if (turnstileSiteKey && !resendTurnstileToken) {
      setError(t("v3.auth.turnstileRequired"));
      return;
    }
    setBusy(true);
    try {
      const resp = await resendVerification(pendingEmail, resendTurnstileToken);
      setVerificationExpiresAt(resp.verification_expires_at);
      setDebugCode(resp.verification_code);
      setInfo(t("v3.auth.verifyResent"));
      setResendTurnstileToken(null);
      setResendTurnstileResetKey((value) => value + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("v3.auth.resendFailed"));
      setResendTurnstileToken(null);
      setResendTurnstileResetKey((value) => value + 1);
    } finally {
      setBusy(false);
    }
  }

  async function onVerifySubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await verifyRegistration(pendingEmail, code.trim());
      router.replace("/options/unusual");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("v3.auth.verifyFailed"));
    } finally {
      setBusy(false);
    }
  }

  const shellTitle = phase === "register" ? t("v3.auth.titleRegister") : t("v3.auth.titleVerify");
  const shellSubtitle =
    phase === "register"
      ? t("v3.auth.subtitleRegister")
      : formatMessage(t("v3.auth.subtitleVerify"), { email: pendingEmail });

  return (
    <V4AuthShell title={shellTitle} subtitle={shellSubtitle}>
      {phase === "register" ? (
        <form onSubmit={onRegisterSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
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
            <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
              {t("v3.auth.displayName")}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={128}
              className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
              {t("v3.auth.password")}
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          {turnstileSiteKey ? (
            <TurnstileWidget
              siteKey={turnstileSiteKey}
              action="register"
              resetKey={turnstileResetKey}
              onToken={setTurnstileToken}
              onError={handleTurnstileError}
            />
          ) : null}
          {error ? <p className="font-mono text-[12px] text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={busy || !ready || (Boolean(turnstileSiteKey) && !turnstileToken)}
            className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:brightness-95 disabled:opacity-50"
          >
            {busy ? t("v3.auth.busyRegister") : t("v3.auth.submitRegister")}
          </button>
        </form>
      ) : (
        <form onSubmit={onVerifySubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
              {t("v3.auth.code")}
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm tracking-widest focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          {verificationExpiresAt ? (
            <p className="font-mono text-[11px] text-ink/60">
              {formatMessage(t("v3.auth.expiresAt"), {
                time: new Date(verificationExpiresAt).toLocaleString(),
              })}
            </p>
          ) : null}
          {debugCode ? (
            <p className="font-mono text-[11px] text-ink">
              {formatMessage(t("v3.auth.debugCode"), { code: debugCode })}
            </p>
          ) : null}
          {info ? <p className="font-mono text-[12px] text-ink">{info}</p> : null}
          {error ? <p className="font-mono text-[12px] text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={busy || !ready}
            className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:brightness-95 disabled:opacity-50"
          >
            {busy ? t("v3.auth.busyVerify") : t("v3.auth.submitVerify")}
          </button>
          {turnstileSiteKey ? (
            <TurnstileWidget
              siteKey={turnstileSiteKey}
              action="resend"
              resetKey={resendTurnstileResetKey}
              onToken={setResendTurnstileToken}
              onError={handleTurnstileError}
            />
          ) : null}
          <button
            type="button"
            disabled={busy || !ready || (Boolean(turnstileSiteKey) && !resendTurnstileToken)}
            onClick={() => void onResendCode()}
            className="w-full rounded-md border border-border bg-secondary px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary/80 disabled:opacity-50"
          >
            {busy ? t("v3.auth.busyResend") : t("v3.auth.resendCta")}
          </button>
          <button
            type="button"
            onClick={() => setPhase("register")}
            className="w-full rounded-md py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {t("v3.auth.backToRegister")}
          </button>
        </form>
      )}
      <p className="mt-4 text-center font-mono text-[12px] text-ink/70">
        {t("v3.auth.hasAccount")}{" "}
        <Link href="/login" className="font-bold underline hover:text-ink">
          {t("v3.auth.loginLink")}
        </Link>
      </p>
    </V4AuthShell>
  );
}
