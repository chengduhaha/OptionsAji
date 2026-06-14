import { proxyBackend } from "@/lib/proxyBackend";

export const runtime = "nodejs";

export const POST = proxyBackend("/api/admin/sync/congress-profiles");
