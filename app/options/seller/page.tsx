import type { Metadata } from "next";

import V4LeaderboardPage from "@/components/v4/V4LeaderboardPage";
import { WebPageJsonLd } from "@/components/seo/JsonLd";
import { buildBoardMetadata, getBoardSeo } from "@/lib/seo/boards";
import { SITE_NAME, SITE_URL } from "@/lib/seo/site";

const SLUG = "seller";
export const metadata: Metadata = buildBoardMetadata(SLUG);

export default function SellerLeaderboardPage() {
  const seo = getBoardSeo(SLUG);
  const url = `${SITE_URL}/options/${SLUG}`;
  return (
    <>
      <WebPageJsonLd
        name={seo?.title ?? "期权卖方收益榜"}
        description={seo?.description ?? ""}
        url={url}
        breadcrumb={[
          { name: SITE_NAME, url: SITE_URL },
          { name: "期权数据榜单", url: `${SITE_URL}/options/unusual` },
          { name: seo?.title ?? "卖方收益榜", url },
        ]}
      />
      <V4LeaderboardPage boardId={SLUG} />
    </>
  );
}
