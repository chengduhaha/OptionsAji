import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-8 text-[14px] leading-7 text-muted-foreground">
        <header className="space-y-3">
          <Link href="/landing" className="text-[13px] text-primary hover:underline">
            OptionsAji
          </Link>
          <h1 className="text-3xl font-semibold text-foreground">隐私政策</h1>
          <p>最后更新：2026 年 6 月 6 日</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">我们收集的信息</h2>
          <p>
            本服务由 OptionsAji / Fredys Projects 运营，客服邮箱为 support@optionsaji.com。
          </p>
          <p>
            我们可能收集账号信息（邮箱、显示名、登录状态）、订阅状态、访问日志、设备与浏览器信息、
            产品使用数据、用户主动提交的查询内容、收藏/提醒/设置等功能数据。
          </p>
          <p>
            OptionsAji 不收集券商登录信息，不连接交易账户，不接触资金，不保存完整银行卡信息。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">使用目的</h2>
          <p>
            数据用于账号登录、邮箱验证、订阅与权限判断、产品功能交付、用量统计、错误排查、安全防护、
            客服支持和产品改进。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">第三方服务</h2>
          <p>为交付服务，我们可能与以下第三方处理必要数据：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>支付与订阅：Creem（主支付入口）、Stripe（后续/备用支付通道）。</li>
            <li>邮件服务：SMTP 邮件服务商或 Resend，用于验证码、通知和客服沟通。</li>
            <li>数据分析与托管：站点分析、日志、错误监控、云部署与数据库服务。</li>
            <li>LLM 与 AI 服务：OpenRouter、小米 MiMo 或其他配置的模型服务，用于生成教育性分析摘要。</li>
            <li>市场数据源：FMP、OpenBB、Futu、Massive、yfinance、新闻与宏观数据源等。</li>
          </ul>
          <p>
            第三方仅在实现对应功能所需范围内处理数据，并受其各自隐私政策约束。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Cookie 与本地存储</h2>
          <p>
            我们可能使用 Cookie 或浏览器本地存储保存登录令牌、界面偏好、内部试用 Access Key
            和必要的产品状态。你可以在浏览器中清除这些数据，但部分功能可能需要重新登录或配置。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">数据权利</h2>
          <p>
            你可以请求访问、更正或删除账号相关数据。为防止误删，我们可能需要验证你的账号邮箱。
            订阅、税务或风控所需记录可能按法律和支付平台要求保留一段时间。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">联系我们</h2>
          <p>
            隐私相关请求请联系{" "}
            <a href="mailto:support@optionsaji.com" className="text-primary hover:underline">
              support@optionsaji.com
            </a>
            。
          </p>
        </section>
      </div>
    </main>
  );
}
