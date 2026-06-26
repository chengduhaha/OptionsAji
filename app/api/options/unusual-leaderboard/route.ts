import { proxyBackend } from "@/lib/proxyBackend";

export const GET = proxyBackend("/api/options/unusual-leaderboard", {
  responseCacheControl: "public, s-maxage=60, stale-while-revalidate=840",
});
