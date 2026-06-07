"use client";

import { AuthProvider } from "@/lib/auth-context";
import { I18nProvider } from "@/lib/i18n/context";
import { NavVisibilityProvider } from "@/lib/nav-visibility-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <NavVisibilityProvider>{children}</NavVisibilityProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
