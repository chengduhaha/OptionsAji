import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { JetBrains_Mono, Space_Grotesk, Syne } from "next/font/google";
import Providers from "./providers";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_OG_LOCALE,
  SITE_TWITTER,
  SITE_URL,
  isVercelPreview,
} from "@/lib/seo/site";
import { OrganizationWebSiteJsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const previewNoindex = isVercelPreview();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "OptionsAji — 美股期权数据分析与教育平台",
    template: "%s | OptionsAji",
  },
  description:
    "OptionsAji 是面向华语美股期权交易者的数据与教育平台：异动合约、成交量、持仓、GEX、波动率与情绪榜单，配合中文市场解读与课程。",
  applicationName: SITE_NAME,
  keywords: [
    "期权",
    "美股期权",
    "OptionsAji",
    "GEX",
    "Gamma Exposure",
    "异动期权",
    "IV Rank",
    "期权数据",
    "期权教育",
    "SPY",
    "QQQ",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "OptionsAji — 美股期权数据分析与教育平台",
    description:
      "异动合约 · 成交量 · 持仓 · GEX · 波动率 · 情绪榜单 — 中文原生期权数据平台",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: SITE_OG_LOCALE,
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "OptionsAji · 美股期权数据与教育",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OptionsAji — 美股期权数据分析与教育平台",
    description:
      "异动合约 · 成交量 · 持仓 · GEX · 波动率 · 情绪榜单 — 中文原生期权数据平台",
    site: SITE_TWITTER,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: !previewNoindex,
    follow: !previewNoindex,
    googleBot: {
      index: !previewNoindex,
      follow: !previewNoindex,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
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
      className={`${GeistSans.variable} ${spaceGrotesk.variable} ${syne.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="dns-prefetch" href="https://api.options-aji.com" />
        <link rel="dns-prefetch" href="https://media.options-aji.com" />
        <link rel="preconnect" href="https://api.options-aji.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://media.options-aji.com" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-background text-foreground font-sans antialiased">
        <Providers>
          <OrganizationWebSiteJsonLd />
          {children}
        </Providers>
      </body>
    </html>
  );
}
