"use client";

import Link from "next/link";
import { KeyRound, LogIn, UserPlus, X } from "lucide-react";
import type { UnlockReason } from "@/lib/mvp-tier";

interface UnlockPromptModalProps {
  open: boolean;
  reason: UnlockReason;
  title?: string;
  nextPath?: string;
  onClose: () => void;
  onOpenAccessKey?: () => void;
}

export function UnlockPromptModal({
  open,
  reason,
  title = "解锁完整内容",
  nextPath = "/",
  onClose,
  onOpenAccessKey,
}: UnlockPromptModalProps) {
  if (!open) return null;

  const loginHref = `/login?next=${encodeURIComponent(nextPath)}`;
  const registerHref = `/register`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="关闭"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-xl border border-glass-border bg-panel p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-foreground"
          aria-label="关闭弹窗"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold text-foreground pr-8">{title}</h2>
        {reason === "login" ? (
          <>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              注册并登录账号即可查看该区块的完整数据与分析解读。
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link
                href={registerHref}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-background hover:bg-gold/90"
              >
                <UserPlus className="h-4 w-4" />
                注册账号
              </Link>
              <Link
                href={loginHref}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-4 py-2.5 text-sm font-medium text-gold hover:bg-gold/15"
              >
                <LogIn className="h-4 w-4" />
                登录
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              该内容为 Pro 会员专享。请输入 Access Key 解锁完整功能；也可联系阿吉获取 Key。
            </p>
            <p className="mt-2 text-sm text-foreground">
              Discord：<span className="font-mono text-gold">ajifinance</span>
            </p>
            <button
              type="button"
              onClick={() => {
                onOpenAccessKey?.();
                onClose();
              }}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-4 py-2.5 text-sm font-medium text-gold hover:bg-gold/15"
            >
              <KeyRound className="h-4 w-4" />
              输入 Access Key
            </button>
          </>
        )}
      </div>
    </div>
  );
}
