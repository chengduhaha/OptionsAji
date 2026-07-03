"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import V4Panel from "@/components/v4/V4Panel";
import V4StandaloneShell from "@/components/v4/V4StandaloneShell";
import { useAuth } from "@/lib/auth-context";
import { authFetch } from "@/lib/apiBase";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type GenerateResponse = {
  batch_id: string;
  duration_tier: string;
  count: number;
  codes: string[];
};

type CodeRow = {
  id: string;
  code_prefix: string;
  duration_tier: string;
  duration_days: number;
  status: string;
  redeemed_by_user_id: string | null;
  redeemed_by_email: string | null;
  redeemed_at: string | null;
  batch_id: string | null;
  note: string | null;
  created_at: string | null;
};

type StatusFilter = "all" | "available" | "redeemed" | "revoked" | "expired";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "—";
  const yyyy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  const hh = String(dt.getUTCHours()).padStart(2, "0");
  const mi = String(dt.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

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

  const [rows, setRows] = useState<CodeRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [listLimit] = useState(200);

  const loadCodes = useCallback(async () => {
    if (!isAdmin) return;
    setListLoading(true);
    setListError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status_filter", statusFilter);
      params.set("limit", String(listLimit));
      const res = await authFetch(`/api/admin/activation-codes?${params.toString()}`, {
        method: "GET",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          detail?: { message?: string };
          error?: { message?: string };
        };
        throw new Error(body.detail?.message ?? body.error?.message ?? `HTTP ${res.status}`);
      }
      const payload = (await res.json()) as CodeRow[];
      setRows(payload);
    } catch (err: unknown) {
      setListError(err instanceof Error ? err.message : t("blog.admin.codes.loadFailed"));
    } finally {
      setListLoading(false);
    }
  }, [isAdmin, statusFilter, listLimit, t]);

  useEffect(() => {
    if (ready && !user) {
      router.replace("/login?next=/admin/codes");
    }
  }, [ready, user, router]);

  useEffect(() => {
    if (ready && user && isAdmin) {
      void loadCodes();
    }
  }, [ready, user, isAdmin, loadCodes]);

  const filteredRows = useMemo(() => rows, [rows]);

  const summary = useMemo(() => {
    const redeemed = rows.filter((r) => r.status === "redeemed").length;
    const available = rows.filter((r) => r.status === "available").length;
    return { total: rows.length, redeemed, available };
  }, [rows]);

  if (ready && !user) {
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
      void loadCodes();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generate failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <V4StandaloneShell title={t("v3.membership.adminTitle")}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>
              {t("blog.admin.users.totalUsers")}:{" "}
              <span className="font-mono text-foreground">{summary.total}</span>
            </span>
            <span>
              {t("blog.admin.codes.statusAvailable")}:{" "}
              <span className="font-mono text-foreground">{summary.available}</span>
            </span>
            <span>
              {t("blog.admin.codes.statusRedeemed")}:{" "}
              <span className="font-mono text-foreground">{summary.redeemed}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/admin/users" className="text-muted-foreground hover:text-primary hover:underline">
              {t("blog.admin.users.nav")}
            </Link>
            <Link href="/admin/blog" className="text-muted-foreground hover:text-primary hover:underline">
              {t("blog.admin.nav")}
            </Link>
            <Link href="/admin/courses" className="text-muted-foreground hover:text-primary hover:underline">
              {t("blog.admin.courses.nav")}
            </Link>
          </div>
        </div>

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

        <V4Panel
          title={t("blog.admin.codes.listTitle")}
          subtitle={t("blog.admin.codes.listSubtitle")}
        >
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
            <label className="block text-xs font-medium text-muted-foreground">
              {t("blog.admin.codes.filterStatus")}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="mt-1.5 w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">{t("blog.admin.users.filterAll")}</option>
                <option value="available">{t("blog.admin.codes.statusAvailable")}</option>
                <option value="redeemed">{t("blog.admin.codes.statusRedeemed")}</option>
                <option value="revoked">{t("blog.admin.codes.statusRevoked")}</option>
                <option value="expired">{t("blog.admin.codes.statusExpired")}</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => void loadCodes()}
              className="rounded-md border-2 border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
            >
              {t("blog.admin.codes.refresh")}
            </button>
          </div>

          {listError ? (
            <p className="rounded-xl border-2 border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {listError}
            </p>
          ) : listLoading ? (
            <p className="text-sm text-muted-foreground">{t("blog.admin.users.loading")}</p>
          ) : filteredRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("blog.admin.codes.empty")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2.5">{t("blog.admin.codes.colPrefix")}</th>
                    <th className="px-3 py-2.5">{t("blog.admin.codes.colTier")}</th>
                    <th className="px-3 py-2.5">{t("blog.admin.codes.colStatus")}</th>
                    <th className="px-3 py-2.5">{t("blog.admin.codes.colRedeemedBy")}</th>
                    <th className="px-3 py-2.5">{t("blog.admin.codes.colRedeemedAt")}</th>
                    <th className="px-3 py-2.5">{t("blog.admin.codes.colNote")}</th>
                    <th className="px-3 py-2.5">{t("blog.admin.codes.colCreatedAt")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r) => (
                    <tr key={r.id} className="border-b border-border align-top hover:bg-secondary/30">
                      <td className="px-3 py-3 font-mono text-xs">{r.code_prefix}…</td>
                      <td className="px-3 py-3 font-mono text-xs">
                        {r.duration_tier}{" "}
                        <span className="text-muted-foreground">({r.duration_days}d)</span>
                      </td>
                      <td className="px-3 py-3">
                        <CodeStatusBadge status={r.status} t={t} />
                      </td>
                      <td className="px-3 py-3 font-mono text-xs">
                        {r.redeemed_by_email ?? "—"}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                        {formatDate(r.redeemed_at)}
                      </td>
                      <td className="px-3 py-3 text-xs text-foreground/80">{r.note ?? "—"}</td>
                      <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                        {formatDate(r.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </V4Panel>
      </div>
    </V4StandaloneShell>
  );
}

function CodeStatusBadge({
  status,
  t,
}: {
  status: string;
  t: (key: string, fallback?: string) => string;
}) {
  if (status === "redeemed") {
    return (
      <span className="inline-flex rounded-md border-2 border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
        {t("blog.admin.codes.statusRedeemed")}
      </span>
    );
  }
  if (status === "revoked") {
    return (
      <span className="inline-flex rounded-md border-2 border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
        {t("blog.admin.codes.statusRevoked")}
      </span>
    );
  }
  if (status === "expired") {
    return (
      <span className="inline-flex rounded-md border-2 border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
        {t("blog.admin.codes.statusExpired")}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex rounded-md border-2 border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground",
      )}
    >
      {t("blog.admin.codes.statusAvailable")}
    </span>
  );
}
