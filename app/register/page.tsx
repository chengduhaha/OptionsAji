"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const { ready, user, register, verifyRegistration, resendVerification } = useAuth();
  const router = useRouter();

  const [phase, setPhase] = useState<"register" | "verify">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [code, setCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [verificationExpiresAt, setVerificationExpiresAt] = useState<string | null>(null);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/");
  }, [ready, user, router]);

  async function onRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const resp = await register(email.trim(), password, displayName.trim() || undefined);
      setPendingEmail(resp.user.email);
      setVerificationExpiresAt(resp.verification_expires_at);
      setDebugCode(resp.verification_code);
      setPhase("verify");
      setInfo("验证码已发送到您的邮箱，请查收（含垃圾箱）。");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setBusy(false);
    }
  }

  async function onResendCode() {
    if (!pendingEmail.trim()) return;
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const resp = await resendVerification(pendingEmail);
      setVerificationExpiresAt(resp.verification_expires_at);
      setDebugCode(resp.verification_code);
      setInfo("新的验证码已发送，请查收邮箱。");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "发送失败");
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
      router.replace("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "验证失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.3)]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-[16px] font-bold text-primary-foreground shadow-lg shadow-primary/20">
            OA
          </div>
          <h1 className="heading-1 mt-4 text-foreground">
            {phase === "register" ? "注册 OptionsAji" : "邮箱验证"}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            {phase === "register"
              ? "密码至少 8 位，且需同时包含字母与数字。"
              : `请输入发送到 ${pendingEmail} 的验证码。`}
          </p>
        </div>
        {phase === "register" ? (
          <form onSubmit={onRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] text-muted uppercase tracking-wide mb-1">邮箱</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-[14px] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted uppercase tracking-wide mb-1">显示名（可选）</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={128}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-[14px] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted uppercase tracking-wide mb-1">密码</label>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-[14px] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
            </div>
            {error ? <p className="text-[12px] text-red">{error}</p> : null}
            <button
              type="submit"
              disabled={busy || !ready}
              className="lift w-full rounded-lg bg-primary py-2.5 text-[14px] font-semibold text-primary-foreground disabled:opacity-50"
            >
              {busy ? "提交中…" : "注册"}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerifySubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] text-muted uppercase tracking-wide mb-1">验证码</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-[14px] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
            </div>
            {verificationExpiresAt ? (
              <p className="text-[11px] text-muted">有效期至：{new Date(verificationExpiresAt).toLocaleString()}</p>
            ) : null}
            {debugCode ? (
              <p className="text-[11px] text-primary">开发环境验证码：{debugCode}</p>
            ) : null}
            {info ? <p className="text-[12px] text-primary">{info}</p> : null}
            {error ? <p className="text-[12px] text-red">{error}</p> : null}
            <button
              type="submit"
              disabled={busy || !ready}
              className="lift w-full rounded-lg bg-primary py-2.5 text-[14px] font-semibold text-primary-foreground disabled:opacity-50"
            >
              {busy ? "验证中…" : "验证并登录"}
            </button>
            <button
              type="button"
              disabled={busy || !ready}
              onClick={() => void onResendCode()}
              className="w-full rounded-lg border border-border bg-card py-2.5 text-[13px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground disabled:opacity-50"
            >
              {busy ? "发送中…" : "没收到验证码？重新发送"}
            </button>
            <button
              type="button"
              onClick={() => setPhase("register")}
              className="w-full rounded-lg border border-border bg-card py-2.5 text-[13px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              返回修改注册信息
            </button>
          </form>
        )}
        <p className="mt-4 text-[12px] text-muted text-center">
          已有账号？{" "}
          <Link href="/login" className="text-primary hover:underline">
            登录
          </Link>
        </p>
        <p className="mt-3 text-center text-[11px] text-muted">
          注册即表示你理解 OptionsAji 仅提供数据分析与教育内容，并同意{" "}
          <Link href="/terms" className="text-primary hover:underline">
            服务条款
          </Link>
          {" / "}
          <Link href="/privacy" className="text-primary hover:underline">
            隐私政策
          </Link>
          。
        </p>
      </div>
    </div>
  );
}
