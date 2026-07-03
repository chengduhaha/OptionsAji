import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "隐私政策 Privacy Policy",
  description:
    "OptionsAji 隐私政策（Privacy Policy）：我们收集的数据类型、使用目的、Cookie 与第三方服务（Vercel、Cloudflare、支付处理器）说明。",
  path: "/privacy",
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
