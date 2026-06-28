export const MEMBERSHIP_VALUE_KEYS = [
  "contentLibrary",
  "dataDashboards",
  "courseArchive",
  "ongoingUpdates",
  "community",
] as const;

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
    ],
  },
  {
    id: "standard",
    nameKey: "membershipOffer.tiers.standard.name",
    eyebrowKey: "membershipOffer.tiers.standard.eyebrow",
    descriptionKey: "membershipOffer.tiers.standard.description",
    priceZh: "¥199/月起",
    priceEn: "From $29/mo",
    ctaKey: "membershipOffer.tiers.standard.cta",
    ctaHref: "/register",
    featured: true,
    featureKeys: [
      "membershipOffer.tiers.standard.f1",
      "membershipOffer.tiers.standard.f2",
      "membershipOffer.tiers.standard.f3",
      "membershipOffer.tiers.standard.f4",
      "membershipOffer.tiers.standard.f5",
    ],
  },
  {
    id: "premium",
    nameKey: "membershipOffer.tiers.premium.name",
    eyebrowKey: "membershipOffer.tiers.premium.eyebrow",
    descriptionKey: "membershipOffer.tiers.premium.description",
    priceZh: "¥598/月",
    priceEn: "$89/mo",
    ctaKey: "membershipOffer.tiers.premium.cta",
    ctaHref: "/contact",
    featured: false,
    featureKeys: [
      "membershipOffer.tiers.premium.f1",
      "membershipOffer.tiers.premium.f2",
      "membershipOffer.tiers.premium.f3",
      "membershipOffer.tiers.premium.f4",
    ],
  },
] as const;

export const BLOG_MEMBERSHIP_TIERS = PRICING_TIERS.filter((tier) => tier.id !== "free");
