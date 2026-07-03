import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "联系我们 Contact",
  description:
    "联系 OptionsAji 团队：微信、Discord 与电子邮件渠道，会员开通、激活码与商务合作咨询。",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
