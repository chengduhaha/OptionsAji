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
            本服务由 OptionsAji / Fredys Projects 运营。支付账户主体、网站展示主体和客服邮箱应保持一致；
            如主体信息更新，我们会在本页面同步。
          </p>
          <p>
            OptionsAji 是面向美股与期权市场的数据分析与教育工具。平台提供行情数据整理、GEX
            分析、期权链观察、新闻与宏观事件摘要、AI 辅助解读和学习内容。
          </p>
          <p>
            OptionsAji 不构成投资建议、交易建议、荐股、资产管理或投顾服务；我们不是注册投资顾问，
            不代表用户执行交易，不接触用户资金，不连接券商账户，也不托管任何资产。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">用户责任</h2>
          <p>
            用户应自行判断信息的适用性并承担交易风险。期权交易可能造成全部本金损失，任何历史数据、
            模型输出、AI 生成内容或情景推演均不保证未来结果。
          </p>
          <p>
            用户不得滥用服务、绕过访问控制、抓取或转售平台内容，也不得将平台输出包装成确定性收益承诺。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">订阅与取消</h2>
          <p>
            Pro 等数字订阅按页面展示的价格和周期收费。主支付入口为 Creem；Stripe 可作为后续或备用支付通道。
            订阅可取消，取消后通常在当前计费周期结束时生效。
          </p>
          <p>
            具体退款与取消规则请参阅 <Link href="/refund" className="text-primary hover:underline">退款政策</Link>。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">可用性与责任限制</h2>
          <p>
            市场数据、第三方 API、LLM 服务和网络环境可能出现延迟、缺失或错误。我们会尽力维护服务可用性，
            但不承诺任何数据实时性、完整性或特定用途适配性。
          </p>
          <p>
            在法律允许范围内，OptionsAji 不对因使用或无法使用服务产生的交易损失、机会损失、间接损失承担责任。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">联系我们</h2>
          <p>
            条款、订阅或账户问题请联系{" "}
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
