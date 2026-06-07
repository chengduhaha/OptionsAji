import { proxyBackend } from "@/lib/proxyBackend";

export const runtime = "nodejs";

export const GET = proxyBackend("/api/admin/discord/author-profiles");
export const PUT = proxyBackend("/api/admin/discord/author-profiles");
