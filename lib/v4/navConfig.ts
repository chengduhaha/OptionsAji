export type V4NavLink = {
  href: string;
  labelKey: string;
  taglineKey: string;
};

export type V4NavSection = {
  sectionKey: "v4.nav.section.hot" | "v4.nav.section.advanced";
  links: V4NavLink[];
};

export const V4_DATA_BOARDS = {
  labelKey: "v4.nav.dataBoards" as const,
  href: "/options/unusual" as const,
  sections: [
    {
      sectionKey: "v4.nav.section.hot" as const,
      links: [
        { href: "/options/unusual", labelKey: "v3.nav.unusual", taglineKey: "v4.nav.tagline.unusual" },
        { href: "/options/volume", labelKey: "v3.nav.volume", taglineKey: "v4.nav.tagline.volume" },
        { href: "/options/open-interest", labelKey: "v3.nav.openInterest", taglineKey: "v4.nav.tagline.openInterest" },
        { href: "/options/turnover", labelKey: "v3.nav.turnover", taglineKey: "v4.nav.tagline.turnover" },
      ],
    },
    {
      sectionKey: "v4.nav.section.advanced" as const,
      links: [
        { href: "/options/high-iv", labelKey: "v3.nav.highIv", taglineKey: "v4.nav.tagline.highIv" },
        { href: "/options/high-gamma", labelKey: "v3.nav.highGamma", taglineKey: "v4.nav.tagline.highGamma" },
        { href: "/options/seller", labelKey: "v3.nav.seller", taglineKey: "v4.nav.tagline.seller" },
        { href: "/options/liquidity", labelKey: "v3.nav.liquidity", taglineKey: "v4.nav.tagline.liquidity" },
        { href: "/options/sentiment", labelKey: "v3.nav.sentiment", taglineKey: "v4.nav.tagline.sentiment" },
        { href: "/options/gex", labelKey: "v3.nav.gex", taglineKey: "v4.nav.tagline.gex" },
      ],
    },
  ] satisfies V4NavSection[],
};

export const V4_ADMIN_LINKS = [
  { href: "/admin/blog", labelKey: "blog.admin.nav" },
  { href: "/admin/documents", labelKey: "blog.admin.documents.nav" },
  { href: "/admin/courses", labelKey: "blog.admin.courses.nav" },
  { href: "/admin/codes", labelKey: "blog.admin.codes.nav" },
] as const;

export const V4_FOOTER_COLS: { titleKey: string; links: { href: string; labelKey: string }[] }[] = [
  {
    titleKey: "v4.footer.boards",
    links: [
      { href: "/options/unusual", labelKey: "v3.nav.unusual" },
      { href: "/options/volume", labelKey: "v3.nav.volume" },
      { href: "/options/turnover", labelKey: "v3.nav.turnover" },
      { href: "/options/gex", labelKey: "v3.nav.gex" },
    ],
  },
  {
    titleKey: "v4.footer.product",
    links: [
      { href: "/", labelKey: "home.nav.home" },
      { href: "/pricing", labelKey: "v3.footer.links.pricing" },
      { href: "/blog", labelKey: "blog.nav.posts" },
      { href: "/blog/documents", labelKey: "home.nav.library" },
      { href: "/register", labelKey: "v3.membership.register" },
      { href: "/login", labelKey: "v3.membership.login" },
      { href: "/about", labelKey: "v3.footer.links.about" },
    ],
  },
  {
    titleKey: "v4.footer.legal",
    links: [
      { href: "/terms", labelKey: "v3.footer.links.terms" },
      { href: "/privacy", labelKey: "v3.footer.links.privacy" },
      { href: "/refund", labelKey: "v3.footer.links.refund" },
      { href: "/disclaimer", labelKey: "v3.footer.links.disclaimer" },
    ],
  },
  {
    titleKey: "v4.footer.contact",
    links: [{ href: "/contact", labelKey: "v3.footer.links.contact" }],
  },
];
