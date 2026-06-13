import type { HotEvent } from "@/lib/crossMarket";
import { fetchServerJson } from "@/lib/serverDataFetch";
import { PolymarketHotView } from "@/components/cross-market/polymarket-hot-view";

export default async function CrossMarketPolymarketPage() {
  const data = await fetchServerJson<{ events: HotEvent[] }>(
    "/api/cross-market/polymarket/hot?limit=20",
    "/api/cross-market/polymarket/hot?limit=20",
    { events: [] },
  );

  return <PolymarketHotView events={data.events ?? []} />;
}
