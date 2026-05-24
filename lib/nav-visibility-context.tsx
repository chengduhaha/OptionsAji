"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/lib/auth-context";
import {
  defaultNavVisibility,
  initialNavVisibilityForRole,
  type NavMenuId,
} from "@/lib/nav-visibility";

type NavVisibilityPayload = {
  visibility: Record<string, boolean>;
  known_ids?: string[];
  groups?: Record<string, string[]>;
};

type NavVisibilityContextValue = {
  visibility: Record<string, boolean>;
  loading: boolean;
  refresh: () => Promise<void>;
  isVisible: (menuId: NavMenuId | string) => boolean;
};

const NavVisibilityContext = createContext<NavVisibilityContextValue | null>(null);

export function NavVisibilityProvider({ children }: { children: React.ReactNode }) {
  const { token, ready, user } = useAuth();
  const [visibility, setVisibility] = useState<Record<string, boolean>>(() =>
    initialNavVisibilityForRole(null),
  );
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!token || !user) {
      setVisibility(initialNavVisibilityForRole(null));
      setLoading(false);
      return;
    }
    if (user.role === "admin") {
      setVisibility(defaultNavVisibility());
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/site/nav-visibility", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) {
        setVisibility(initialNavVisibilityForRole(user.role));
        return;
      }
      const data = (await res.json()) as NavVisibilityPayload;
      setVisibility({ ...defaultNavVisibility(), ...data.visibility });
    } catch {
      setVisibility(initialNavVisibilityForRole(user.role));
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (!ready) return;
    void refresh();
  }, [ready, refresh]);

  const value = useMemo<NavVisibilityContextValue>(
    () => ({
      visibility: loading && user?.role !== "admin" ? initialNavVisibilityForRole(user?.role) : visibility,
      loading,
      refresh,
      isVisible: (menuId) => {
        const effective =
          loading && user?.role !== "admin" ? initialNavVisibilityForRole(user?.role) : visibility;
        return effective[menuId] !== false;
      },
    }),
    [visibility, loading, refresh, user],
  );

  return (
    <NavVisibilityContext.Provider value={value}>{children}</NavVisibilityContext.Provider>
  );
}

export function useNavVisibility(): NavVisibilityContextValue {
  const ctx = useContext(NavVisibilityContext);
  if (!ctx) {
    return {
      visibility: defaultNavVisibility(),
      loading: false,
      refresh: async () => {},
      isVisible: () => true,
    };
  }
  return ctx;
}
