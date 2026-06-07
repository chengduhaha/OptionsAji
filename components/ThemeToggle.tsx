"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

type Theme = "light" | "dark";

/**
 * Light is the default theme. Clicking toggles `.dark` on <html> and persists
 * the choice to localStorage (read back before paint by the inline script in
 * the root layout, so there is no flash on reload).
 */
export default function ThemeToggle() {
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
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore storage failures (private mode, etc.) */
    }
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t("theme.switchToLight") : t("theme.switchToDark")}
      title={isDark ? t("theme.switchToLight") : t("theme.switchToDark")}
      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-glass-border bg-glass py-2 text-[11px] text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
    >
      {/* Render a stable label until mounted to avoid hydration mismatch. */}
      {!mounted ? (
        <>
          <Sun className="h-3 w-3" />
          {t("theme.label")}
        </>
      ) : isDark ? (
        <>
          <Sun className="h-3 w-3" />
          {t("theme.light")}
        </>
      ) : (
        <>
          <Moon className="h-3 w-3" />
          {t("theme.dark")}
        </>
      )}
    </button>
  );
}
