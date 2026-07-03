import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "注册",
  description: "注册 OptionsAji 账号，开始使用期权数据与教育内容。",
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
