import {
  OPTIONS_AJI_ACCESS_KEY_LS,
  buildMvpAccessHeaders,
  ensureMvpDeviceId,
} from "@/lib/access-key";

export type AccessKeyLifecycleStatus =
  | "active"
  | "pending"
  | "expired"
  | "revoked"
  | "invalid"
  | "device_mismatch"
  | "unknown";

export interface AccessKeyStatusData {
  valid: boolean;
  status: string;
  key_type: string;
  key_prefix: string;
  activated_at: string | null;
  expires_at: string | null;
  days_remaining: number | null;
  usage_count: number;
  is_activated: boolean;
}

export interface AccessKeyAdminRow {
  key_prefix: string;
  key_type: string;
  status: string;
  duration_days: number;
  expires_at: string | null;
  activated_at: string | null;
  is_activated: boolean;
  days_remaining: number | null;
  bound_email: string | null;
  bound_device_id: string | null;
  bound_user_id: string | null;
  max_devices: number;
  usage_count: number;
  last_used_at: string | null;
  note: string;
  created_at: string | null;
}

function parseDetailMessage(payload: unknown, statusCode?: number): string {
  if (statusCode === 404) {
    return "接口不存在（404）。请确认前端已部署 access-keys 代理且后端已更新 access-keys API。";
  }
  if (statusCode === 503) {
    return "后端未配置（缺少 OPTIONS_AJI_BACKEND_URL）。";
  }
  if (!payload || typeof payload !== "object") return "请求失败";
  const obj = payload as Record<string, unknown>;
  const detail = obj.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (detail && typeof detail === "object" && !Array.isArray(detail)) {
    const message = (detail as Record<string, unknown>).message;
    if (typeof message === "string" && message.trim()) return message;
    const code = (detail as Record<string, unknown>).code;
    if (code === "device_mismatch") return "Access Key 已绑定其他设备，请联系阿吉。";
    if (code === "access_key_expired") return "Access Key 已过期。";
    if (code === "access_key_revoked") return "Access Key 已停用。";
    if (code === "invalid_access_key") return "Access Key 无效。";
  }
  const error = obj.error;
  if (error && typeof error === "object" && !Array.isArray(error)) {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return "请求失败";
}

function lifecycleFromHttp(statusCode: number, payload: unknown): AccessKeyLifecycleStatus {
  if (statusCode === 402) return "expired";
  if (statusCode === 403) {
    const detail = (payload as Record<string, unknown>)?.detail;
    if (detail && typeof detail === "object" && !Array.isArray(detail)) {
      if ((detail as Record<string, unknown>).code === "device_mismatch") return "device_mismatch";
      return "revoked";
    }
    return "revoked";
  }
  if (statusCode === 401) return "invalid";
  return "unknown";
}

export function readStoredAccessKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(OPTIONS_AJI_ACCESS_KEY_LS)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function persistAccessKey(raw: string): void {
  if (typeof window === "undefined") return;
  const next = raw.trim();
  try {
    ensureMvpDeviceId(window.localStorage);
    if (next.length >= 8) {
      window.localStorage.setItem(OPTIONS_AJI_ACCESS_KEY_LS, next);
    } else {
      window.localStorage.removeItem(OPTIONS_AJI_ACCESS_KEY_LS);
    }
  } catch {
    /* ignore */
  }
}

export function statusLabelZh(status: AccessKeyLifecycleStatus): string {
  switch (status) {
    case "active":
      return "有效";
    case "pending":
      return "待激活（首次使用后开始计时）";
    case "expired":
      return "已过期";
    case "revoked":
      return "已停用";
    case "invalid":
      return "无效";
    case "device_mismatch":
      return "设备不匹配";
    default:
      return "未知";
  }
}

export async function fetchAccessKeyStatus(
  rawKey: string,
  token?: string | null,
): Promise<{ data: AccessKeyStatusData | null; lifecycle: AccessKeyLifecycleStatus; error?: string }> {
  const key = rawKey.trim();
  if (key.length < 8) {
    return { data: null, lifecycle: "invalid", error: "未设置 Access Key" };
  }
  const headers: Record<string, string> = {
    "X-Access-Key": key,
  };
  if (typeof window !== "undefined") {
    Object.assign(headers, buildMvpAccessHeaders(window.localStorage));
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch("/api/access-keys/status", {
    method: "POST",
    headers,
    cache: "no-store",
  });
  const payload = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!res.ok) {
    return {
      data: null,
      lifecycle: lifecycleFromHttp(res.status, payload),
      error: parseDetailMessage(payload),
    };
  }
  const data = payload?.data;
  if (!data || typeof data !== "object") {
    return { data: null, lifecycle: "unknown", error: "响应格式异常" };
  }
  const row = data as AccessKeyStatusData;
  const lifecycle =
    row.status === "active" || row.status === "pending" || row.status === "expired" || row.status === "revoked"
      ? (row.status as AccessKeyLifecycleStatus)
      : row.valid
        ? "active"
        : "unknown";
  return { data: row, lifecycle };
}

export function adminAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function adminListAccessKeys(
  token: string,
  query?: { limit?: number; status?: string; key_type?: string; bound_email?: string },
): Promise<AccessKeyAdminRow[]> {
  const qs = new URLSearchParams();
  if (query?.limit) qs.set("limit", String(query.limit));
  if (query?.status) qs.set("status", query.status);
  if (query?.key_type) qs.set("key_type", query.key_type);
  if (query?.bound_email) qs.set("bound_email", query.bound_email);
  const suffix = qs.toString() ? `?${qs}` : "";
  const res = await fetch(`/api/access-keys${suffix}`, {
    headers: adminAuthHeaders(token),
    cache: "no-store",
  });
  const payload = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!res.ok) throw new Error(parseDetailMessage(payload, res.status));
  const data = payload?.data;
  return Array.isArray(data) ? (data as AccessKeyAdminRow[]) : [];
}

export async function adminCreateAccessKey(
  token: string,
  body: { key_type: string; duration_days: number; note?: string; max_devices?: number },
): Promise<{ raw_key: string; data: AccessKeyAdminRow }> {
  const res = await fetch("/api/access-keys", {
    method: "POST",
    headers: adminAuthHeaders(token),
    body: JSON.stringify(body),
  });
  const payload = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!res.ok) throw new Error(parseDetailMessage(payload, res.status));
  return {
    raw_key: String(payload?.raw_key ?? ""),
    data: payload?.data as AccessKeyAdminRow,
  };
}

export async function adminExtendAccessKey(
  token: string,
  keyPrefix: string,
  days: number,
): Promise<AccessKeyAdminRow> {
  const res = await fetch(`/api/access-keys/${encodeURIComponent(keyPrefix)}/extend`, {
    method: "POST",
    headers: adminAuthHeaders(token),
    body: JSON.stringify({ days }),
  });
  const payload = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!res.ok) throw new Error(parseDetailMessage(payload, res.status));
  return payload?.data as AccessKeyAdminRow;
}

export async function adminRevokeAccessKey(token: string, keyPrefix: string): Promise<void> {
  const res = await fetch(`/api/access-keys/${encodeURIComponent(keyPrefix)}/revoke`, {
    method: "POST",
    headers: adminAuthHeaders(token),
  });
  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    throw new Error(parseDetailMessage(payload, res.status));
  }
}

export async function adminUnbindAccessKeyDevice(token: string, keyPrefix: string): Promise<void> {
  const res = await fetch(`/api/access-keys/${encodeURIComponent(keyPrefix)}/unbind-device`, {
    method: "POST",
    headers: adminAuthHeaders(token),
  });
  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    throw new Error(parseDetailMessage(payload, res.status));
  }
}

export async function adminPatchAccessKey(
  token: string,
  keyPrefix: string,
  body: { note?: string; expires_at?: string; duration_days?: number },
): Promise<AccessKeyAdminRow> {
  const res = await fetch(`/api/access-keys/${encodeURIComponent(keyPrefix)}`, {
    method: "PATCH",
    headers: adminAuthHeaders(token),
    body: JSON.stringify(body),
  });
  const payload = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!res.ok) throw new Error(parseDetailMessage(payload, res.status));
  return payload?.data as AccessKeyAdminRow;
}

export async function adminDeleteAccessKey(token: string, keyPrefix: string): Promise<void> {
  const res = await fetch(`/api/access-keys/${encodeURIComponent(keyPrefix)}`, {
    method: "DELETE",
    headers: adminAuthHeaders(token),
  });
  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    throw new Error(parseDetailMessage(payload, res.status));
  }
}
