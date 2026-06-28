"use client";

import V3LegalPageShell from "@/components/v3/V3LegalPageShell";
import V3LegalSections from "@/components/v3/V3LegalSections";

export default function DisclaimerPage() {
  return (
    <V3LegalPageShell pageKey="disclaimer">
      <V3LegalSections pageKey="disclaimer" />
    </V3LegalPageShell>
  );
}
