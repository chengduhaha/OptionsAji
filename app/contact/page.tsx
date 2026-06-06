import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-8 text-[14px] leading-7 text-muted-foreground">
        <header className="space-y-3">
          <Link href="/landing" className="text-[13px] text-primary hover:underline">
            OptionsAji
          </Link>
          <h1 className="text-3xl font-semibold text-foreground">联系 OptionsAji</h1>
          <p>我们提供数据分析与教育工具，不提供投资建议、交易执行或资金托管。</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">运营主体</h2>
          <p>
            公开主体名称：OptionsAji / Fredys Projects。支付账户主体、收款描述符和网站品牌应保持一致。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">支持邮箱</h2>
          <p>
            订阅、退款、账户、隐私或产品问题请联系{" "}
            <a href="mailto:support@optionsaji.com" className="text-primary hover:underline">
              support@optionsaji.com
            </a>
            。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">服务说明</h2>
          <p>
            OptionsAji 面向期权学习者、数据研究者和独立交易者，提供市场数据整理、AI 辅助摘要和教育性情景分析。
            所有交易决策均由用户独立作出并自行承担风险。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">法务链接</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/terms" className="text-primary hover:underline">服务条款</Link>
            <Link href="/privacy" className="text-primary hover:underline">隐私政策</Link>
            <Link href="/refund" className="text-primary hover:underline">退款政策</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
