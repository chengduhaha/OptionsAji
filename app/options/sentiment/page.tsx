import type { Metadata } from "next";

import V4SentimentPage from "@/components/v4/V4SentimentPage";
import { WebPageJsonLd } from "@/components/seo/JsonLd";
import { buildBoardMetadata, getBoardSeo } from "@/lib/seo/boards";
import { SITE_NAME, SITE_URL } from "@/lib/seo/site";

const SLUG = "sentiment";
export const metadata: Metadata = buildBoardMetadata(SLUG);

export default function OptionsSentimentPage() {
  const seo = getBoardSeo(SLUG);
  const url = `${SITE_URL}/options/${SLUG}`;
  return (
    <>
      <WebPageJsonLd
        name={seo?.title ?? "美股期权情绪快览"}
        description={seo?.description ?? ""}
        url={url}
        breadcrumb={[
          { name: SITE_NAME, url: SITE_URL },
          { name: "期权数据榜单", url: `${SITE_URL}/options/unusual` },
          { name: seo?.title ?? "情绪快览", url },
        ]}
      />
      <V4SentimentPage />
    </>
  );
}
