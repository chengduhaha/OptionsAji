"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";

import { useI18n } from "@/lib/i18n/context";

const EXAMPLE_HTML = `<div class="chart-card">
  <h2>近月 ATM IV 走势</h2>
  <p class="chart-note">用 Chart.js 渲染；仅允许 jsDelivr CDN 脚本。</p>
  <canvas id="demoIvChart" width="640" height="280" aria-label="IV chart"></canvas>
</div>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script>
  const ctx = document.getElementById('demoIvChart');
  if (ctx) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        datasets: [{ label: 'ATM IV %', data: [22, 24, 21, 26, 23], borderColor: '#c9a227', tension: 0.3 }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }
</script>`;

const PROMPT_TEMPLATE = `为 OptionsAji 博客生成 HTML 片段（不要完整 <!DOCTYPE> 页面）。
要求：
- 使用 class：chart-card, chart-note, data-table
- 图表用 <canvas> + Chart.js（仅 https://cdn.jsdelivr.net/npm/chart.js）
- 不要内联 <script> 代码块以外的 JS；不要外链除 jsDelivr 以外的脚本
- 配色：背景 #f5f2f0，文字 #151617，强调色 #c9a227
- 输出纯 HTML 片段，可直接粘贴到后台`;

export default function BlogHtmlAdminHelper() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"prompt" | "example" | null>(null);

  async function copyText(text: string, kind: "prompt" | "example") {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="rounded-lg border border-dashed border-primary/40 bg-secondary/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold"
      >
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        {t("blog.admin.htmlHelper.title")}
      </button>
      {open ? (
        <div className="space-y-4 border-t border-border px-4 pb-4 pt-3 text-sm">
          <section>
            <h3 className="font-semibold">{t("blog.admin.htmlHelper.styleGuide")}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>{t("blog.admin.htmlHelper.style1")}</li>
              <li>{t("blog.admin.htmlHelper.style2")}</li>
              <li>{t("blog.admin.htmlHelper.style3")}</li>
            </ul>
          </section>
          <section>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="font-semibold">{t("blog.admin.htmlHelper.promptTitle")}</h3>
              <button
                type="button"
                onClick={() => void copyText(PROMPT_TEMPLATE, "prompt")}
                className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:bg-background"
              >
                <Copy className="h-3 w-3" />
                {copied === "prompt" ? t("blog.admin.htmlHelper.copied") : t("blog.admin.htmlHelper.copy")}
              </button>
            </div>
            <pre className="max-h-40 overflow-auto rounded-md border border-border bg-background p-3 font-mono text-xs whitespace-pre-wrap">
              {PROMPT_TEMPLATE}
            </pre>
          </section>
          <section>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="font-semibold">{t("blog.admin.htmlHelper.exampleTitle")}</h3>
              <button
                type="button"
                onClick={() => void copyText(EXAMPLE_HTML, "example")}
                className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:bg-background"
              >
                <Copy className="h-3 w-3" />
                {copied === "example" ? t("blog.admin.htmlHelper.copied") : t("blog.admin.htmlHelper.copy")}
              </button>
            </div>
            <pre className="max-h-48 overflow-auto rounded-md border border-border bg-background p-3 font-mono text-xs whitespace-pre-wrap">
              {EXAMPLE_HTML}
            </pre>
          </section>
          <p className="text-xs text-muted-foreground">{t("blog.admin.htmlHelper.securityNote")}</p>
        </div>
      ) : null}
    </div>
  );
}
