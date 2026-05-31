import type { NextRequest } from "next/server";

import { proxyToBackend } from "@/lib/proxyBackend";

export const runtime = "nodejs";

function backendPath(path?: string[]): string {
  const suffix = path?.length ? `/${path.map(encodeURIComponent).join("/")}` : "";
  return `/api/v1/graph${suffix}`;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const params = await ctx.params;
  const search = new URL(req.url).search;
  return proxyToBackend(req, `${backendPath(params.path)}${search}`);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const params = await ctx.params;
  const body = await req.text();
  return proxyToBackend(req, backendPath(params.path), { method: "POST", body });
}
