import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const rootPage = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const namespaces = readFileSync(new URL("../lib/i18n/namespaces.ts", import.meta.url), "utf8");
const offerUrl = new URL("../lib/membership-offer.ts", import.meta.url);

function topLevelBlocks(source, key) {
  const pattern = new RegExp(`\\n  ${key}: \\{[\\s\\S]*?(?=\\n  [a-zA-Z0-9_]+: \\{|\\n};)`, "g");
  return Array.from(source.matchAll(pattern), (match) => match[0]);
}

test("home page is a landing page instead of redirecting straight to data tables", () => {
  assert.doesNotMatch(rootPage, /redirect\(["']\/options\/unusual["']\)/);
  assert.match(rootPage, /HomeLandingPage/);
});

test("membership positioning is centralized for pricing and blog surfaces", () => {
  assert.equal(existsSync(offerUrl), true);
  const offer = readFileSync(offerUrl, "utf8");
  const pricingPage = readFileSync(new URL("../app/pricing/page.tsx", import.meta.url), "utf8");

  assert.match(offer, /contentLibrary/);
  assert.match(offer, /dataDashboards/);
  assert.match(offer, /ongoingUpdates/);
  assert.match(offer, /id: "member"/);
  assert.doesNotMatch(offer, /id: "premium"/);
  assert.match(pricingPage, /md:grid-cols-2/);
  assert.match(pricingPage, /BillingPeriod/);
  assert.doesNotMatch(pricingPage, /md:grid-cols-3/);
});

test("membership copy does not promise unavailable AI analyst or fixed library counts", () => {
  const offerBlocks = topLevelBlocks(namespaces, "membershipOffer").join("\n");

  assert.doesNotMatch(offerBlocks, /108/);
  assert.doesNotMatch(offerBlocks, /AI 分析师与策略解读|AI analyst and strategy reads/i);
});

test("membership copy does not promise daily or weekly output cadence", () => {
  const blogBlocks = topLevelBlocks(namespaces, "blog");

  assert.equal(blogBlocks.length, 2);
  for (const copy of blogBlocks) {
    assert.doesNotMatch(copy, /每日|每周/);
    assert.doesNotMatch(copy, /:\s*"[^"]*(Daily|Weekly)[^"]*"/i);
  }
});

test("public positioning copy avoids internal merger language", () => {
  const publicBlocks = [
    topLevelBlocks(namespaces, "home").join("\n"),
    topLevelBlocks(namespaces, "membershipOffer").join("\n"),
    topLevelBlocks(namespaces, "blog").join("\n"),
  ].join("\n");

  assert.doesNotMatch(publicBlocks, /统一|二合一|通吃/);
  assert.doesNotMatch(publicBlocks, /unified|all-in-one|one membership/i);
});

test("desktop header actions stay on a single line", () => {
  const header = readFileSync(new URL("../components/v4/V4SiteHeader.tsx", import.meta.url), "utf8");

  assert.match(header, /whitespace-nowrap/);
  assert.match(header, /flex-shrink-0/);
});

test("blog hub is an editorial index, not a second sales landing page", () => {
  const blogHub = readFileSync(new URL("../components/blog/BlogHubPageClient.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(blogHub, /BlogMembershipSection/);
  assert.doesNotMatch(blogHub, /BlogAdvantagesSection/);
  assert.doesNotMatch(blogHub, /BlogContactSection/);
});

test("desktop dropdown navigation is not clipped by the nav container", () => {
  const header = readFileSync(new URL("../components/v4/V4SiteHeader.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(header, /overflow-x-auto/);
  assert.match(header, /overflow-visible/);
});

test("about page is a focused bio page without duplicated sales sections", () => {
  const about = readFileSync(new URL("../components/blog/BlogAboutPageClient.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(about, /BlogMembershipSection/);
  assert.doesNotMatch(about, /BlogAdvantagesSection/);
  assert.doesNotMatch(about, /BlogContactSection/);
  assert.doesNotMatch(about, /membershipBody|platformBody|membershipCta/);
});

test("blog brand is editorial while homepage owns Aji positioning content", () => {
  const home = readFileSync(new URL("../components/home/HomeLandingPage.tsx", import.meta.url), "utf8");
  const blogBlocks = topLevelBlocks(namespaces, "blog").join("\n");

  assert.match(blogBlocks, /brand:\s*"阿吉博客"/);
  assert.match(blogBlocks, /title:\s*"阿吉博客"/);
  assert.match(home, /BlogAdvantagesSection/);
});

test("public positioning avoids named third-party data vendors and competitor price lists", () => {
  const advantages = readFileSync(new URL("../components/blog/BlogAdvantagesSection.tsx", import.meta.url), "utf8");
  const publicBlocks = [
    topLevelBlocks(namespaces, "home").join("\n"),
    topLevelBlocks(namespaces, "membershipOffer").join("\n"),
    topLevelBlocks(namespaces, "blog").join("\n"),
    advantages,
  ].join("\n");

  assert.doesNotMatch(publicBlocks, /Market Chameleon|SpotGamma|Unusual Whales|MenthorQ|ORATS|Volland/i);
  assert.doesNotMatch(publicBlocks, /platform pricing|订阅费用|竞品|竞争对手/);
  assert.doesNotMatch(advantages, /\$\d+|\$500/);
  assert.match(publicBlocks, /原创数据分析|原创分析|original data analysis/i);
});
