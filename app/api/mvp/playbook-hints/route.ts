import type { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxyBackend";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<Response> {
  const incoming = new URL(req.url);
  return proxyBackend(req, `/api/mvp/playbook-hints${incoming.search}`);
}
