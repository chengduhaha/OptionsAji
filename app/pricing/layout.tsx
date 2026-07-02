import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "会员订阅价格 — OptionsAji 会员方案",
  description:
    "OptionsAji 会员订阅价格与权益对比：解锁全部期权数据榜单、GEX、历史报告资料库、视频课程与中文市场解读。年付享折扣，支持激活码兑换。",
  path: "/pricing",
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
