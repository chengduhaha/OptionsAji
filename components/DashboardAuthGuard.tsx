"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";

const PUBLIC_DASHBOARD_PREFIXES = ["/", "/profile"];

function isPublicDashboardPath(path: string | null): boolean {
  if (!path) return false;
  return PUBLIC_DASHBOARD_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

export default function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const { ready, user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (user) return;
    if (isPublicDashboardPath(pathname)) return;
    const qs = new URLSearchParams();
    qs.set("next", pathname || "/");
    router.replace(`/login?${qs.toString()}`);
  }, [ready, user, router, pathname]);

  if (!ready) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background text-muted-foreground text-[13px]">
        {t("shell.loadingSession")}
      </div>
    );
  }

  if (!user && isPublicDashboardPath(pathname)) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background text-muted-foreground text-[13px]">
        {t("shell.redirectLogin")}
      </div>
    );
  }

  return children;
}
