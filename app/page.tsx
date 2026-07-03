import type { Metadata } from "next";

import HomeLandingPage from "@/components/home/HomeLandingPage";

export const metadata: Metadata = {
  title: { absolute: "OptionsAji — 美股期权数据分析与教育平台" },
  description: "会员可解锁期权数据榜单、GEX、历史报告资料库、课程资料与不定期市场解读。",
};

export default function HomePage() {
  return <HomeLandingPage />;
}
