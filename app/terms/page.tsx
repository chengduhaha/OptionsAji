import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-8 text-[14px] leading-7 text-muted-foreground">
        <header className="space-y-3">
          <Link href="/landing" className="text-[13px] text-primary hover:underline">
            OptionsAji
          </Link>
          <h1 className="text-3xl font-semibold text-foreground">服务条款</h1>
          <p>最后更新：2026 年 6 月 6 日</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">服务范围</h2>
          <p>
            本服务由 OptionsAji / Fredys Projects 运营。
          </p>
          <p>提供的数据分析与教育工具包括：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>市场数据整理、GEX 分析、期权链观察</li>
            <li>新闻摘要与宏观事件观察</li>
            <li>AI 辅助解读和学习内容生成</li>
          </ul>
          <p>
            <strong className="text-foreground">免责声明：</strong>
            OptionsAji 不提供投资建议、交易建议或资金托管服务，不对用户资金或投资行为负责。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">用户责任</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>用户应自行判断信息的适用性，并承担使用风险。</li>
            <li>禁止滥用平台服务、抓取或转售内容。</li>
            <li>不得使用服务进行违法活动。</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">订阅与取消</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Pro 及其他付费订阅通过 Creem 或 Stripe 支付。</li>
            <li>用户取消订阅后，服务将在当前计费周期结束时生效。</li>
            <li>免费试用或限免功能使用规则应明确标注，以免产生用户争议。</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">可用性与责任限制</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>市场数据、API、LLM 服务及网络环境可能出现延迟或错误，平台不保证完全准确性。</li>
            <li>不可抗力事件（自然灾害、网络攻击等）导致服务中断，平台免责。</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">联系我们</h2>
          <p>
            服务条款相关问题，请联系{" "}
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
