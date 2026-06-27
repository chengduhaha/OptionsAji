import type { NextRequest } from "next/server";

import { proxyToBackend } from "@/lib/proxyBackend";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return proxyToBackend(req, "/api/admin/activation-codes/generate");
}

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.searchParams.toString();
  const suffix = qs ? `?${qs}` : "";
  return proxyToBackend(req, `/api/admin/activation-codes${suffix}`);
}
