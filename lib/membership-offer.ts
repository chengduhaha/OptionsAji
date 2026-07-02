export const MEMBERSHIP_VALUE_KEYS = [
  "contentLibrary",
  "dataDashboards",
  "courseArchive",
  "ongoingUpdates",
  "community",
] as const;

export type BillingPeriod = "monthly" | "annual";

export const TRIAL_BILLING = {
  priceZh: "¥49",
  priceEn: "$9.9",
  periodZh: "/7天",
  periodEn: "/7 days",
} as const;

export const MEMBER_BILLING = {
  monthly: {
    priceZh: "¥199",
    priceEn: "$29",
    periodZh: "/月",
    periodEn: "/mo",
    referenceEn: "≈ $29/mo",
  },
  annual: {
    priceZh: "¥1,499",
    priceEn: "$199",
    periodZh: "/年",
    periodEn: "/yr",
    wasZh: "¥1,999",
    wasEn: "$249",
    monthlyEquivZh: "月均 ¥125",
    monthlyEquivEn: "≈ $17/mo",
    saveZh: "相较月付省 ¥889",
    saveEn: "Save ¥889 vs monthly",
    referenceEn: "≈ $199/yr",
  },
} as const;

export const PRICING_TIERS = [
  {
    id: "free",
    nameKey: "membershipOffer.tiers.free.name",
    eyebrowKey: "membershipOffer.tiers.free.eyebrow",
    descriptionKey: "membershipOffer.tiers.free.description",
    priceZh: "¥0",
    priceEn: "$0",
    ctaKey: "membershipOffer.tiers.free.cta",
    ctaHref: "/options/unusual",
    featured: false,
    featureKeys: [
      "membershipOffer.tiers.free.f1",
      "membershipOffer.tiers.free.f2",
      "membershipOffer.tiers.free.f3",
      "membershipOffer.tiers.free.f4",
    ],
  },
  {
    id: "member",
    nameKey: "membershipOffer.tiers.member.name",
    eyebrowKey: "membershipOffer.tiers.member.eyebrow",
    descriptionKey: "membershipOffer.tiers.member.description",
    ctaKey: "membershipOffer.tiers.member.cta",
    ctaHref: "/register",
    featured: true,
    featureKeys: [
      "membershipOffer.tiers.member.f1",
      "membershipOffer.tiers.member.f2",
      "membershipOffer.tiers.member.f3",
      "membershipOffer.tiers.member.f4",
    ],
  },
] as const;

export const BLOG_MEMBERSHIP_TIERS = PRICING_TIERS.filter((tier) => tier.id !== "free");
