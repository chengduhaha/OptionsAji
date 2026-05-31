import { redirect } from "next/navigation";

export default async function StockEarningsRedirect({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  redirect(`/stock/${symbol.trim().toUpperCase()}/overview`);
}
