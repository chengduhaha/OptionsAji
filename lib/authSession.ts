/** Sync JWT from localStorage into the HttpOnly cookie used by /admin middleware. */
export async function syncAuthSessionCookie(token: string): Promise<void> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    throw new Error("session_sync_failed");
  }
}

export async function clearAuthSessionCookie(): Promise<void> {
  await fetch("/api/auth/session", {
    method: "DELETE",
    credentials: "include",
  }).catch(() => {
    /* ignore */
  });
}
