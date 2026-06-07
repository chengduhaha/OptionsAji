import {
  backendBaseUrl,
  backendMisconfiguredResponse,
  backendNotConfiguredResponse,
  backendUrlSatisfiesHttpsPolicy,
} from "@/lib/proxyBackend";

export const runtime = "nodejs";

const STRICT_HTTPS_MSG =
  "OPTIONS_AJI_REQUIRE_HTTPS_BACKEND=1 时，OPTIONS_AJI_BACKEND_URL 必须是 https:// 地址。";

async function proxyAvatarRequest(req: Request, method: "POST" | "DELETE"): Promise<Response> {
  const base = backendBaseUrl();
  if (!base) return backendNotConfiguredResponse();
  if (!backendUrlSatisfiesHttpsPolicy(base)) {
    return backendMisconfiguredResponse(STRICT_HTTPS_MSG);
  }

  const incomingUrl = new URL(req.url);
  const target = `${base.replace(/\/$/, "")}/api/admin/discord/author-profiles/avatar${incomingUrl.search}`;
  const headers = new Headers();
  const authorization = req.headers.get("authorization");
  if (authorization) headers.set("Authorization", authorization);
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  const apiKey = process.env.OPTIONS_AJI_API_KEY ?? "";
  if (apiKey) headers.set("X-API-Key", apiKey);

  try {
    const upstream = await fetch(target, {
      method,
      headers,
      body: method === "POST" ? await req.arrayBuffer() : undefined,
      cache: "no-store",
    });
    const bodyText = await upstream.text();
    return new Response(bodyText, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
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

export async function POST(req: Request): Promise<Response> {
  return proxyAvatarRequest(req, "POST");
}

export async function DELETE(req: Request): Promise<Response> {
  return proxyAvatarRequest(req, "DELETE");
}
