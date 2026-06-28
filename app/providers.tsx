"use client";

import { AuthProvider } from "@/lib/auth-context";
import { I18nProvider } from "@/lib/i18n/context";
import { NavVisibilityProvider } from "@/lib/nav-visibility-context";
import { V4ThemeProvider } from "@/components/v4/V4ThemeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <V4ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <I18nProvider>
        <AuthProvider>
          <NavVisibilityProvider>{children}</NavVisibilityProvider>
        </AuthProvider>
      </I18nProvider>
    </V4ThemeProvider>
  );
}
