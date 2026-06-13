import type { NextRequest } from "next/server";

import { proxyToBackend } from "@/lib/proxyBackend";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const suffix = req.nextUrl.search ? req.nextUrl.search : "";
  return proxyToBackend(req, `/api/cross-market/polymarket/hot${suffix}`);
}
