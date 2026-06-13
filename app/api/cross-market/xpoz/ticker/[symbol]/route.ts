import { proxyBackend } from "@/lib/proxyBackend";

type RouteContext = { params: Promise<{ symbol: string }> };

export async function GET(req: Request, context: RouteContext) {
  const { symbol } = await context.params;
  return proxyBackend(`/api/cross-market/xpoz/ticker/${encodeURIComponent(symbol)}`)(req);
}
