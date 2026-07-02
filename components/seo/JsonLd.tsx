import { SITE_NAME, SITE_URL } from "@/lib/seo/site";

type JsonLdSchema = Record<string, unknown>;

/**
 * Generic JSON-LD injector. Renders an inline `<script type="application/ld+json">`
 * tag with a stable serialized payload. Server-only — JSON-LD must be present
 * in the initial HTML for crawlers; never render this as a client component.
 */
export function JsonLd({ schema }: { schema: JsonLdSchema }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify is safe here: schema is constructed from typed sources,
      // not user input. `dangerouslySetInnerHTML` is required for JSON-LD.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

const ORGANIZATION_SCHEMA: JsonLdSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description:
    "OptionsAji — 面向华语美股期权交易者的数据与教育平台：异动合约、成交量、持仓、GEX、波动率与情绪榜单，配合中文市场解读与课程。",
  sameAs: [
    "https://www.youtube.com/@Happybeanplus",
    "https://twitter.com/OptionsAji",
  ].filter(Boolean),
};

const WEB_SITE_SCHEMA: JsonLdSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "zh-CN",
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/blog?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

/**
 * Organization + WebSite schema, injected once in the root layout. Kept lean
 * (no YMYL `FinancialProduct`) per the SEO plan — Google is stricter on
 * financial structured data, so plain WebSite/Organization is safest.
 */
export function OrganizationWebSiteJsonLd() {
  return (
    <>
      <JsonLd schema={ORGANIZATION_SCHEMA} />
      <JsonLd schema={WEB_SITE_SCHEMA} />
    </>
  );
}

export type ArticleJsonLdProps = {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  tags?: string[];
  image?: string;
  authorName?: string;
};

export function ArticleJsonLd({
  headline,
  description,
  url,
  datePublished,
  dateModified,
  tags,
  image,
  authorName = SITE_NAME,
}: ArticleJsonLdProps) {
  const schema: JsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "zh-CN",
    author: { "@type": "Organization", name: authorName },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon`,
      },
    },
  };
  if (datePublished) schema.datePublished = datePublished;
  if (dateModified) schema.dateModified = dateModified;
  if (image) {
    schema.image = {
      "@type": "ImageObject",
      url: image,
      width: 1200,
      height: 630,
    };
  }
  if (tags && tags.length > 0) {
    schema.keywords = tags.join(", ");
    schema.about = tags.map((t) => ({ "@type": "Thing", name: t }));
  }
  return <JsonLd schema={schema} />;
}

export type BreadcrumbJsonLdProps = {
  /** Ordered list from root to current page (root excluded if you prefer). */
  crumbs: { name: string; url: string }[];
};

export function BreadcrumbJsonLd({ crumbs }: BreadcrumbJsonLdProps) {
  const schema: JsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
  return <JsonLd schema={schema} />;
}

export type WebPageJsonLdProps = {
  name: string;
  description: string;
  url: string;
  breadcrumb?: { name: string; url: string }[];
};

export function WebPageJsonLd({ name, description, url, breadcrumb }: WebPageJsonLdProps) {
  const schema: JsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url,
    inLanguage: "zh-CN",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
  if (breadcrumb && breadcrumb.length > 0) {
    schema.breadcrumb = {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumb.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: c.url,
      })),
    };
  }
  return <JsonLd schema={schema} />;
}
