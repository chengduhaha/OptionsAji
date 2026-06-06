import type { NextRequest } from "next/server";

import { proxyToBackend } from "@/lib/proxyBackend";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return proxyToBackend(req, "/api/creem/portal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}
