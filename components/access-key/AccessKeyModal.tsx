"use client";

import { useState } from "react";
import { KeyRound, X } from "lucide-react";
import { AccessKeyForm } from "@/components/access-key/AccessKeyForm";

interface AccessKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  saveKey: (raw: string) => Promise<{ ok: boolean; error?: string }>;
}

export function AccessKeyModal({ open, onClose, onSaved, saveKey }: AccessKeyModalProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");

  if (!open) return null;

  const handleSave = async (raw: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await saveKey(raw);
      if (result.ok) {
        setMessage("Access Key 已启用");
        setMessageTone("success");
        onSaved();
        onClose();
        return;
      }
      setMessage(result.error ?? "校验失败");
      setMessageTone("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="关闭"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="access-key-modal-title"
        className="relative w-full max-w-md rounded-xl border border-glass-border bg-panel p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-foreground"
          aria-label="关闭弹窗"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 text-gold">
          <KeyRound className="h-5 w-5" />
          <h2 id="access-key-modal-title" className="text-lg font-semibold text-foreground">
            启用内部试用 Key
          </h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          如果你已有内部或线下试用 Access Key，可在此启用。正式 Pro 订阅请在个人中心通过 Creem 完成。
        </p>
        <div className="mt-5">
          <AccessKeyForm busy={busy} message={message} messageTone={messageTone} onSave={handleSave} />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full text-center text-[12px] text-muted-foreground hover:text-foreground"
        >
          稍后再说
        </button>
      </div>
    </div>
  );
}
