import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const AUTH_COOKIE_NAME = "optionsaji_jwt";

function authCookieMaxAgeSeconds(): number {
  const hours = Number(process.env.JWT_EXPIRE_HOURS ?? "24");
  if (!Number.isFinite(hours) || hours <= 0) return 24 * 3600;
  return Math.max(60, Math.floor(hours * 3600));
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: authCookieMaxAgeSeconds(),
  };
}

async function verifyTokenWithBackend(token: string): Promise<boolean> {
  const base = (process.env.OPTIONS_AJI_BACKEND_URL ?? "").trim();
  if (!base) return false;

  const headers = new Headers({ Accept: "application/json", Authorization: `Bearer ${token}` });
  const apiKey = process.env.OPTIONS_AJI_API_KEY ?? "";
  if (apiKey) headers.set("X-API-Key", apiKey);

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/auth/me`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Mirror localStorage JWT into an HttpOnly cookie for /admin middleware. */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  let token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    try {
      const body = (await req.json()) as { token?: string };
      token = (body.token ?? "").trim();
    } catch {
      token = "";
    }
  }

  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: "missing_token", message: "缺少登录凭证。" } },
      { status: 400 },
    );
  }

  const valid = await verifyTokenWithBackend(token);
  if (!valid) {
    return NextResponse.json(
      { success: false, error: { code: "invalid_token", message: "登录已失效，请重新登录。" } },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE_NAME, token, cookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...cookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
