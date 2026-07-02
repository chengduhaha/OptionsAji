import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Neo-Brutalist v4 favicon — ink square with gold "阿" glyph.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111114",
          color: "#D4AF37",
          fontSize: 22,
          fontWeight: 800,
          borderRadius: 6,
        }}
      >
        阿
      </div>
    ),
    { ...size },
  );
}
