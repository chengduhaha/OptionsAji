"use client";

import { AuthProvider } from "@/lib/auth-context";
import { NavVisibilityProvider } from "@/lib/nav-visibility-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NavVisibilityProvider>{children}</NavVisibilityProvider>
    </AuthProvider>
  );
}
