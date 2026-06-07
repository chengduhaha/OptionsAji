import { proxyBackend } from "@/lib/proxyBackend";

export const runtime = "nodejs";

export const GET = proxyBackend("/api/admin/discord/authors");
