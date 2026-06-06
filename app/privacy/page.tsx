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
          <h2 className="text-lg font-semibold text-foreground">信息收集</h2>
          <p>我们可能收集以下信息：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>账户信息（邮箱、显示名、登录状态）</li>
            <li>访问日志、设备与浏览器信息</li>
            <li>用户主动提交的内容或查询数据</li>
          </ul>
          <p>不收集券商登录信息、交易账户、银行信息。</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">使用目的</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>用于账户登录、邮箱验证、订阅及权限判断</li>
            <li>功能交付、用量统计、安全防护</li>
            <li>客服支持及产品改进</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">第三方服务</h2>
          <p>我们可能使用以下第三方处理数据：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>支付与订阅：Creem、Stripe</li>
            <li>邮件服务：SMTP 或 Resend（用于验证、通知和沟通）</li>
            <li>数据分析与托管：站点分析、日志、监控、云部署</li>
            <li>AI 服务：OpenRouter、小米 MiMo 等模型服务</li>
            <li>市场数据：FMP、OpenBB、Futu、yfinance 等</li>
          </ul>
          <p>第三方仅处理必要范围内的数据，并受各自隐私政策约束。</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">用户权利</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>用户可请求访问、更正或删除账户相关数据。</li>
            <li>为防止误操作，可能需验证账户邮箱或其他身份信息。</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Cookie 与本地存储</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>可能使用 Cookie 或浏览器本地存储保存登录信息、界面偏好和访问状态。</li>
            <li>用户可自行清理或拒绝 Cookie，但部分功能可能需要重新登录或配置。</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">联系我们</h2>
          <p>
            服务条款或隐私政策相关问题，请联系{" "}
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
