"use client";

import Link from "next/link";
import { CreditCard, KeyRound } from "lucide-react";

interface AccessKeyPaywallProps {
  onOpenModal?: () => void;
}

export function AccessKeyPaywall(_props: AccessKeyPaywallProps) {
  void _props;
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gold/25 bg-panel/60 px-6 py-16 text-center">
      <KeyRound className="h-10 w-10 text-gold/80" />
      <h2 className="mt-4 text-lg font-semibold text-foreground">升级 Pro 浏览完整内容</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        请通过 Creem 升级 Pro。OptionsAji 不保存银行卡信息，不执行交易，也不接触资金。
      </p>
      <Link
        href="/profile"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-background transition hover:bg-gold/90"
      >
        <CreditCard className="h-4 w-4" />
        升级 Pro（Creem）
      </Link>
    </div>
  );
}
