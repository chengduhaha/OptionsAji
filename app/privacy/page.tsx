"use client";

import V3LegalPageShell from "@/components/v3/V3LegalPageShell";
import V3LegalSections from "@/components/v3/V3LegalSections";

export default function PrivacyPage() {
  return (
    <V3LegalPageShell pageKey="privacy">
      <V3LegalSections pageKey="privacy" />
    </V3LegalPageShell>
  );
}
