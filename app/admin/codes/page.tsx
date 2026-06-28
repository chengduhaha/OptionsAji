"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import V4Panel from "@/components/v4/V4Panel";
import V4StandaloneShell from "@/components/v4/V4StandaloneShell";
import { useAuth } from "@/lib/auth-context";
import { authFetch } from "@/lib/apiBase";
import { useI18n } from "@/lib/i18n/context";

type GenerateResponse = {
  batch_id: string;
  duration_tier: string;
  count: number;
  codes: string[];
};

export default function AdminCodesPage() {
  const { t } = useI18n();
  const { user, ready, isAdmin } = useAuth();
  const router = useRouter();
  const [tier, setTier] = useState<"7D" | "30D" | "365D">("365D");
  const [count, setCount] = useState(5);
  const [note, setNote] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (ready && !user) {
    router.replace("/login?next=/admin/codes");
    return null;
  }

  if (ready && user && !isAdmin) {
    return (
      <V4StandaloneShell title="403" subtitle="Admin access required.">
        <V4Panel>
          <Link
            href="/options/unusual"
            className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:brightness-95"
          >
            Home
          </Link>
        </V4Panel>
      </V4StandaloneShell>
    );
  }

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setCodes([]);
    try {
      const res = await authFetch("/api/admin/activation-codes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration_tier: tier, count, note: note || null }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          detail?: { message?: string };
          error?: { message?: string };
        };
        throw new Error(body.detail?.message ?? body.error?.message ?? `HTTP ${res.status}`);
      }
      const payload = (await res.json()) as GenerateResponse;
      setCodes(payload.codes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generate failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <V4StandaloneShell title={t("v3.membership.adminTitle")}>
      <div className="space-y-6">
        <V4Panel title={t("v3.membership.adminGenerate")}>
          <form onSubmit={onGenerate} className="space-y-4">
            <label className="block text-xs font-medium text-muted-foreground">
              {t("v3.membership.adminTier")}
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as "7D" | "30D" | "365D")}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="7D">7D — $9.9</option>
                <option value="30D">30D — $29</option>
                <option value="365D">365D — $199</option>
              </select>
            </label>
            <label className="block text-xs font-medium text-muted-foreground">
              {t("v3.membership.adminCount")}
              <input
                type="number"
                min={1}
                max={500}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="block text-xs font-medium text-muted-foreground">
              {t("v3.membership.adminNote")}
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:brightness-95 disabled:opacity-50"
            >
              {t("v3.membership.adminGenerate")}
            </button>
          </form>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        </V4Panel>

        {codes.length > 0 ? (
          <V4Panel title={t("v3.membership.adminCodes")}>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-border bg-secondary/30 p-4 font-mono text-xs">
              {codes.join("\n")}
            </pre>
          </V4Panel>
        ) : null}
      </div>
    </V4StandaloneShell>
  );
}
