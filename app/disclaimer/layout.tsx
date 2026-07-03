import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "免责声明 Disclaimer",
  description:
    "OptionsAji 免责声明：本平台仅提供数据分析和教育内容，不构成投资建议，不执行交易、不持有客户资金。期权交易涉及高风险。",
  path: "/disclaimer",
});

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
