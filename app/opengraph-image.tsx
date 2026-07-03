import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const alt = "OptionsAji · 美股期权数据与教育";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Neo-Brutalist v4 palette: cream background, ink text, gold accent.
const CREAM = "#F5F2F0";
const INK = "#111114";
const GOLD = "#D4AF37";

/**
 * Default OpenGraph / Twitter share image. Generated once per build and
 * CDN-cached by Vercel. Uses the Aji pop-art avatar as the brand mark.
 */
export default async function OpengraphImage() {
  const avatarPath = path.join(process.cwd(), "public", "aji-avatar.png");
  const avatarBytes = await readFile(avatarPath);
  const avatarSrc = `data:image/png;base64,${avatarBytes.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: CREAM,
          color: INK,
          padding: 80,
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          backgroundImage: `radial-gradient(circle at 100% 0%, ${GOLD}22 0%, transparent 45%)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarSrc}
            width={64}
            height={64}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style={{ width: 64, height: 64, borderRadius: 14, objectFit: "cover", border: `3px solid ${INK}` } as any}
            alt="OptionsAji 阿吉"
          />
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>
            OptionsAji
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              maxWidth: 980,
            }}
          >
            美股期权数据与教育
          </div>
          <div style={{ fontSize: 30, fontWeight: 500, color: "#444" }}>
            异动 · 成交量 · 持仓 · GEX · 波动率 · 情绪
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `2px solid ${INK}`,
            paddingTop: 24,
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          <span style={{ color: INK }}>options-aji.com</span>
          <span style={{ color: GOLD, fontWeight: 800 }}>中文原生 · AI 深度分析</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
