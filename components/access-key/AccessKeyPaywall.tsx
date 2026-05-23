"use client";

import { KeyRound } from "lucide-react";

interface AccessKeyPaywallProps {
  onOpenModal: () => void;
}

export function AccessKeyPaywall({ onOpenModal }: AccessKeyPaywallProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gold/25 bg-panel/60 px-6 py-16 text-center">
      <KeyRound className="h-10 w-10 text-gold/80" />
      <h2 className="mt-4 text-lg font-semibold text-foreground">需要 Access Key 才能浏览完整内容</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        请联系阿吉获取 Access Key。Discord：<span className="font-mono text-gold">ajifinance</span>
      </p>
      <button
        type="button"
        onClick={onOpenModal}
        className="mt-6 inline-flex items-center justify-center rounded-lg border border-gold/30 bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold transition hover:bg-gold/15"
      >
        输入 Access Key
      </button>
    </div>
  );
}
