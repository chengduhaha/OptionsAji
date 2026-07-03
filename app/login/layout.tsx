import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "登录",
  description: "OptionsAji 会员登录入口。",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
