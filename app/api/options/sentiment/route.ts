import type { NextRequest } from "next/server";

import { proxyToBackend } from "@/lib/proxyBackend";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.searchParams.toString();
  const suffix = qs.length > 0 ? `?${qs}` : "";
  return proxyToBackend(req, `/api/options/sentiment${suffix}`, {
    responseCacheControl: "public, s-maxage=60, stale-while-revalidate=840",
  });
}
