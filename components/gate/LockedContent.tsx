"use client";

import { Lock } from "lucide-react";
import {
  tierMeetsRequired,
  unlockReasonForRequired,
  type MvpTier,
  type UnlockReason,
} from "@/lib/mvp-tier";

interface LockedContentProps {
  required: MvpTier;
  currentTier: MvpTier;
  title?: string;
  unlockLabel?: string;
  unlockReason?: UnlockReason;
  onUnlock: (reason: UnlockReason) => void;
  children: React.ReactNode;
}

export function LockedContent({
  required,
  currentTier,
  title = "登录后查看完整内容",
  unlockLabel,
  onUnlock,
  unlockReason,
  children,
}: LockedContentProps) {
  const unlocked = tierMeetsRequired(currentTier, required);
  if (unlocked) {
    return <>{children}</>;
  }

  const reason = unlockReason ?? unlockReasonForRequired(currentTier, required);
  const label =
    unlockLabel ??
    (reason === "login" ? "注册 / 登录解锁" : "升级 Pro 解锁");

  return (
    <div className="relative rounded-lg">
      <div className="pointer-events-none select-none blur-[6px] opacity-50" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg border border-gold/20 bg-background/75 px-4 py-8 text-center backdrop-blur-[2px]">
        <Lock className="h-8 w-8 text-gold/80" />
        <p className="text-sm font-medium text-foreground">{title}</p>
        <button
          type="button"
          onClick={() => onUnlock(reason)}
          className="inline-flex items-center justify-center rounded-lg border border-gold/35 bg-gold/10 px-4 py-2 text-sm font-medium text-gold transition hover:bg-gold/15"
        >
          {label}
        </button>
      </div>
    </div>
  );
}
