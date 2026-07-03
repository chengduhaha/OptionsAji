import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "退款政策 Refund Policy",
  description:
    "OptionsAji 退款政策：会员订阅退款条件、激活码兑换规则、数字内容不予退款情形及联系渠道说明。",
  path: "/refund",
});

export default function RefundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
