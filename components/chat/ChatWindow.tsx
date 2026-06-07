"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Plus, RefreshCw, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import MessageBubble from "./MessageBubble";
import { runAgentViaSseStream, type AgentChatMessage } from "@/lib/agentSse";
import { formatMessage } from "@/lib/i18n/dictionary";
import { useI18n } from "@/lib/i18n/context";

type Message = AgentChatMessage;

const TICKERS = ["SPY", "QQQ", "AAPL", "TSLA", "NVDA", "AMZN", "MSFT", "META", "GOOGL"];

function readOptionalBearerToken(): string | null {
  const fromPublicEnv = process.env.NEXT_PUBLIC_AGENT_BEARER?.trim();
  if (fromPublicEnv) {
    return fromPublicEnv;
  }
  if (typeof window === "undefined") return null;
  return (
    window.localStorage.getItem("optionsaji_subscription_token")?.trim() ??
    window.localStorage.getItem("optionsaji_api_key")?.trim() ??
    null
  );
}

export default function ChatWindow() {
  const { locale, t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticker, setTicker] = useState("SPY");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sessionRef = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
    };
    const thinkingMsg: Message = {
      id: Date.now().toString() + "-think",
      role: "assistant",
      content: "",
      thinking: true,
      thinkingLines: [],
    };

    setMessages((prev) => [...prev, userMsg, thinkingMsg]);
    setInput("");
    setLoading(true);

    try {
      await runAgentViaSseStream({
        question,
        ticker,
        locale,
        bearerToken: readOptionalBearerToken(),
        thinkingMsgId: thinkingMsg.id,
        setMessages,
        sessionRef,
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingMsg.id
            ? { ...m, content: t("chat.networkError"), thinking: false }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const newChat = () => {
    setMessages([]);
    setInput("");
    sessionRef.current = crypto.randomUUID();
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-3 border-b border-glass-border glass flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted uppercase tracking-wider">{t("chat.ticker")}</span>
            <select
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="bg-glass border border-glass-border text-foreground text-[13px] px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-primary/50 cursor-pointer transition-all hover:border-primary/30"
            >
              {TICKERS.map((t) => (
                <option key={t} value={t} className="bg-background">{t}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={newChat}
              aria-label={t("chat.newChat")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg glass-subtle text-[12px] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              {t("chat.newChat")}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {messages.length === 0 && (
            <WelcomeScreen ticker={ticker} onPrompt={sendMessage} />
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="px-5 pb-5 flex-shrink-0">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={formatMessage(t("chat.placeholder"), { ticker })}
                rows={1}
                className="w-full glass text-foreground text-[14px] px-4 py-4 pr-14 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted transition-all min-h-[56px] max-h-[160px]"
                style={{ height: "auto" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 160) + "px";
                }}
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                aria-label={t("chat.send")}
                title={t("chat.send")}
                className={clsx(
                  "absolute right-3 bottom-3 w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                  input.trim() && !loading
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40"
                    : "bg-glass text-muted cursor-not-allowed"
                )}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-muted mt-2 text-center">
            {t("chat.disclaimer")}
          </p>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({
  ticker,
  onPrompt,
}: {
  ticker: string;
  onPrompt: (p: string) => void;
}) {
  const { t } = useI18n();
  const suggestions = [
    formatMessage(t("chat.suggestionGex"), { ticker }),
    formatMessage(t("chat.suggestionIv"), { ticker }),
    formatMessage(t("chat.suggestionSpread"), { ticker }),
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full py-12 animate-fade-up">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/30">
          OA
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-accent flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-accent-foreground" />
        </div>
      </div>

      <h2 className="text-[22px] font-bold text-foreground mb-2">
        {t("chat.welcomeTitle")}
      </h2>
      <p className="text-[14px] text-muted mb-8 text-center max-w-md">
        {t("chat.welcomeSubtitle")}
      </p>

      <div className="grid grid-cols-1 gap-2 w-full max-w-xl">
        {suggestions.map((s, idx) => (
          <button
            key={s}
            onClick={() => onPrompt(s)}
            className={clsx(
              "text-left px-4 py-3.5 rounded-xl glass card-interactive text-[13px] text-muted-foreground hover:text-foreground opacity-0 animate-fade-up",
              `stagger-${idx + 1}`
            )}
          >
            <span className="text-primary mr-2">→</span>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
