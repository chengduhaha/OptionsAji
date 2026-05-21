"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useNavVisibility } from "@/lib/nav-visibility-context";
import { isPathAllowed } from "@/lib/nav-visibility";

export default function NavVisibilityGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { visibility, loading } = useNavVisibility();

  useEffect(() => {
    if (loading || isAdmin) return;
    if (!pathname) return;
    if (!isPathAllowed(pathname, visibility, false)) {
      router.replace("/");
    }
  }, [pathname, visibility, loading, isAdmin, router]);

  if (!loading && !isAdmin && pathname && !isPathAllowed(pathname, visibility, false)) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground text-[13px]">
        该功能暂未开放…
      </div>
    );
  }

  return <>{children}</>;
}
