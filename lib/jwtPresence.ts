import { createHmac, timingSafeEqual } from "node:crypto";

type JwtPayload = {
  sub?: string;
  exp?: number;
};

function decodeBase64Url(value: string): Buffer {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64");
}

function parseJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = decodeBase64Url(parts[1]).toString("utf8");
    const payload = JSON.parse(json) as JwtPayload;
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
}

function verifyJwtSignature(token: string, secret: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const header = decodeBase64Url(parts[0]).toString("utf8");
  if (!header.includes('"HS256"')) return false;

  const expected = createHmac("sha256", secret)
    .update(`${parts[0]}.${parts[1]}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  const actual = parts[2];
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
}

/** Validate JWT shape/exp (and signature when secret is configured). */
export function isUsableAccessToken(token: string): boolean {
  const trimmed = token.trim();
  if (!trimmed) return false;

  const payload = parseJwtPayload(trimmed);
  if (!payload?.sub || typeof payload.exp !== "number") return false;
  if (payload.exp * 1000 <= Date.now()) return false;

  const secret = (process.env.OPTIONS_AJI_JWT_SECRET ?? process.env.JWT_SECRET_KEY ?? "").trim();
  if (secret) {
    return verifyJwtSignature(trimmed, secret);
  }

  return true;
}
