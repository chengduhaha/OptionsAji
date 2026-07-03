"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import V4Panel from "@/components/v4/V4Panel";
import V4StandaloneShell from "@/components/v4/V4StandaloneShell";
import { authFetch } from "@/lib/apiBase";
import { useAuth } from "@/lib/auth-context";
import type { AuthUserContract } from "@/lib/contracts";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type RoleFilter = "all" | "user" | "admin" | "disabled";
type MembershipFilter = "all" | "member" | "free" | "expired";
type RoleOption = "user" | "admin" | "disabled";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "—";
  // YYYY-MM-DD HH:mm (UTC) — stable across locales
  const yyyy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  const hh = String(dt.getUTCHours()).padStart(2, "0");
  const mi = String(dt.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function membershipState(user: AuthUserContract): "member" | "free" | "expired" {
  const m = user.membership;
  if (!m || !m.is_member) return "free";
  if (m.membership_expires_at) {
    const expires = new Date(m.membership_expires_at).getTime();
    if (Number.isNaN(expires)) return "member";
    if (expires < Date.now()) return "expired";
  }
  return "member";
}

export default function AdminUsersPage() {
  const { t } = useI18n();
  const { token, user, ready, isAdmin } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<AuthUserContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [membershipFilter, setMembershipFilter] = useState<MembershipFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(20);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/auth/admin/users", { method: "GET" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          detail?: { message?: string };
          error?: { message?: string };
        };
        throw new Error(body.detail?.message ?? body.error?.message ?? `HTTP ${res.status}`);
      }
      const payload = (await res.json()) as AuthUserContract[];
      // Backend already sorts by created_at desc; keep a stable fallback just in case.
      payload.sort((a, b) => {
        const at = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bt = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bt - at;
      });
      setUsers(payload);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("blog.admin.users.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  const patchRole = useCallback(
    async (id: string, role: RoleOption) => {
      if (!token) return;
      const previous = users;
      // optimistic update
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
      setError(null);
      try {
        const res = await authFetch(`/api/auth/admin/users/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            detail?: { message?: string };
            error?: { message?: string };
          };
          throw new Error(body.detail?.message ?? body.error?.message ?? `HTTP ${res.status}`);
        }
        const updated = (await res.json()) as AuthUserContract;
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
      } catch (err: unknown) {
        setUsers(previous);
        setError(err instanceof Error ? err.message : t("blog.admin.users.loadFailed"));
      }
    },
    [token, users, t],
  );

  useEffect(() => {
    if (!ready) return;
    if (!user) return;
    if (!isAdmin) {
      router.replace("/");
      return;
    }
    void load();
  }, [ready, user, isAdmin, router, load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (q && !u.email.toLowerCase().includes(q)) return false;
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (membershipFilter !== "all" && membershipState(u) !== membershipFilter) return false;
      return true;
    });
  }, [users, search, roleFilter, membershipFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, membershipFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(pageStart, pageStart + pageSize);

  const summary = useMemo(() => {
    const members = users.filter((u) => membershipState(u) === "member").length;
    return { total: users.length, members };
  }, [users]);

  if (!ready || !user || !isAdmin) {
    return <div className="p-8 text-sm text-muted-foreground">{t("blog.admin.users.loading")}</div>;
  }

  return (
    <V4StandaloneShell title={t("blog.admin.users.title")} subtitle={t("blog.admin.users.subtitle")}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>
              {t("blog.admin.users.totalUsers")}: <span className="font-mono text-foreground">{summary.total}</span>
            </span>
            <span>
              {t("blog.admin.users.totalMembers")}: <span className="font-mono text-foreground">{summary.members}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/admin/blog" className="text-muted-foreground hover:text-primary hover:underline">
              {t("blog.admin.nav")}
            </Link>
            <Link href="/admin/documents" className="text-muted-foreground hover:text-primary hover:underline">
              {t("blog.admin.documents.nav")}
            </Link>
            <Link href="/admin/courses" className="text-muted-foreground hover:text-primary hover:underline">
              {t("blog.admin.courses.nav")}
            </Link>
            <Link href="/admin/codes" className="text-muted-foreground hover:text-primary hover:underline">
              {t("blog.admin.codes.nav")}
            </Link>
          </div>
        </div>

        <V4Panel>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-xs font-medium text-muted-foreground">
              {t("blog.admin.users.searchPlaceholder")}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("blog.admin.users.searchPlaceholder")}
                className="mt-1.5 w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="block text-xs font-medium text-muted-foreground">
              {t("blog.admin.users.filterRole")}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                className="mt-1.5 w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">{t("blog.admin.users.filterAll")}</option>
                <option value="user">{t("blog.admin.users.roleUser")}</option>
                <option value="admin">{t("blog.admin.users.roleAdmin")}</option>
                <option value="disabled">{t("blog.admin.users.roleDisabled")}</option>
              </select>
            </label>
            <label className="block text-xs font-medium text-muted-foreground">
              {t("blog.admin.users.filterMembership")}
              <select
                value={membershipFilter}
                onChange={(e) => setMembershipFilter(e.target.value as MembershipFilter)}
                className="mt-1.5 w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">{t("blog.admin.users.filterAll")}</option>
                <option value="member">{t("blog.admin.users.memberActive")}</option>
                <option value="free">{t("blog.admin.users.memberFree")}</option>
                <option value="expired">{t("blog.admin.users.memberExpired")}</option>
              </select>
            </label>
            <label className="block text-xs font-medium text-muted-foreground">
              {t("blog.admin.users.rowsPerPage")}
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number])}
                className="mt-1.5 w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </V4Panel>

        {error ? (
          <p className="rounded-xl border-2 border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <V4Panel>
          {loading ? (
            <p className="text-sm text-muted-foreground">{t("blog.admin.users.loading")}</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("blog.admin.users.empty")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2.5">{t("blog.admin.users.colEmail")}</th>
                    <th className="px-3 py-2.5">{t("blog.admin.users.colName")}</th>
                    <th className="px-3 py-2.5">{t("blog.admin.users.colRole")}</th>
                    <th className="px-3 py-2.5">{t("blog.admin.users.colMembership")}</th>
                    <th className="px-3 py-2.5">{t("blog.admin.users.colRegistered")}</th>
                    <th className="px-3 py-2.5">{t("blog.admin.users.colLastLogin")}</th>
                    <th className="px-3 py-2.5">{t("blog.admin.users.colKeys")}</th>
                    <th className="px-3 py-2.5">{t("blog.admin.users.colVerified")}</th>
                    <th className="px-3 py-2.5">{t("blog.admin.users.colRole")}</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((u) => {
                    const mState = membershipState(u);
                    const m = u.membership;
                    const keys = u.access_keys;
                    const isSelf = u.id === user.id;
                    return (
                      <tr key={u.id} className="border-b border-border align-top hover:bg-secondary/30">
                        <td className="px-3 py-3 font-mono text-xs">{u.email}</td>
                        <td className="px-3 py-3 text-xs text-foreground/80">{u.display_name ?? "—"}</td>
                        <td className="px-3 py-3">
                          <RoleBadge role={u.role} t={t} />
                        </td>
                        <td className="px-3 py-3">
                          <MembershipBadge state={mState} t={t} />
                          {mState === "member" && m?.membership_expires_at ? (
                            <div className="mt-1 text-[11px] text-muted-foreground">
                              {t("blog.admin.users.expiresOn")}: {formatDate(m.membership_expires_at)}
                              {m.days_remaining != null ? (
                                <span className="ml-1">
                                  · {t("blog.admin.users.daysLeft")} {m.days_remaining} {t("blog.admin.users.days")}
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                          {mState === "member" && m?.expiring_soon ? (
                            <div className="mt-0.5 text-[11px] font-medium text-amber-500">
                              {t("blog.admin.users.expiringSoon")}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                          {formatDate(u.created_at)}
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                          {u.last_login_at ? formatDate(u.last_login_at) : t("blog.admin.users.neverLogin")}
                        </td>
                        <td className="px-3 py-3 text-xs">
                          {keys && keys.total > 0 ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-mono">
                                {keys.total} · {t("blog.admin.users.activeLabel")} {keys.active} ·{" "}
                                {t("blog.admin.users.revokedLabel")} {keys.revoked}
                              </span>
                              {keys.latest_expires_at ? (
                                <span className="text-[11px] text-muted-foreground">
                                  {t("blog.admin.users.expiresOn")}: {formatDate(keys.latest_expires_at)}
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">{t("blog.admin.users.noKeys")}</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {u.email_verified ? (
                            <span className="inline-flex rounded-md border-2 border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                              {t("blog.admin.users.verified")}
                            </span>
                          ) : (
                            <span className="inline-flex rounded-md border-2 border-border bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                              {t("blog.admin.users.unverified")}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <select
                            value={u.role}
                            disabled={isSelf}
                            onChange={(e) => void patchRole(u.id, e.target.value as RoleOption)}
                            aria-label={`role-${u.email}`}
                            className="rounded-md border-2 border-border bg-background px-2 py-1 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                          >
                            <option value="user">{t("blog.admin.users.roleUser")}</option>
                            <option value="admin">{t("blog.admin.users.roleAdmin")}</option>
                            <option value="disabled">{t("blog.admin.users.roleDisabled")}</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="font-mono">
                  {currentPage} / {totalPages} · {filtered.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={cn(
                      "rounded-md border-2 border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary",
                      currentPage <= 1 && "opacity-50",
                    )}
                  >
                    {t("blog.admin.users.prev")}
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={cn(
                      "rounded-md border-2 border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary",
                      currentPage >= totalPages && "opacity-50",
                    )}
                  >
                    {t("blog.admin.users.next")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </V4Panel>
      </div>
    </V4StandaloneShell>
  );
}

function RoleBadge({
  role,
  t,
}: {
  role: string;
  t: (key: string, fallback?: string) => string;
}) {
  if (role === "admin") {
    return (
      <span className="inline-flex rounded-md border-2 border-primary/50 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
        {t("blog.admin.users.roleAdmin")}
      </span>
    );
  }
  if (role === "disabled") {
    return (
      <span className="inline-flex rounded-md border-2 border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
        {t("blog.admin.users.roleDisabled")}
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-md border-2 border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {t("blog.admin.users.roleUser")}
    </span>
  );
}

function MembershipBadge({
  state,
  t,
}: {
  state: "member" | "free" | "expired";
  t: (key: string, fallback?: string) => string;
}) {
  if (state === "member") {
    return (
      <span className="inline-flex rounded-md border-2 border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
        {t("blog.admin.users.memberActive")}
      </span>
    );
  }
  if (state === "expired") {
    return (
      <span className="inline-flex rounded-md border-2 border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
        {t("blog.admin.users.memberExpired")}
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-md border-2 border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {t("blog.admin.users.memberFree")}
    </span>
  );
}
