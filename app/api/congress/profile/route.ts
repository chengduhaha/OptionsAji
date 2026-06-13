import { proxyBackend } from "@/lib/proxyBackend";

export const GET = (req: Request) => {
  const url = new URL(req.url);
  const suffix = url.search ? url.search : "";
  return proxyBackend(`/api/congress/profile${suffix}`)(req);
};
