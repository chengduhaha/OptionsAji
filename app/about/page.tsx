"use client";

import V3LegalPageShell from "@/components/v3/V3LegalPageShell";
import V3LegalSections from "@/components/v3/V3LegalSections";

export default function AboutPage() {
  return (
    <V3LegalPageShell pageKey="about">
      <V3LegalSections pageKey="about" />
    </V3LegalPageShell>
  );
}
