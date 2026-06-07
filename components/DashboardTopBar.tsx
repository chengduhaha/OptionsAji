"use client";

import LanguageToggle from "@/components/LanguageToggle";

export default function DashboardTopBar() {
  return (
    <div className="pointer-events-none absolute right-4 top-4 z-30 flex items-center justify-end">
      <div className="pointer-events-auto">
        <LanguageToggle variant="header" />
      </div>
    </div>
  );
}
