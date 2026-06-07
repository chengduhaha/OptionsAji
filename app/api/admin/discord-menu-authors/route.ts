import { proxyBackend } from "@/lib/proxyBackend";

export const runtime = "nodejs";

export const PUT = proxyBackend("/api/admin/discord-menu-authors");
