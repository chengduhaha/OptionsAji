"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import TurnstileWidget from "@/components/auth/TurnstileWidget";
import { useAuth } from "@/lib/auth-context";

function LoginInner() {
  const { ready, user, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";

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
      setError("请先完成人机验证。");
      return;
    }
    setBusy(true);
    try {
      await login(email.trim(), password, turnstileToken);
      router.replace(nextPath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "登录失败");
      setTurnstileToken(null);
      setTurnstileResetKey((value) => value + 1);
    } finally {
      setBusy(false);
    }
  }

  const handleTurnstileError = useCallback(() => {
    setError("人机验证加载失败，请刷新后重试。");
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-[16px] font-bold text-primary-foreground shadow-lg shadow-primary/20">
            OA
          </div>
          <h1 className="heading-1 mt-4 text-foreground">登录 OptionsAji</h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">使用邮箱与密码访问控制台</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.3)]">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">邮箱</label>
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
              <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">密码</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-[14px] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40"
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
            {error ? <p className="text-[12px] text-red">{error}</p> : null}
            <button
              type="submit"
              disabled={busy || !ready || (Boolean(turnstileSiteKey) && !turnstileToken)}
              className="lift w-full rounded-lg bg-primary py-2.5 text-[14px] font-semibold text-primary-foreground disabled:opacity-50"
            >
              {busy ? "登录中…" : "登录"}
            </button>
          </form>
        </div>
        <p className="mt-5 text-center text-[13px] text-muted-foreground">
          没有账号？{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">注册</Link>
          {" · "}
          <Link href="/landing" className="hover:text-foreground">产品介绍</Link>
        </p>
        <p className="mt-3 text-center text-[11px] leading-5 text-muted">
          登录即表示你理解 OptionsAji 仅提供数据分析与教育内容，并同意{" "}
          <Link href="/terms" className="text-primary hover:underline">服务条款</Link>
          {" / "}
          <Link href="/privacy" className="text-primary hover:underline">隐私政策</Link>。
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-muted text-[13px]">
          加载…
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
