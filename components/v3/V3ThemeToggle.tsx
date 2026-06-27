"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { useI18n } from "@/lib/i18n/context";

type Theme = "light" | "dark";

/**
 * Neo-Brutalist icon toggle for v3 shells. Light is default; persists to localStorage
 * (read before paint by the inline script in the root layout).
 */
export default function V3ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    setMounted(true);
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore storage failures */
    }
  }

  const isDark = mounted && theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t("v3.theme.switchToLight") : t("v3.theme.switchToDark")}
      title={isDark ? t("v3.theme.switchToLight") : t("v3.theme.switchToDark")}
      className="flex h-[26px] w-[26px] shrink-0 items-center justify-center border-2 border-ink bg-cream shadow-neo-sm transition-colors hover:bg-peach/40"
    >
      {isDark ? (
        <Sun className="h-3.5 w-3.5 text-ink" aria-hidden />
      ) : (
        <Moon className="h-3.5 w-3.5 text-ink" aria-hidden />
      )}
    </button>
  );
}
