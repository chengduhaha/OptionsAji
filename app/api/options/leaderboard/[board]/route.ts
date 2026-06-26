import type { NextRequest } from "next/server";

import { proxyToBackend } from "@/lib/proxyBackend";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ board: string }> },
) {
  const { board } = await ctx.params;
  const qs = req.nextUrl.searchParams.toString();
  const suffix = qs.length > 0 ? `?${qs}` : "";
  return proxyToBackend(
    req,
    `/api/options/leaderboard/${encodeURIComponent(board)}${suffix}`,
    { responseCacheControl: "public, s-maxage=60, stale-while-revalidate=840" },
  );
}
