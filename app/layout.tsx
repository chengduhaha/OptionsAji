import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { JetBrains_Mono, Syne } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "OptionsAji — Gamma Exposure",
  description: "美股期权 Gamma Exposure 分析 — Strike 分布、Net GEX 趋势、Gamma Flip 估算",
  keywords: ["期权", "GEX", "Gamma Exposure", "SPY", "OptionsAji"],
  authors: [{ name: "OptionsAji" }],
  openGraph: {
    title: "OptionsAji — Gamma Exposure",
    description: "Strike Gamma 分布 · Net GEX 趋势 · Gamma Flip 估算",
    type: "website",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1c" },
    { color: "#F5F2F0" },
  ],
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="dark")document.documentElement.classList.add("dark");else if(t==="light")document.documentElement.classList.remove("dark");}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${syne.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-cream text-ink font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
