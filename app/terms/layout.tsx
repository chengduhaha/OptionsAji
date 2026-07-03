import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "服务条款 Terms of Service",
  description:
    "OptionsAji 服务条款（Terms of Service）：平台使用规则、会员订阅与退款政策、内容版权与免责声明。",
  path: "/terms",
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
