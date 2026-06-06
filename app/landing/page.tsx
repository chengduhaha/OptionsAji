"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, BarChart3, Brain, Calendar,
  Globe, ScanLine, Sparkles, Star, Check, Activity, ShieldCheck,
} from "lucide-react";
import { clsx } from "clsx";

const FEATURES = [
  {
    icon: BarChart3,
    title: "GEX 分析",
    description: "整理 Gamma Exposure 数据，辅助理解做市商对冲环境与关键价格区间。",
  },
  {
    icon: Brain,
    title: "AI 智能分析",
    description: "多模型协作的 AI Agent，用自然语言把期权链、新闻与波动率整理成研究笔记。",
  },
  {
    icon: ScanLine,
    title: "期权数据筛选器",
    description: "按流动性与方向筛选合约，帮助发现值得进一步研究的市场线索。",
  },
  {
    icon: Calendar,
    title: "财报日历",
    description: "财报前后 IV 变化整理，用于教育性的情景复盘与风险对照。",
  },
  {
    icon: Globe,
    title: "宏观经济",
    description: "Fed 政策与经济数据整合，提供利率与风险偏好的宏观背景视角。",
  },
];

const STATS = [
  { value: "50+", label: "数据分析视角" },
  { value: "多源", label: "行情与新闻数据" },
  { value: "教育", label: "非投资建议" },
  { value: "0", label: "资金托管 / 交易执行" },
];

const DATA_SOURCES = ["FMP", "OpenBB", "Futu", "Massive", "Discord 存档"];

const PRICING = [
  {
    tier: "Free",
    price: "$0",
    period: "永久免费",
    description: "入门体验，了解平台核心功能",
    features: ["基础行情数据", "延迟 15 分钟", "每日 5 次 AI 问答", "基础 GEX 概览"],
    cta: "免费开始",
    popular: false,
  },
  {
    tier: "Pro",
    price: "$49",
    period: "/月",
    description: "更完整的数据分析与教育功能",
    features: [
      "实时行情数据", "无限 AI 问答", "完整 GEX 分析", "期权数据筛选器",
      "异常活动追踪", "财报分析", "推送通知",
    ],
    cta: "升级 Pro",
    popular: true,
  },
  {
    tier: "Advanced",
    price: "$149",
    period: "/月",
    description: "高级研究与优先支持",
    features: [
      "Pro 全部功能", "深度报告生成", "API 访问", "历史情景复盘",
      "1 对 1 支持", "优先新功能", "定制数据看板",
    ],
    cta: "联系销售",
    popular: false,
  },
];

const TESTIMONIALS = [
  {
    quote: "OptionsAji 的 GEX 视图让我能更快整理 NVDA 财报前后的关键价格区间。",
    author: "Jason L.", role: "期权交易员", avatar: "JL",
  },
  {
    quote: "AI 助手适合把期权链、新闻和波动率变化整理成便于复盘的研究笔记。",
    author: "Sarah W.", role: "独立投资者", avatar: "SW",
  },
  {
    quote: "GEX 快览和 AI 摘要帮我在开盘前完成观察清单，但最终判断仍由我自己负责。",
    author: "Mike C.", role: "期权交易员", avatar: "MC",
  },
];

/** Lightweight scroll-reveal — no dependencies. */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={clsx(
        "transition-all duration-700 ease-out will-change-transform",
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">
      {children}
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ===== Navigation ===== */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border2 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-[12px] font-bold text-primary-foreground">
              OA
            </div>
            <span className="text-[16px] font-semibold tracking-tight">OptionsAji</span>
          </Link>
          <div className="hidden items-center gap-9 md:flex">
            <a href="#features" className="text-[14px] text-muted-foreground transition-colors hover:text-foreground">功能</a>
            <a href="#ai" className="text-[14px] text-muted-foreground transition-colors hover:text-foreground">AI 分析师</a>
            <a href="#pricing" className="text-[14px] text-muted-foreground transition-colors hover:text-foreground">价格</a>
            <a href="#testimonials" className="text-[14px] text-muted-foreground transition-colors hover:text-foreground">用户评价</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-lg px-4 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
              登录
            </Link>
            <Link href="/register" className="lift inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground">
              开始使用 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section className="relative px-6 pt-40 pb-24">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px]"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border2 bg-card px-4 py-1.5 shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[13px] text-muted-foreground">AI 驱动的期权数据研究平台</span>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="display-1 text-[clamp(2.75rem,6vw,5rem)] text-foreground">
              用数据，更系统地
              <br />
              <span className="text-primary">研究美股期权</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-7 max-w-2xl text-[17px] leading-relaxed text-muted-foreground md:text-[19px]">
              GEX 数据、AI 辅助解读、期权链与宏观事件整合于一处。
              OptionsAji 是数据分析与教育工具——不提供投资建议，也不执行交易。
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register" className="lift inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-[15px] font-semibold text-primary-foreground">
                免费开始使用 <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-7 py-3.5 text-[15px] font-medium text-foreground transition-colors hover:border-primary/40">
                探索功能
              </a>
            </div>
          </Reveal>
        </div>

        {/* Product mockup */}
        <Reveal delay={320} className="mx-auto mt-20 max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)]">
            <div className="flex items-center gap-1.5 border-b border-border2 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red/60" />
              <span className="h-3 w-3 rounded-full bg-primary/60" />
              <span className="h-3 w-3 rounded-full bg-green/60" />
              <span className="ml-3 text-[11px] text-muted">app.optionsaji.com — 市场洞察</span>
            </div>
            <div className="flex">
              <div className="hidden w-16 space-y-3 border-r border-border2 p-3 md:block">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-9 w-9 rounded-lg surface-1" />
                ))}
              </div>
              <div className="flex-1 p-6">
                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {["SPY", "QQQ", "DIA", "IWM"].map((symbol, i) => (
                    <div key={symbol} className="rounded-xl surface-1 px-4 py-3.5">
                      <div className="stat-label">{symbol}</div>
                      <div className="stat-value mt-1.5 text-[24px]">{(540 + i * 56).toFixed(2)}</div>
                      <div className={clsx("mt-1 text-[12px] font-medium tabular-nums", i % 2 === 0 ? "text-green" : "text-red")}>
                        {i % 2 === 0 ? "+" : "−"}{(0.4 + i * 0.5).toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-xl surface-1 p-4">
                    <div className="stat-label mb-3">GEX PROFILE</div>
                    <div className="flex h-24 items-end gap-1">
                      {[...Array(22)].map((_, i) => (
                        <div key={i} className={clsx("flex-1 rounded-t", i < 11 ? "bg-red/35" : "bg-green/40")} style={{ height: `${24 + ((i * 37) % 60)}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl surface-1 p-4">
                    <div className="stat-label mb-3">AI 研究笔记</div>
                    <div className="space-y-2">
                      {[{ s: "NVDA", t: "情景" }, { s: "AAPL", t: "波动" }, { s: "SPY", t: "结构" }].map((r) => (
                        <div key={r.s} className="flex items-center gap-2 rounded-lg bg-card px-2.5 py-2">
                          <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">{r.t}</span>
                          <span className="font-mono text-[12px]">{r.s}</span>
                          <span className="ml-auto text-[11px] text-muted-foreground">已整理</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Trust strip */}
        <Reveal delay={120} className="mx-auto mt-14 max-w-4xl">
          <p className="text-center text-[12px] uppercase tracking-[0.2em] text-muted">数据来源</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {DATA_SOURCES.map((src) => (
              <span key={src} className="text-[15px] font-semibold text-muted-foreground/70">{src}</span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ===== Stats band ===== */}
      <section className="border-y border-border2 bg-card/40 px-6 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80} className="text-center">
              <div className="stat-value text-[40px] text-foreground">{stat.value}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">{stat.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow><Sparkles className="h-3.5 w-3.5" /> 核心功能</Eyebrow>
            <h2 className="display-2 mt-4 text-foreground">系统化的期权研究工具</h2>
            <p className="mt-4 text-[17px] text-muted-foreground">
              从 GEX 分析到 AI 辅助解读，一站式整理期权研究所需的信息。
            </p>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, idx) => (
              <Reveal key={feature.title} delay={(idx % 3) * 90}>
                <div className="lift h-full rounded-2xl border border-border bg-card p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="heading-2 mt-5 text-foreground">{feature.title}</h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI Section — cinematic dark band ===== */}
      <section id="ai" className="relative overflow-hidden bg-[#0b0f17] px-6 py-28 text-white">
        <div
          className="pointer-events-none absolute inset-0 -z-0"
          style={{ background: "radial-gradient(ellipse 60% 50% at 30% 0%, rgba(240,180,41,0.12) 0%, transparent 60%)" }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <Eyebrow><Brain className="h-3.5 w-3.5" /> AI AGENT 系统</Eyebrow>
            <h2 className="display-2 mt-4 text-white">
              你的专属
              <br />
              <span className="text-primary">AI 期权分析师</span>
            </h2>
            <p className="mt-6 text-[17px] leading-relaxed text-white/65">
              基于多模型协作的 AI Agent 系统，能够理解复杂的期权问题，获取市场数据并生成教育性解读，
              帮助你形成自己的研究框架。
            </p>
            <div className="mt-8 space-y-3.5">
              {[
                "自然语言交互，无需学习复杂指令",
                "实时接入 GEX、期权链、新闻数据",
                "多 Agent 协作，从不同角度整理信息",
                "情景推演与风险要点一站式归纳",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-[15px] text-white/85">{item}</span>
                </div>
              ))}
            </div>
            <Link href="/ai" className="lift mt-9 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-[14px] font-semibold text-primary-foreground">
              体验 AI 分析 <Sparkles className="h-4 w-4" />
            </Link>
          </Reveal>

          <Reveal delay={160}>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-[11px] font-bold text-primary-foreground">OA</div>
                <div>
                  <div className="text-[13px] font-semibold text-white">OptionsAji AI</div>
                  <div className="flex items-center gap-1 text-[11px] text-white/50"><Activity className="h-3 w-3 text-green" /> 在线</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-white/10 px-4 py-3">
                    <p className="text-[13px] text-white/90">SPY 现在的 GEX 环境怎么样？</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-[9px] font-bold text-primary-foreground">OA</div>
                  <div className="flex-1 rounded-2xl rounded-tl-md bg-white/[0.06] px-4 py-3">
                    <p className="text-[13px] leading-relaxed text-white/85">
                      SPY 目前处于<span className="font-medium text-green">正 Gamma 环境</span>，Net GEX 约 $2.4B。
                      Put Wall 在 $540，Call Wall 在 $560。
                      <br /><br />
                      这意味着做市商倾向于在下跌时买入、上涨时卖出，波动会被<span className="font-medium text-primary">压缩</span>。
                      可进一步观察<span className="font-medium text-primary">震荡情景</span>下的风险与收益结构。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section id="pricing" className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow><Star className="h-3.5 w-3.5" /> 定价方案</Eyebrow>
            <h2 className="display-2 mt-4 text-foreground">选择适合你的方案</h2>
            <p className="mt-4 text-[17px] text-muted-foreground">
              从免费入门到 Pro 订阅，所有付费入口优先使用 Creem；Stripe 保留为后续备用通道。
            </p>
          </Reveal>
          <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {PRICING.map((plan, idx) => (
              <Reveal key={plan.tier} delay={idx * 90}>
                <div className={clsx(
                  "relative flex h-full flex-col rounded-2xl border bg-card p-7",
                  plan.popular ? "border-primary/50 shadow-[0_20px_50px_-20px_rgba(200,136,26,0.45)]" : "border-border",
                )}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
                      最受欢迎
                    </div>
                  )}
                  <div className="text-[13px] font-semibold text-primary">{plan.tier}</div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="stat-value text-[38px] text-foreground">{plan.price}</span>
                    <span className="text-[14px] text-muted">{plan.period}</span>
                  </div>
                  <p className="mt-2 text-[13px] text-muted-foreground">{plan.description}</p>
                  <div className="my-7 space-y-3 border-t border-border2 pt-7">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 flex-shrink-0 text-green" />
                        <span className="text-[13px] text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={plan.tier === "Free" ? "/register" : plan.tier === "Pro" ? "/profile" : "/contact"}
                    className={clsx(
                      "mt-auto inline-flex w-full items-center justify-center rounded-xl py-3 text-[14px] font-semibold transition-all",
                      plan.popular
                        ? "lift bg-primary text-primary-foreground"
                        : "border border-border bg-card text-foreground hover:border-primary/40",
                    )}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-7 text-center text-[12px] text-muted-foreground">
            数字订阅按月计费，可随时取消。支付由 Creem 处理；Stripe 仅作为兼容/备用方案，我们不保存银行卡信息。
          </p>
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      <section id="testimonials" className="border-t border-border2 bg-card/40 px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow><Star className="h-3.5 w-3.5" /> 用户评价</Eyebrow>
            <h2 className="display-2 mt-4 text-foreground">交易者的选择</h2>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, idx) => (
              <Reveal key={t.author} delay={idx * 90}>
                <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-7">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="flex-1 text-[15px] leading-relaxed text-foreground">{`"${t.quote}"`}</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                      <span className="text-[11px] font-bold text-primary">{t.avatar}</span>
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-foreground">{t.author}</div>
                      <div className="text-[12px] text-muted">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Risk disclaimer ===== */}
      <section className="px-6 py-16">
        <Reveal className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-border bg-card p-7">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-[17px] font-semibold text-foreground">重要风险与服务边界</h2>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 text-[13px] leading-relaxed text-muted-foreground md:grid-cols-2">
              <p>
                OptionsAji 仅提供数据分析、市场信息整理与教育性内容，不构成投资建议、交易建议、荐股、投顾服务或收益承诺。
              </p>
              <p>
                OptionsAji 不是注册投资顾问，不执行交易，不接触用户资金，不连接券商账户，也不托管任何资产。期权交易风险很高，请独立判断并自行承担风险。
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="px-6 pb-28">
        <Reveal className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl bg-[#0b0f17] px-8 py-20 text-center">
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse 50% 60% at 50% 0%, rgba(240,180,41,0.16) 0%, transparent 60%)" }}
            />
            <div className="relative">
              <h2 className="display-1 text-[clamp(2rem,4vw,3.25rem)] text-white">准备好开始了吗？</h2>
              <p className="mx-auto mt-5 max-w-xl text-[17px] text-white/65">
                开始使用 OptionsAji 整理期权数据、宏观事件与教育性研究笔记。
              </p>
              <Link href="/register" className="lift mt-9 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-[16px] font-semibold text-primary-foreground">
                免费开始使用 <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-border2 px-6 py-14">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground">OA</div>
              <span className="text-[15px] font-semibold">OptionsAji</span>
            </div>
            <p className="mt-4 max-w-xs text-[12px] leading-relaxed text-muted">
              数据分析与期权教育平台。不构成投资建议，不执行交易，不托管资金。
            </p>
          </div>
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-muted">产品</div>
            <div className="mt-4 flex flex-col gap-2.5 text-[13px] text-muted-foreground">
              <a href="#features" className="transition-colors hover:text-foreground">功能</a>
              <a href="#ai" className="transition-colors hover:text-foreground">AI 分析师</a>
              <a href="#pricing" className="transition-colors hover:text-foreground">价格</a>
            </div>
          </div>
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-muted">法务</div>
            <div className="mt-4 flex flex-col gap-2.5 text-[13px] text-muted-foreground">
              <Link href="/privacy" className="transition-colors hover:text-foreground">隐私政策</Link>
              <Link href="/terms" className="transition-colors hover:text-foreground">服务条款</Link>
              <Link href="/refund" className="transition-colors hover:text-foreground">退款政策</Link>
            </div>
          </div>
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-muted">公司</div>
            <div className="mt-4 flex flex-col gap-2.5 text-[13px] text-muted-foreground">
              <Link href="/contact" className="transition-colors hover:text-foreground">联系我们</Link>
              <Link href="/login" className="transition-colors hover:text-foreground">登录</Link>
              <Link href="/register" className="transition-colors hover:text-foreground">注册</Link>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-6xl border-t border-border2 pt-6 text-center text-[12px] text-muted">
          © 2026 OptionsAji · 免责声明：本平台仅提供数据分析与教育内容，不构成投资建议。交易有风险，请自行判断。
        </div>
      </footer>
    </div>
  );
}
