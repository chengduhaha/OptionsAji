"use client";

import { useState } from "react";

interface AccessKeyFormProps {
  initialValue?: string;
  busy?: boolean;
  message?: string | null;
  messageTone?: "success" | "error";
  submitLabel?: string;
  onSave: (key: string) => void | Promise<void>;
}

export function AccessKeyForm({
  initialValue = "",
  busy = false,
  message = null,
  messageTone = "success",
  submitLabel = "保存",
  onSave,
}: AccessKeyFormProps) {
  const [draft, setDraft] = useState(initialValue);

  return (
    <div className="space-y-3">
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="输入 Access Key"
        type="password"
        autoComplete="off"
        className="w-full h-10 rounded-lg border border-border2 bg-background/80 px-3 font-mono text-xs text-foreground outline-none transition focus:border-gold/50"
      />
      <button
        type="button"
        disabled={busy || draft.trim().length < 8}
        onClick={() => void onSave(draft.trim())}
        className="inline-flex h-10 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 px-4 text-sm font-medium text-gold transition hover:bg-gold/15 disabled:opacity-50"
      >
        {busy ? "校验中…" : submitLabel}
      </button>
      {message ? (
        <p className={`text-[12px] ${messageTone === "error" ? "text-red" : "text-green"}`}>{message}</p>
      ) : null}
    </div>
  );
}
