import type { NextRequest } from "next/server";

import { backendBaseUrl, backendNotConfiguredResponse, backendUrlSatisfiesHttpsPolicy } from "@/lib/proxyBackend";

export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ path?: string[] }> };

const STRICT_HTTPS_MSG =
  "OPTIONS_AJI_REQUIRE_HTTPS_BACKEND=1 时，OPTIONS_AJI_BACKEND_URL 必须是 https:// 地址。";

function buildForwardHeaders(req: NextRequest, targetUrl: string): Headers {
  const headers = new Headers();
  headers.set("Host", new URL(targetUrl).host);
  headers.set("Accept", req.headers.get("accept") ?? "application/json");
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  const auth = req.headers.get("authorization");
  if (auth) headers.set("Authorization", auth);
  const apiKey = process.env.OPTIONS_AJI_API_KEY ?? "";
  if (apiKey) headers.set("X-API-Key", apiKey);
  return headers;
}

async function forward(req: NextRequest, segments: string[]): Promise<Response> {
  const base = backendBaseUrl();
  if (!base) return backendNotConfiguredResponse();
  if (!backendUrlSatisfiesHttpsPolicy(base)) {
    return Response.json(
      { success: false, error: { code: "backend_misconfigured", message: STRICT_HTTPS_MSG } },
      { status: 503 },
    );
  }

  const subpath = segments.length ? segments.join("/") : "";
  const incoming = new URL(req.url);
  const targetUrl = `${base.replace(/\/$/, "")}/api/blog/${subpath}${incoming.search}`;
  const headers = buildForwardHeaders(req, targetUrl);

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  try {
    const upstream = await fetch(targetUrl, init);
    const contentType = upstream.headers.get("content-type") ?? "application/json";
    const isPdf = contentType.includes("application/pdf");

    if (isPdf) {
      const buffer = await upstream.arrayBuffer();
      return new Response(buffer, {
        status: upstream.status,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": upstream.headers.get("content-disposition") ?? "inline",
          "Cache-Control": "public, max-age=300",
        },
      });
    }

    const bodyText = await upstream.text();
    return new Response(bodyText, {
      status: upstream.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": upstream.headers.get("cache-control") ?? "no-store",
      },
    });
  } catch (error: unknown) {
    const rendered = error instanceof Error ? `${error.name}: ${error.message}` : "proxy_failed";
    return Response.json(
      { success: false, error: { code: "proxy_failed", message: rendered } },
      { status: 502 },
    );
  }
}

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return forward(req, path ?? []);
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return forward(req, path ?? []);
}

export async function PUT(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return forward(req, path ?? []);
}

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return forward(req, path ?? []);
}
