import Link from "next/link";

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-8 text-[14px] leading-7 text-muted-foreground">
        <header className="space-y-3">
          <Link href="/landing" className="text-[13px] text-primary hover:underline">
            OptionsAji
          </Link>
          <h1 className="text-3xl font-semibold text-foreground">退款与取消政策</h1>
          <p>最后更新：2026 年 6 月 6 日</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">数字订阅</h2>
          <p>
            OptionsAji Pro 属于数字订阅服务。订阅开通后，用户可以立即访问对应功能。主支付入口为 Creem；
            Stripe 可能作为后续或备用支付通道。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">取消订阅</h2>
          <p>
            你可以通过账户页面的“管理订阅”入口取消订阅。取消后通常仍可使用到当前已付费周期结束，
            下一周期不再自动续费。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">退款申请</h2>
          <p>
            首次购买 Pro 后 7 天内，如果你无法正常访问已购买功能或认为服务与页面说明明显不符，
            可以申请退款。续费订单、已经长期正常使用的订阅、违反服务条款或滥用服务的账号，通常不提供按比例退款。
          </p>
          <p>
            如你认为存在重复扣费、误扣费、无法访问已购买服务或其他合理退款原因，请联系{" "}
            <a href="mailto:support@optionsaji.com" className="text-primary hover:underline">
              support@optionsaji.com
            </a>
            。请提供账户邮箱、支付时间、订单或订阅信息以及问题说明。
          </p>
          <p>
            我们通常会在 5 个工作日内回复退款请求。退款处理可能由 Creem 或 Stripe 按其支付与合规流程执行；
            如果适用法律或 Creem 作为 Merchant of Record 的规则提供更高保护，以对应规则为准。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">例外情况</h2>
          <p>
            滥用服务、违反服务条款、恶意退款或已长期正常使用的订阅请求，可能无法获得退款。法律另有要求的，
            以适用法律和支付平台规则为准。
          </p>
        </section>
      </div>
    </main>
  );
}
