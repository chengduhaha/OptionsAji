import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "账户 — OptionsAji",
  description: "管理 OptionsAji 账户、会员订阅与激活码。",
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
