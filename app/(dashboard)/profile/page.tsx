"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, UserCircle } from "lucide-react";
import { AccessKeyForm } from "@/components/access-key/AccessKeyForm";
import { useAccessKey } from "@/hooks/useAccessKey";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { OPTIONS_AJI_API_KEY_LS, type AlertContract } from "@/lib/contracts";
import { formatMessage } from "@/lib/i18n/dictionary";
import { useI18n } from "@/lib/i18n/context";
import { apiFetch } from "@/lib/apiBase";

type CreemStatusPayload = {
  tier?: string;
  source?: string;
  provider?: string | null;
  provider_status?: string | null;
  current_period_end_utc?: string | null;
  in_grace_period?: boolean;
  creem_active?: boolean;
};

export default function ProfilePage() {
  const { t } = useI18n();
  const { user, ready, token, refreshMe, loading: authLoading, isAdmin } = useAuth();
  const canManageIntegrations = user?.role === "admin";
  const {
    hasAccessKey,
    statusLabel,
    daysRemaining,
    statusError,
    statusLoading,
    saveKey,
    clearKey,
    refreshStatus,
  } = useAccessKey(token, { isAdmin });
  const [accessKeyMsg, setAccessKeyMsg] = useState<string | null>(null);
  const [accessKeyMsgTone, setAccessKeyMsgTone] = useState<"success" | "error">("success");
  const [accessKeyBusy, setAccessKeyBusy] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [wlSymbols, setWlSymbols] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<AlertContract[]>([]);
  const [wlBusy, setWlBusy] = useState(false);
  const [wlMsg, setWlMsg] = useState<string | null>(null);
  const [alertsMsg, setAlertsMsg] = useState<string | null>(null);
  const [newSym, setNewSym] = useState("");
  const [alertType, setAlertType] = useState("resonance");
  const [alertSymbol, setAlertSymbol] = useState("SPY");
  const [alertThreshold, setAlertThreshold] = useState("70");
  const [meBusy, setMeBusy] = useState(false);
  const [creemStatus, setCreemStatus] = useState<CreemStatusPayload | null>(null);
  const [creemBusy, setCreemBusy] = useState(false);
  const [creemMsg, setCreemMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(OPTIONS_AJI_API_KEY_LS);
      if (v) setApiKey(v);
    } catch {
      /* ignore */
    }
  }, []);

  const loadIntegration = useCallback(async () => {
    if (!canManageIntegrations) {
      setWlSymbols([]);
      setAlerts([]);
      return;
    }
    const key = apiKey.trim();
    if (key.length < 8) {
      setWlSymbols([]);
      setAlerts([]);
      return;
    }
    setWlBusy(true);
    setWlMsg(null);
    setAlertsMsg(null);
    try {
      const [wl, al] = await Promise.all([api.watchlist.get(key), api.alerts.list(key)]);
      setWlSymbols(wl.symbols);
      setAlerts(al.data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("profile.loadFailed");
      setWlMsg(msg);
    } finally {
      setWlBusy(false);
    }
  }, [apiKey, canManageIntegrations, t]);

  useEffect(() => {
    void loadIntegration();
  }, [loadIntegration]);

  const refreshCreemStatus = useCallback(async () => {
    if (!token || !user) {
      setCreemStatus(null);
      return;
    }
    try {
      const res = await apiFetch("/api/creem/status", {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as CreemStatusPayload;
      if (!res.ok) throw new Error(t("profile.subscriptionReadFailed"));
      setCreemStatus(data);
    } catch (e) {
      setCreemStatus(null);
      setCreemMsg(e instanceof Error ? e.message : t("profile.subscriptionReadFailed"));
    }
  }, [token, user, t]);

  useEffect(() => {
    void refreshCreemStatus();
  }, [refreshCreemStatus]);

  const persistKey = (raw: string) => {
    const v = raw.trim();
    setApiKey(v);
    try {
      if (v.length >= 8) window.localStorage.setItem(OPTIONS_AJI_API_KEY_LS, v);
      else window.localStorage.removeItem(OPTIONS_AJI_API_KEY_LS);
    } catch {
      /* ignore */
    }
  };

  const addWatch = async () => {
    const sym = newSym.trim().toUpperCase();
    const key = apiKey.trim();
    if (!sym || key.length < 8) {
      setWlMsg(t("profile.addWatchlistNeedKey"));
      return;
    }
    setWlBusy(true);
    setWlMsg(null);
    try {
      await api.watchlist.add(sym, key);
      setNewSym("");
      await loadIntegration();
    } catch (e) {
      setWlMsg(e instanceof Error ? e.message : t("profile.addFailed"));
    } finally {
      setWlBusy(false);
    }
  };

  const removeWatch = async (sym: string) => {
    const key = apiKey.trim();
    if (key.length < 8) return;
    setWlBusy(true);
    setWlMsg(null);
    try {
      await api.watchlist.remove(sym, key);
      await loadIntegration();
    } catch (e) {
      setWlMsg(e instanceof Error ? e.message : t("profile.removeFailed"));
    } finally {
      setWlBusy(false);
    }
  };

  const createAlert = async () => {
    const key = apiKey.trim();
    if (key.length < 8) {
      setAlertsMsg(t("profile.saveKeyFirst"));
      return;
    }
    const sym = alertSymbol.trim().toUpperCase();
    const th = Number(alertThreshold);
    setAlertsMsg(null);
    try {
      await api.alerts.create({
        api_key: key,
        alert_type: alertType,
        symbol: sym,
        threshold: Number.isFinite(th) ? th : null,
      });
      setAlertSymbol(sym);
      await loadIntegration();
      setAlertsMsg(t("profile.alertCreated"));
    } catch (e) {
      setAlertsMsg(e instanceof Error ? e.message : t("profile.createFailed"));
    }
  };

  const handleRefreshMe = async () => {
    if (!token) return;
    setMeBusy(true);
    try {
      await refreshMe();
    } finally {
      setMeBusy(false);
    }
  };

  const startCreemCheckout = async () => {
    if (!token) return;
    setCreemBusy(true);
    setCreemMsg(null);
    try {
      const res = await apiFetch("/api/creem/checkout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { url?: string; detail?: { message?: string } | string };
      if (!res.ok) {
        const message = typeof data.detail === "string" ? data.detail : data.detail?.message;
        throw new Error(message || t("profile.checkoutFailed"));
      }
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setCreemMsg(e instanceof Error ? e.message : t("profile.checkoutFailed"));
    } finally {
      setCreemBusy(false);
    }
  };

  const openCreemPortal = async () => {
    if (!token) return;
    setCreemBusy(true);
    setCreemMsg(null);
    try {
      const res = await apiFetch("/api/creem/portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { url?: string; detail?: { message?: string } | string };
      if (!res.ok) {
        const message = typeof data.detail === "string" ? data.detail : data.detail?.message;
        throw new Error(message || t("profile.portalUnavailable"));
      }
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setCreemMsg(e instanceof Error ? e.message : t("profile.portalUnavailable"));
    } finally {
      setCreemBusy(false);
    }
  };

  if (!ready || authLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground gap-2 text-[13px]">
        <Loader2 className="w-4 h-4 animate-spin" />
        {t("profile.loadingSession")}
      </div>
    );
  }

  return (
    <div className="mx-auto h-full max-w-4xl space-y-6 overflow-y-auto p-6 md:p-8">
      <header className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <UserCircle className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="heading-1 text-foreground">{t("profile.title")}</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {t("profile.subtitle")}
          </p>
        </div>
      </header>

      {!user ? (
        <section className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3 text-[13px]">
          <p className="text-foreground/95 leading-relaxed">
            {t("profile.loginPrompt")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login?next=/profile"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-95"
            >
              {t("profile.login")}
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-border text-[13px] hover:border-primary/30"
            >
              {t("profile.register")}
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-[13px] font-semibold text-foreground flex items-center justify-between gap-2">
            {t("profile.accountSummary")}
            <button
              type="button"
              onClick={() => void handleRefreshMe()}
              disabled={meBusy}
              className="text-[11px] text-primary hover:underline disabled:opacity-50"
            >
              {meBusy ? t("profile.refreshing") : t("profile.refreshMe")}
            </button>
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] font-mono">
            <div>
              <dt className="text-muted-foreground text-[10px] uppercase tracking-wide">Email</dt>
              <dd className="text-foreground truncate" title={user.email}>
                {user.email}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-[10px] uppercase tracking-wide">{t("profile.displayName")}</dt>
              <dd className="text-foreground">{user.display_name ?? "—"}</dd>
            </div>
            {canManageIntegrations ? (
              <div>
                <dt className="text-muted-foreground text-[10px] uppercase tracking-wide">{t("profile.role")}</dt>
                <dd className="text-foreground">{user.role}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-muted-foreground text-[10px] uppercase tracking-wide">{t("profile.emailVerified")}</dt>
              <dd className="text-foreground">{user.email_verified ? t("profile.verified") : t("profile.unverified")}</dd>
            </div>
          </dl>
        </section>
      )}

      {user ? (
        <section className="rounded-2xl border border-primary/30 bg-primary/[0.06] p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[13px] font-semibold text-foreground">{t("profile.subscription")}</h2>
            <button
              type="button"
              onClick={() => void refreshCreemStatus()}
              disabled={creemBusy}
              className="text-[11px] text-primary hover:underline disabled:opacity-50"
            >
              {t("profile.refreshStatus")}
            </button>
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            {t("profile.subscriptionNote")}
          </p>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[12px]">
            <div>
              <dt className="text-muted-foreground text-[10px] uppercase tracking-wide">{t("profile.entitlement")}</dt>
              <dd className="text-foreground font-mono">{creemStatus?.tier ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-[10px] uppercase tracking-wide">{t("profile.source")}</dt>
              <dd className="text-foreground font-mono">{creemStatus?.source ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-[10px] uppercase tracking-wide">{t("profile.status")}</dt>
              <dd className="text-foreground font-mono">{creemStatus?.provider_status ?? "—"}</dd>
            </div>
          </dl>
          {creemStatus?.current_period_end_utc ? (
            <p className="text-[11px] text-muted-foreground">
              {formatMessage(t("profile.periodEnd"), {
                date: new Date(creemStatus.current_period_end_utc).toLocaleString(),
              })}
            </p>
          ) : null}
          {creemMsg ? <p className="text-[12px] text-gold whitespace-pre-wrap">{creemMsg}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void startCreemCheckout()}
              disabled={creemBusy}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium disabled:opacity-50"
            >
              {creemBusy ? t("profile.processing") : t("profile.upgradePro")}
            </button>
            <button
              type="button"
              onClick={() => void openCreemPortal()}
              disabled={creemBusy}
              className="px-4 py-2 rounded-lg border border-primary/30 text-primary text-[12px] font-medium hover:bg-primary/10 disabled:opacity-50"
            >
              {t("profile.manageSubscription")}
            </button>
            <Link
              href="/refund"
              className="px-4 py-2 rounded-lg border border-border text-[12px] text-muted-foreground hover:text-foreground"
            >
              {t("profile.refundPolicy")}
            </Link>
          </div>
        </section>
      ) : null}

      {user && (isAdmin || hasAccessKey) ? (
        <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[13px] font-semibold text-foreground">{t("profile.accessKeyTitle")}</h2>
            <button
              type="button"
              onClick={() => void refreshStatus()}
              disabled={statusLoading}
              className="text-[11px] text-primary hover:underline disabled:opacity-50"
            >
              {statusLoading ? t("profile.validating") : t("profile.refreshStatus")}
            </button>
          </div>
          {isAdmin ? (
            <p className="text-[12px] text-green leading-relaxed">
              {t("profile.adminNoKey")}
            </p>
          ) : null}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
            <div>
              <dt className="text-muted-foreground text-[10px] uppercase tracking-wide">{t("profile.keySet")}</dt>
              <dd className="text-foreground">{isAdmin ? t("profile.adminExempt") : hasAccessKey ? t("profile.yes") : t("profile.no")}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-[10px] uppercase tracking-wide">{t("profile.keyStatus")}</dt>
              <dd className="text-foreground">{hasAccessKey ? statusLabel : t("profile.notSet")}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-[10px] uppercase tracking-wide">{t("profile.daysRemaining")}</dt>
              <dd className="text-foreground font-mono">
                {daysRemaining !== null ? formatMessage(t("profile.days"), { count: daysRemaining }) : "—"}
              </dd>
            </div>
          </dl>
          {statusError ? <p className="text-[12px] text-red">{statusError}</p> : null}
          {isAdmin ? (
            <AccessKeyForm
              busy={accessKeyBusy}
              message={accessKeyMsg}
              messageTone={accessKeyMsgTone}
              submitLabel={t("profile.saveAndValidate")}
              onSave={async (raw) => {
                setAccessKeyBusy(true);
                setAccessKeyMsg(null);
                const result = await saveKey(raw);
                setAccessKeyBusy(false);
                if (result.ok) {
                  setAccessKeyMsg(t("profile.keyEnabled"));
                  setAccessKeyMsgTone("success");
                } else {
                  setAccessKeyMsg(result.error ?? t("profile.validateFailed"));
                  setAccessKeyMsgTone("error");
                }
              }}
            />
          ) : null}
          {hasAccessKey ? (
            <button
              type="button"
              onClick={() => {
                clearKey();
                setAccessKeyMsg(t("profile.keyCleared"));
                setAccessKeyMsgTone("success");
              }}
              className="text-[12px] text-muted-foreground hover:text-red"
            >
              {t("profile.clearKey")}
            </button>
          ) : null}
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t("profile.accessKeyNote")}
          </p>
        </section>
      ) : null}

      {canManageIntegrations ? (
        <>
          <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h2 className="text-[13px] font-semibold text-foreground">{t("profile.integrationKey")}</h2>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {formatMessage(t("profile.integrationNote"), { storageKey: OPTIONS_AJI_API_KEY_LS })}
            </p>
            <input
              value={apiKey}
              onChange={(e) => persistKey(e.target.value)}
              placeholder={t("profile.apiKeyPlaceholder")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] font-mono"
            />
            <button
              type="button"
              onClick={() => void loadIntegration()}
              disabled={wlBusy}
              className="text-[12px] px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 disabled:opacity-50"
            >
              {t("profile.reloadWatchlist")}
            </button>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[13px] font-semibold text-foreground">{t("profile.watchlist")}</h2>
          {wlBusy ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : null}
        </div>
        {wlMsg ? <p className="text-[12px] text-red">{wlMsg}</p> : null}
        <div className="flex flex-wrap gap-2">
          <input
            value={newSym}
            onChange={(e) => setNewSym(e.target.value.toUpperCase())}
            placeholder={t("profile.symbolPlaceholder")}
            className="flex-1 min-w-[120px] rounded-lg border border-border bg-background px-3 py-2 text-[13px] font-mono uppercase"
          />
          <button
            type="button"
            onClick={() => void addWatch()}
            disabled={wlBusy}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium disabled:opacity-50"
          >
            {t("profile.add")}
          </button>
        </div>
        {wlSymbols.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">{t("profile.watchlistEmpty")}</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {wlSymbols.map((s) => (
              <li
                key={s}
                className="flex items-center gap-1 pl-2 pr-1 py-1 rounded-lg surface-1 border border-border text-[12px] font-mono"
              >
                <Link href={`/stock/${s}/overview`} className="text-primary hover:underline">
                  {s}
                </Link>
                <button
                  type="button"
                  onClick={() => void removeWatch(s)}
                  disabled={wlBusy}
                  className="text-[11px] text-red px-1.5 py-0.5 rounded hover:bg-red/10 disabled:opacity-50"
                  aria-label={`Remove ${s}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h2 className="text-[13px] font-semibold text-foreground">{t("profile.alerts")}</h2>
        {alertsMsg ? (
          <p
            className={`text-[12px] ${alertsMsg === t("profile.alertCreated") ? "text-green" : "text-red"}`}
          >
            {alertsMsg}
          </p>
        ) : null}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
          <label className="space-y-1 block">
            <span className="text-[10px] text-muted-foreground uppercase">{t("profile.alertType")}</span>
            <input
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-2 py-1.5 font-mono"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-[10px] text-muted-foreground uppercase">{t("profile.alertSymbol")}</span>
            <input
              value={alertSymbol}
              onChange={(e) => setAlertSymbol(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-border bg-background px-2 py-1.5 font-mono uppercase"
            />
          </label>
          <label className="space-y-1 block sm:col-span-2">
            <span className="text-[10px] text-muted-foreground uppercase">{t("profile.alertThreshold")}</span>
            <input
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-2 py-1.5 font-mono"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => void createAlert()}
          className="px-4 py-2 rounded-lg border border-accent/40 text-accent text-[12px] font-medium hover:bg-accent/10"
        >
          {t("profile.createAlert")}
        </button>
        {alerts.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">{t("profile.noAlerts")}</p>
        ) : (
          <ul className="space-y-1.5 max-h-48 overflow-y-auto text-[12px] font-mono">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap gap-x-3 gap-y-0.5 border-b border-border/60 pb-1.5"
              >
                <span className="text-foreground">{a.symbol}</span>
                <span className="text-muted-foreground">{a.alert_type}</span>
                {typeof a.threshold === "number" ? (
                  <span className="text-muted-foreground">threshold {a.threshold}</span>
                ) : null}
                <span className="text-[10px] text-muted-foreground">{a.created_at}</span>
              </li>
            ))}
          </ul>
        )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-semibold text-foreground">{t("profile.more")}</h2>
          <p className="text-[11px] text-muted-foreground mt-1">
            {t("profile.moreNote")}
          </p>
        </div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 self-start sm:self-center px-4 py-2 rounded-lg bg-primary/10 border border-primary/25 text-primary text-[12px] font-medium hover:bg-primary/15"
        >
          {t("profile.goSettings")}
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </Link>
          </section>
        </>
      ) : null}
    </div>
  );
}
