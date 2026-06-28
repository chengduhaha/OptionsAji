"use client";

import V3GexDashboard from "@/components/v3/V3GexDashboard";

/** GEX data/charts reuse v3 logic; outer shell is V4OptionsShell from layout. */
export default function V4GexDashboard() {
  return <V3GexDashboard embedded />;
}
