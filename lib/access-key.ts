export const OPTIONS_AJI_ACCESS_KEY_LS = "optionsaji_access_key";
export const OPTIONS_AJI_DEVICE_ID_LS = "optionsaji_device_id";

function fallbackId(): string {
  return `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

export function ensureMvpDeviceId(
  storage: Storage,
  createId: () => string = () =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : fallbackId(),
): string {
  const existing = storage.getItem(OPTIONS_AJI_DEVICE_ID_LS)?.trim();
  if (existing) return existing;
  const next = createId();
  storage.setItem(OPTIONS_AJI_DEVICE_ID_LS, next);
  return next;
}

export function buildMvpAccessHeaders(storage?: Storage): Record<string, string> {
  if (!storage) {
    if (typeof window === "undefined") return {};
    storage = window.localStorage;
  }
  const accessKey = storage.getItem(OPTIONS_AJI_ACCESS_KEY_LS)?.trim() ?? "";
  if (!accessKey) return {};
  return {
    "X-Access-Key": accessKey,
    "X-Device-Id": ensureMvpDeviceId(storage),
  };
}

/** MVP 请求头：Access Key + 可选 JWT（admin 免 Key 时仅靠 Bearer）。 */
export function buildMvpRequestHeaders(
  storage?: Storage,
  authToken?: string | null,
): Record<string, string> {
  const headers: Record<string, string> = { ...buildMvpAccessHeaders(storage) };
  const token = authToken?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}
