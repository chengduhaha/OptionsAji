import type { Metadata } from "next";

import AboutAjiPageClient from "@/components/about/AboutAjiPageClient";

export const metadata: Metadata = {
  title: "关于阿吉 | OptionsAji",
  description: "阿吉的美股期权研究背景、内容方向与公开平台入口。",
};

export default function AboutPage() {
  return <AboutAjiPageClient />;
}
