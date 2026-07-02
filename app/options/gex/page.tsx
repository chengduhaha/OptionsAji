import type { Metadata } from "next";

import V4GexDashboard from "@/components/v4/V4GexDashboard";
import { WebPageJsonLd } from "@/components/seo/JsonLd";
import { buildBoardMetadata, getBoardSeo } from "@/lib/seo/boards";
import { SITE_NAME, SITE_URL } from "@/lib/seo/site";

const SLUG = "gex";
export const metadata: Metadata = buildBoardMetadata(SLUG);

export default function OptionsGexPage() {
  const seo = getBoardSeo(SLUG);
  const url = `${SITE_URL}/options/${SLUG}`;
  return (
    <>
      <WebPageJsonLd
        name={seo?.title ?? "SPY QQQ GEX 分析"}
        description={seo?.description ?? ""}
        url={url}
        breadcrumb={[
          { name: SITE_NAME, url: SITE_URL },
          { name: "期权数据榜单", url: `${SITE_URL}/options/unusual` },
          { name: seo?.title ?? "GEX 分析", url },
        ]}
      />
      <V4GexDashboard />
    </>
  );
}
