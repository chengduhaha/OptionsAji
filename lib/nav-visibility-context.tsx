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
import { defaultNavVisibility, type NavMenuId } from "@/lib/nav-visibility";

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
  const [visibility, setVisibility] = useState<Record<string, boolean>>(defaultNavVisibility);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!token || !user) {
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
        setVisibility(defaultNavVisibility());
        return;
      }
      const data = (await res.json()) as NavVisibilityPayload;
      setVisibility({ ...defaultNavVisibility(), ...data.visibility });
    } catch {
      setVisibility(defaultNavVisibility());
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
      visibility,
      loading,
      refresh,
      isVisible: (menuId) => visibility[menuId] !== false,
    }),
    [visibility, loading, refresh],
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
