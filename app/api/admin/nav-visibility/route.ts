import type { NextRequest } from "next/server";

export const runtime = "nodejs";

async function forward(req: NextRequest): Promise<Response> {
  const base = (process.env.OPTIONS_AJI_BACKEND_URL ?? "").trim();
  if (!base) {
    return Response.json(
      { error: { code: "backend_not_configured", message: "缺少 OPTIONS_AJI_BACKEND_URL。" } },
      { status: 503 },
    );
  }
  const headers = new Headers({ Accept: "application/json" });
  const ct = req.headers.get("content-type");
  if (ct) headers.set("Content-Type", ct);
  const auth = req.headers.get("authorization");
  if (auth) headers.set("Authorization", auth);
  const apiKey = process.env.OPTIONS_AJI_API_KEY ?? "";
  if (apiKey) headers.set("X-API-Key", apiKey);

  const target = `${base.replace(/\/$/, "")}/api/admin/nav-visibility`;
  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
    body: req.method !== "GET" ? await req.text() : undefined,
  };
  try {
    const upstream = await fetch(target, init);
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "proxy_failed";
    return Response.json({ error: { code: "proxy_failed", message: msg } }, { status: 502 });
  }
}

export async function PUT(req: NextRequest): Promise<Response> {
  return forward(req);
}
