"use client";

import V3LegalPageShell from "@/components/v3/V3LegalPageShell";
import V3LegalSections from "@/components/v3/V3LegalSections";

export default function RefundPage() {
  return (
    <V3LegalPageShell pageKey="refund">
      <V3LegalSections pageKey="refund" />
    </V3LegalPageShell>
  );
}
