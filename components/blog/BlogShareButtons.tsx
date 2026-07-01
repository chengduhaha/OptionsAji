"use client";

import { Check, Copy, Link2, MessageCircle, Send, Share2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  blogPostCanonicalUrl,
  buildSocialShareUrl,
  buildWeChatQrImageUrl,
  canUseNativeShare,
} from "@/lib/blog/share";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type BlogShareButtonsProps = {
  slug: string;
  title: string;
  className?: string;
};

type ToastVariant = "default" | "wechat";

type ToastState = {
  message: string;
  variant?: ToastVariant;
} | null;

const iconButtonClass =
  "inline-flex size-9 items-center justify-center border-2 border-foreground bg-card text-foreground shadow-neo-sm transition-transform hover:-translate-x-px hover:-translate-y-px disabled:opacity-60";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.126 0 2.062 2.062 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function BlogShareButtons({ slug, title, className }: BlogShareButtonsProps) {
  const { t } = useI18n();
  const [toast, setToast] = useState<ToastState>(null);
  const [copied, setCopied] = useState(false);
  const [wechatOpen, setWechatOpen] = useState(false);
  const [nativeShareAvailable, setNativeShareAvailable] = useState(false);

  const shareUrl = blogPostCanonicalUrl(slug);
  const qrImageUrl = buildWeChatQrImageUrl(shareUrl);

  useEffect(() => {
    setNativeShareAvailable(canUseNativeShare());
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const copyLink = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      return false;
    }
  }, [shareUrl]);

  const showToast = useCallback((message: string, variant: ToastVariant = "default") => {
    setToast({ message, variant });
  }, []);

  const handleCopyLink = useCallback(async () => {
    const ok = await copyLink();
    if (ok) showToast(t("blog.article.share.linkCopied"));
  }, [copyLink, showToast, t]);

  const handleWeChat = useCallback(async () => {
    const ok = await copyLink();
    if (ok) {
      showToast(t("blog.article.share.wechatHint"), "wechat");
      setWechatOpen(true);
    }
  }, [copyLink, showToast, t]);

  const handleNativeShare = useCallback(async () => {
    if (!canUseNativeShare()) return;
    try {
      await navigator.share({ title, url: shareUrl, text: title });
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }, [shareUrl, title]);

  const openSocial = useCallback(
    (platform: "twitter" | "linkedin" | "telegram") => {
      const href = buildSocialShareUrl(platform, shareUrl, title);
      window.open(href, "_blank", "noopener,noreferrer");
    },
    [shareUrl, title],
  );

  return (
    <>
      <TooltipProvider delayDuration={200}>
        <div className={cn("flex flex-col items-end gap-2", className)}>
          <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {t("blog.article.share.label")}
          </span>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => void handleCopyLink()}
                  className={iconButtonClass}
                  aria-label={t("blog.article.share.copyLink")}
                >
                  {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {t("blog.article.share.copyLink")}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => openSocial("twitter")}
                  className={iconButtonClass}
                  aria-label={t("blog.article.share.twitter")}
                >
                  <XIcon className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {t("blog.article.share.twitter")}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => void handleWeChat()}
                  className={iconButtonClass}
                  aria-label={t("blog.article.share.wechat")}
                >
                  <MessageCircle className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {t("blog.article.share.wechat")}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => openSocial("linkedin")}
                  className={iconButtonClass}
                  aria-label={t("blog.article.share.linkedin")}
                >
                  <LinkedInIcon className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {t("blog.article.share.linkedin")}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => openSocial("telegram")}
                  className={iconButtonClass}
                  aria-label={t("blog.article.share.telegram")}
                >
                  <Send className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {t("blog.article.share.telegram")}
              </TooltipContent>
            </Tooltip>

            {nativeShareAvailable ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => void handleNativeShare()}
                    className={cn(iconButtonClass, "border-primary bg-primary/10 text-primary")}
                    aria-label={t("blog.article.share.nativeShare")}
                  >
                    <Share2 className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {t("blog.article.share.nativeShare")}
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        </div>
      </TooltipProvider>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-50 max-w-[min(92vw,24rem)] -translate-x-1/2 border-2 border-foreground bg-card px-4 py-3 text-center text-sm font-bold shadow-neo"
        >
          {toast.message}
        </div>
      ) : null}

      {wechatOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wechat-share-title"
          onClick={() => setWechatOpen(false)}
        >
          <div
            className="relative w-full max-w-sm border-2 border-foreground bg-card p-6 shadow-neo"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setWechatOpen(false)}
              className="absolute right-3 top-3 inline-flex size-8 items-center justify-center border-2 border-foreground bg-background shadow-neo-sm"
              aria-label={t("blog.article.share.close")}
            >
              <X className="size-4" />
            </button>
            <h2 id="wechat-share-title" className="pr-10 font-heading text-lg font-black">
              {t("blog.article.share.qrTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("blog.article.share.qrHint")}</p>
            <div className="mt-5 flex justify-center border-2 border-foreground bg-background p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImageUrl}
                alt={t("blog.article.share.qrAlt")}
                width={220}
                height={220}
                className="size-[220px]"
              />
            </div>
            <button
              type="button"
              onClick={() => void handleCopyLink()}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 border-2 border-foreground bg-foreground px-4 py-2.5 text-sm font-bold text-background shadow-neo-sm transition-transform hover:-translate-x-px hover:-translate-y-px dark:bg-primary dark:text-primary-foreground"
            >
              <Copy className="size-4" />
              {t("blog.article.share.copyLink")}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
