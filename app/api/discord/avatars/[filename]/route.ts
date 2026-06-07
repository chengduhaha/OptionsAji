import {
  backendBaseUrl,
  backendMisconfiguredResponse,
  backendNotConfiguredResponse,
  backendUrlSatisfiesHttpsPolicy,
} from "@/lib/proxyBackend";

export const runtime = "nodejs";

const STRICT_HTTPS_MSG =
  "OPTIONS_AJI_REQUIRE_HTTPS_BACKEND=1 时，OPTIONS_AJI_BACKEND_URL 必须是 https:// 地址。";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ filename: string }> },
): Promise<Response> {
  const base = backendBaseUrl();
  if (!base) return backendNotConfiguredResponse();
  if (!backendUrlSatisfiesHttpsPolicy(base)) {
    return backendMisconfiguredResponse(STRICT_HTTPS_MSG);
  }

  const { filename } = await ctx.params;
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "");
  if (!safe) {
    return new Response("invalid filename", { status: 400 });
  }

  const target = `${base.replace(/\/$/, "")}/api/discord/avatars/${encodeURIComponent(safe)}`;
  try {
    const upstream = await fetch(target, { cache: "no-store" });
    if (!upstream.ok) {
      return new Response(await upstream.text(), { status: upstream.status });
    }
    const buffer = await upstream.arrayBuffer();
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/png",
        "Cache-Control": upstream.headers.get("cache-control") ?? "public, max-age=3600",
      },
    });
  } catch (error: unknown) {
    const rendered =
      error instanceof Error ? `${error.name}: ${error.message}` : "proxy_failed";
    return Response.json(
      { success: false, error: { code: "proxy_failed", message: rendered } },
      { status: 502 },
    );
  }
}
