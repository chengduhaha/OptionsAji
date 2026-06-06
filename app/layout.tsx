import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "OptionsAji - AI 期权分析平台",
  description: "AI 辅助的美股期权数据分析与教育平台，整合 GEX、期权链、宏观事件与研究笔记",
  keywords: ["期权", "美股", "GEX", "AI分析", "期权教育", "Gamma Exposure"],
  authors: [{ name: "OptionsAji" }],
  openGraph: {
    title: "OptionsAji - AI 期权分析平台",
    description: "AI 辅助的美股期权数据分析与教育平台",
    type: "website",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0e131b" },
  ],
};

// Applied before paint to avoid a theme flash. Default is light; `.dark` opts in.
const themeInitScript = `(function(){try{if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} bg-background`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-background text-foreground font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
