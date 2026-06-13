import type { XpozHotItem } from "@/lib/crossMarket";
import { fetchServerJson } from "@/lib/serverDataFetch";
import { SocialHeatView } from "@/components/cross-market/social-heat-view";

export default async function CrossMarketXpozPage() {
  const data = await fetchServerJson<{
    items: XpozHotItem[];
    configured: boolean;
  }>(
    "/api/cross-market/xpoz/hot?limit=15",
    "/api/cross-market/xpoz/hot?limit=15",
    { items: [], configured: false },
  );

  return <SocialHeatView items={data.items ?? []} hasData={data.configured !== false} />;
}
