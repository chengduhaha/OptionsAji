import { redirect } from "next/navigation";

export default async function StockStrategyRedirect({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  redirect(`/stock/${symbol.trim().toUpperCase()}/overview`);
}
