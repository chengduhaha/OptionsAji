"use client";

import V3LegalPageShell from "@/components/v3/V3LegalPageShell";
import V3LegalSections from "@/components/v3/V3LegalSections";

export default function ContactPage() {
  return (
    <V3LegalPageShell pageKey="contact">
      <V3LegalSections pageKey="contact" />
    </V3LegalPageShell>
  );
}
