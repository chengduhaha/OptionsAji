"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { NeoPanel } from "@/components/v3/NeoPanel";
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
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <NeoPanel title="403" accent="peach">
          <p className="text-sm">Admin access required.</p>
          <Link href="/" className="neo-button inline-block mt-4">Home</Link>
        </NeoPanel>
      </div>
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
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <h1 className="font-display text-3xl font-extrabold uppercase">{t("v3.membership.adminTitle")}</h1>

        <NeoPanel title={t("v3.membership.adminGenerate")} accent="lavender">
          <form onSubmit={onGenerate} className="space-y-4">
            <label className="block font-mono text-xs uppercase">
              {t("v3.membership.adminTier")}
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as "7D" | "30D" | "365D")}
                className="neo-input mt-1 w-full"
              >
                <option value="7D">7D — $9.9</option>
                <option value="30D">30D — $29</option>
                <option value="365D">365D — $199</option>
              </select>
            </label>
            <label className="block font-mono text-xs uppercase">
              {t("v3.membership.adminCount")}
              <input
                type="number"
                min={1}
                max={500}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="neo-input mt-1 w-full"
              />
            </label>
            <label className="block font-mono text-xs uppercase">
              {t("v3.membership.adminNote")}
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="neo-input mt-1 w-full"
              />
            </label>
            <button type="submit" disabled={busy} className="neo-button">
              {t("v3.membership.adminGenerate")}
            </button>
          </form>
          {error ? <p className="mt-3 text-sm text-[#C03030] font-mono">{error}</p> : null}
        </NeoPanel>

        {codes.length > 0 ? (
          <NeoPanel title={t("v3.membership.adminCodes")} accent="peach">
            <pre className="font-mono text-xs whitespace-pre-wrap break-all bg-cream border-2 border-ink p-4 max-h-96 overflow-auto">
              {codes.join("\n")}
            </pre>
          </NeoPanel>
        ) : null}
      </div>
    </div>
  );
}
