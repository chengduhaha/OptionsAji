"use client";

import Link from "next/link";
import {
  ArrowRight, BarChart3, Brain, Calendar,
  ChevronRight, Globe,
  Play, ScanLine, Sparkles, Star, Target,
  Users, Zap, Check, Activity
} from "lucide-react";
import { clsx } from "clsx";

const FEATURES = [
  {
    icon: BarChart3,
    title: "GEX 分析",
    description: "整理 Gamma Exposure 数据，辅助理解做市商对冲环境",
    color: "from-primary to-accent",
  },
  {
    icon: Brain,
    title: "AI 智能分析",
    description: "多模型协作的 AI Agent，自然语言交互分析期权",
    color: "from-accent to-secondary",
  },
  {
    icon: ScanLine,
    title: "期权扫描器",
    description: "监控异常期权活动，帮助发现值得进一步研究的市场线索",
    color: "from-secondary to-purple",
  },
  {
    icon: Calendar,
    title: "财报日历",
    description: "财报前后 IV 变化分析，用于教育性情景复盘",
    color: "from-primary to-green",
  },
  {
    icon: Globe,
    title: "宏观经济",
    description: "Fed 政策、经济数据全覆盖，宏观视角辅助决策",
    color: "from-green to-accent",
  },
];

const STATS = [
  { value: "50+", label: "数据分析视角" },
  { value: "多源", label: "行情与新闻数据" },
  { value: "教育", label: "非投资建议" },
  { value: "0", label: "资金托管 / 交易执行" },
];

const PRICING = [
  { 
    tier: "Free", 
    price: "$0", 
    period: "永久免费",
    description: "入门体验，了解平台核心功能",
    features: [
      "基础行情数据",
      "延迟 15 分钟",
      "每日 5 次 AI 问答",
      "基础 GEX 概览",
    ],
    cta: "免费开始",
    popular: false,
  },
  { 
    tier: "Pro", 
    price: "$49", 
    period: "/月",
    description: "更完整的数据分析与教育功能",
    features: [
      "实时行情数据",
      "无限 AI 问答",
      "完整 GEX 分析",
      "期权扫描器",
      "异常活动追踪",
      "财报分析",
      "推送通知",
    ],
    cta: "升级 Pro",
    popular: true,
  },
  { 
    tier: "Alpha", 
    price: "$149", 
    period: "/月",
    description: "高级研究与优先支持",
    features: [
      "Pro 全部功能",
      "深度报告生成",
      "API 访问",
      "历史情景复盘",
      "1 对 1 支持",
      "优先新功能",
      "定制数据看板",
    ],
    cta: "联系销售",
    popular: false,
  },
];

const TESTIMONIALS = [
  {
    quote: "OptionsAji 的 GEX 视图让我能更快整理 NVDA 财报前后的关键价格区间。",
    author: "Jason L.",
    role: "期权交易员",
    avatar: "JL",
  },
  {
    quote: "AI 助手适合把期权链、新闻和波动率变化整理成便于复盘的研究笔记。",
    author: "Sarah W.",
    role: "独立投资者",
    avatar: "SW",
  },
  {
    quote: "GEX 快览和 AI 摘要帮我在开盘前完成观察清单，但最终判断仍由我自己负责。",
    author: "Mike C.",
    role: "期权交易员",
    avatar: "MC",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-glass-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[12px] font-bold text-primary-foreground shadow-md shadow-primary/20">
              OA
            </div>
            <span className="text-[17px] font-bold text-foreground">OptionsAji</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[14px] text-muted-foreground hover:text-foreground transition-colors">功能</a>
            <a href="#pricing" className="text-[14px] text-muted-foreground hover:text-foreground transition-colors">价格</a>
            <a href="#testimonials" className="text-[14px] text-muted-foreground hover:text-foreground transition-colors">用户评价</a>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              登录
            </Link>
            <Link 
              href="/register"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground text-[13px] font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
            >
              开始使用 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 hero-grid opacity-50" />
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle border border-primary/20 mb-8 animate-fade-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[13px] text-muted-foreground">AI 驱动的下一代期权分析平台</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-up stagger-1">
            <span className="text-foreground">用数据更系统地</span>
            <br />
            <span className="gradient-text">研究美股期权</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up stagger-2">
            GEX 数据、AI 辅助解读、期权链与宏观事件整合。
            <br className="hidden md:block" />
            OptionsAji 是数据分析与教育工具，不提供投资建议，也不执行交易。
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up stagger-3">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-[15px] font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all glow-primary"
            >
              免费开始使用 <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl glass-subtle text-[15px] font-medium text-foreground hover:border-primary/30 transition-all">
              <Play className="w-5 h-5 text-primary" />
              观看演示
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-up stagger-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground number-display mb-1">
                  {stat.value}
                </div>
                <div className="text-[13px] text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative max-w-6xl mx-auto mt-20 animate-fade-up stagger-5">
          <div className="relative glass rounded-2xl border border-glass-border p-2 shadow-2xl shadow-black/50">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-accent/5 rounded-2xl" />
            <div className="relative bg-background rounded-xl overflow-hidden">
              {/* Mock Dashboard */}
              <div className="flex">
                {/* Sidebar mock */}
                <div className="w-16 bg-glass border-r border-glass-border p-3 space-y-3 hidden md:block">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-lg bg-glass-border" />
                  ))}
                </div>
                {/* Main content mock */}
                <div className="flex-1 p-6">
                  <div className="grid grid-cols-5 gap-4 mb-6">
                    {["SPY", "QQQ", "AAPL", "TSLA", "VIX"].map((symbol, i) => (
                      <div key={symbol} className="glass rounded-xl p-4">
                        <div className="text-[10px] text-muted mb-2">{symbol}</div>
                        <div className="text-[18px] font-mono font-bold text-foreground">
                          {(540 + i * 50).toFixed(2)}
                        </div>
                        <div className={clsx(
                          "text-[11px] font-mono mt-1",
                          i % 2 === 0 ? "text-green" : "text-red"
                        )}>
                          {i % 2 === 0 ? "+" : "-"}{(Math.random() * 2).toFixed(2)}%
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass rounded-xl p-4 h-40">
                      <div className="text-[12px] text-muted mb-2">GEX Profile</div>
                      <div className="h-24 flex items-end gap-1">
                        {[...Array(20)].map((_, i) => (
                          <div 
                            key={i} 
                            className={clsx(
                              "flex-1 rounded-t",
                              i < 10 ? "bg-red/40" : "bg-green/40"
                            )}
                            style={{ height: `${20 + Math.random() * 60}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="glass rounded-xl p-4 h-40">
                      <div className="text-[12px] text-muted mb-2">AI 信号</div>
                      <div className="space-y-2">
                        {[
                          { symbol: "NVDA", type: "CALL", conf: 87 },
                          { symbol: "AAPL", type: "PUT", conf: 72 },
                          { symbol: "SPY", type: "CALL", conf: 65 },
                        ].map((sig) => (
                          <div key={sig.symbol} className="flex items-center gap-2 p-2 rounded-lg bg-glass">
                            <span className={clsx(
                              "px-1.5 py-0.5 rounded text-[9px] font-bold",
                              sig.type === "CALL" ? "bg-green/20 text-green" : "bg-red/20 text-red"
                            )}>
                              {sig.type}
                            </span>
                            <span className="font-mono text-[12px] text-foreground">{sig.symbol}</span>
                            <span className="ml-auto text-[11px] text-primary">{sig.conf}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl -z-10 opacity-50" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-[13px] text-muted-foreground">核心功能</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              系统化期权分析工具
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              从 GEX 分析到 AI 辅助解读，一站式整理期权研究所需的信息
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, idx) => (
              <div 
                key={feature.title}
                className={clsx(
                  "group glass rounded-2xl p-6 card-interactive opacity-0 animate-fade-up",
                  `stagger-${(idx % 5) + 1}`
                )}
              >
                <div className={clsx(
                  "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg",
                  feature.color
                )}>
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-[18px] font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-[13px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  了解更多 <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle border border-accent/20 mb-6">
                <Brain className="w-4 h-4 text-accent" />
                <span className="text-[13px] text-muted-foreground">AI Agent 系统</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                你的专属
                <br />
                <span className="gradient-text">AI 期权分析师</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                基于多模型协作的 AI Agent 系统，能够理解复杂的期权问题，
                获取市场数据并生成教育性解读，帮助你形成自己的研究框架。
              </p>
              <div className="space-y-4">
                {[
                  "自然语言交互，无需学习复杂指令",
                  "实时接入 GEX、期权链、新闻数据",
                  "多 Agent 协作，从不同角度整理信息",
                  "情景推演与风险要点一站式归纳",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-[14px] text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <Link 
                href="/ai"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-secondary text-accent-foreground text-[14px] font-medium shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all"
              >
                体验 AI 分析 <Sparkles className="w-4 h-4" />
              </Link>
            </div>
            {/* AI Demo Card */}
            <div className="relative">
              <div className="glass rounded-2xl p-6 border border-accent/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-[11px] font-bold text-primary-foreground">OA</span>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">OptionsAji AI</div>
                    <div className="text-[11px] text-muted flex items-center gap-1">
                      <Activity className="w-3 h-3 text-green" /> 在线
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="glass-subtle rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%]">
                      <p className="text-[13px] text-foreground">SPY 现在的 GEX 环境怎么样？</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-primary-foreground">OA</span>
                    </div>
                    <div className="glass rounded-2xl rounded-tl-md px-4 py-3 flex-1">
                      <p className="text-[13px] text-foreground leading-relaxed">
                        SPY 目前处于<span className="text-green font-medium">正 Gamma 环境</span>，
                        Net GEX 约 $2.4B。Put Wall 在 $540，Call Wall 在 $560。
                        <br /><br />
                        这意味着做市商会在下跌时买入、上涨时卖出，市场波动会被<span className="text-primary font-medium">压缩</span>。
                        可进一步观察<span className="text-accent font-medium">震荡情景</span>下的风险与收益结构。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-primary/20 blur-3xl -z-10 opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle border border-primary/20 mb-6">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-[13px] text-muted-foreground">定价方案</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              选择适合你的方案
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              从免费入门到 Pro 订阅，所有付费入口优先使用 Creem；Stripe 保留为后续备用通道。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING.map((plan, idx) => (
              <div 
                key={plan.tier}
                className={clsx(
                  "relative glass rounded-2xl p-6 opacity-0 animate-fade-up",
                  `stagger-${idx + 1}`,
                  plan.popular && "border-2 border-primary/50 scale-105"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-[11px] font-bold text-primary-foreground">
                    最受欢迎
                  </div>
                )}
                <div className="text-[13px] text-primary font-semibold mb-2">{plan.tier}</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted">{plan.period}</span>
                </div>
                <p className="text-[13px] text-muted mb-6">{plan.description}</p>
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green" />
                      <span className="text-[13px] text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href={plan.tier === "Free" ? "/register" : plan.tier === "Pro" ? "/profile" : "/contact"} className={clsx(
                  "w-full inline-flex items-center justify-center py-3 rounded-xl text-[14px] font-medium transition-all",
                  plan.popular
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40"
                    : "glass-subtle text-foreground hover:border-primary/30"
                )}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-[12px] text-muted-foreground">
            数字订阅按月计费，可取消。支付由 Creem 处理；Stripe 仅作为兼容/备用方案，我们不保存银行卡信息。
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle border border-primary/20 mb-6">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-[13px] text-muted-foreground">用户评价</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              交易者的选择
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div 
                key={testimonial.author}
                className={clsx(
                  "glass rounded-2xl p-6 opacity-0 animate-fade-up",
                  `stagger-${idx + 1}`
                )}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-[15px] text-foreground leading-relaxed mb-6">
                  {`"${testimonial.quote}"`}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-primary">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">{testimonial.author}</div>
                    <div className="text-[12px] text-muted">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Disclaimer */}
      <section className="py-16 px-6 relative">
        <div className="max-w-5xl mx-auto rounded-2xl border border-amber-500/25 bg-amber-500/10 p-6">
          <h2 className="text-[18px] font-semibold text-foreground mb-3">重要风险与服务边界</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px] text-muted-foreground leading-relaxed">
            <p>
              OptionsAji 仅提供数据分析、市场信息整理与教育性内容，不构成投资建议、交易建议、荐股、投顾服务或收益承诺。
            </p>
            <p>
              OptionsAji 不是注册投资顾问，不执行交易，不接触用户资金，不连接券商账户，也不托管任何资产。期权交易风险很高，请独立判断并自行承担风险。
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                准备好开始了吗？
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                开始使用 OptionsAji 整理期权数据、宏观事件与教育性研究笔记
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-[16px] font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all"
                >
                  免费开始使用 <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-glass-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-primary-foreground">
              OA
            </div>
            <span className="text-[14px] font-semibold text-foreground">OptionsAji</span>
          </div>
          <p className="text-[12px] text-muted text-center">
            免责声明：本平台仅提供数据分析与教育内容，不构成投资建议。交易有风险，请自行判断。
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">隐私政策</Link>
            <Link href="/terms" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">服务条款</Link>
            <Link href="/refund" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">退款政策</Link>
            <Link href="/contact" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">联系</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
