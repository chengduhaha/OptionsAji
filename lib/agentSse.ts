"use client";

import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { formatMessage, resolveDictionaryValue } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/types";

export type AgentSseEvent =
  | { type: "thinking"; content: string | null; ts_unix_ms?: number }
  | { type: "planning"; content: string | null; ts_unix_ms?: number }
  | {
      type: "subagent_start";
      content: string | null;
      agent?: string | null;
      ts_unix_ms?: number;
    }
  | {
      type: "subagent_done";
      content: string | null;
      agent?: string | null;
      ts_unix_ms?: number;
    }
  | {
      type: "data_fetched";
      content: string | null;
      resolved_ticker?: string | null;
      ts_unix_ms?: number;
    }
  | { type: "answer"; content: string | null }
  | { type: "done" }
  | { type: "error"; content: string | null };

/** Aligns with `ChatWindow` message rows used by SSE updates. */
export type AgentChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  thinking?: boolean;
  /** Real agent trace lines from SSE (no mock steps). */
  thinkingLines?: string[];
};

function localized(
  locale: Locale,
  key: string,
  fallback: string,
  values?: Record<string, string | number>,
): string {
  return formatMessage(resolveDictionaryValue(locale, key) ?? fallback, values);
}

function eventLabel(kind: AgentSseEvent["type"], locale: Locale): string {
  switch (kind) {
    case "thinking":
      return localized(locale, "sse.thinking", "思考");
    case "data_fetched":
      return localized(locale, "sse.data", "数据");
    case "planning":
      return localized(locale, "sse.planning", "规划");
    case "subagent_start":
      return localized(locale, "sse.subagentStart", "子代理启动");
    case "subagent_done":
      return localized(locale, "sse.subagentDone", "子代理完成");
    case "error":
      return localized(locale, "sse.error", "错误");
    default:
      return localized(locale, "sse.event", "事件");
  }
}

function pushTraceLine(
  existing: readonly string[] | undefined,
  line: string,
): string[] {
  const base = [...(existing ?? [])];
  if (!line.trim()) return base;
  base.push(line.trim());
  return base;
}

async function consumeSse(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  locale: Locale,
  callbacks: {
    onEvent: (ev: AgentSseEvent) => void;
    onError?: (reason: unknown) => void;
  },
): Promise<void> {
  const decoder = new TextDecoder();
  let backlog = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();

      backlog += decoder.decode(value ?? new Uint8Array(), { stream: true });

      const blocks = backlog.split("\n\n");
      backlog = blocks.pop() ?? "";

      for (const blockRaw of blocks) {
        const lineJoin = blockRaw
          .split("\n")
          .filter((segment) => segment.startsWith("data:"))
          .map((segment) => segment.replace(/^data:\s*/, ""));
        const payload = lineJoin.join("\n");

        const trimmedPayload = payload.trim();
        if (!trimmedPayload) continue;

        let parsed: AgentSseEvent;
        try {
          parsed = JSON.parse(trimmedPayload) as AgentSseEvent;
        } catch (parseError: unknown) {
          callbacks.onError?.(parseError);
          callbacks.onEvent({
            type: "error",
            content: localized(locale, "sse.decodeFailed", "SSE 解码失败（非 JSON）。"),
          });
          continue;
        }

        callbacks.onEvent(parsed);
      }

      if (done) break;
    }
  } finally {
    reader.releaseLock();
  }
}

export async function runAgentViaSseStream(params: {
  question: string;
  ticker: string;
  locale: Locale;
  bearerToken?: string | null;
  thinkingMsgId: string;
  setMessages: Dispatch<SetStateAction<AgentChatMessage[]>>;
  sessionRef: MutableRefObject<string>;
}): Promise<void> {
  const headersRecord: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  };

  if (params.bearerToken) {
    headersRecord.Authorization = `Bearer ${params.bearerToken}`;
  }
  const locale = params.locale;

  const finalizeStaleThinking = (): void => {
    params.setMessages((prev) =>
      prev.map((m) =>
        m.id === params.thinkingMsgId && m.thinking
          ? {
              ...m,
              thinking: false,
              content:
                m.content ||
                (m.thinkingLines && m.thinkingLines.length > 0
                  ? m.thinkingLines.join("\n")
                  : localized(locale, "sse.stale", "SSE 结束，但未收到模型回答片段。")),
            }
          : m,
      ),
    );
  };

  try {
    const resp = await fetch("/api/agent/query", {
      method: "POST",
      headers: headersRecord,
      body: JSON.stringify({
        question: params.question,
        ticker: params.ticker,
        locale,
        session_id: params.sessionRef.current,
      }),
    });

    if (!resp.ok || !resp.body) {
      const text = await resp.text();
      params.setMessages((prev) =>
        prev.map((member) =>
          member.id === params.thinkingMsgId
            ? {
                ...member,
                thinking: false,
                thinkingLines: pushTraceLine(member.thinkingLines, `[HTTP ${resp.status}] ${text.slice(0, 300)}`),
                content:
                  resp.status === 503
                    ? localized(locale, "sse.backendNotReady", "Agent 后端未就绪：{detail}", {
                        detail: text || "请先配置 OPTIONS_AJI_BACKEND_URL。",
                      })
                    : localized(locale, "sse.backendError", "Agent 后端错误 ({status}): {detail}", {
                        status: resp.status,
                        detail: text || localized(locale, "sse.unknownError", "未知错误"),
                      }),
              }
            : member,
        ),
      );
      return;
    }

    let seenAnswer = false;
    const subagentStartedAt: Record<string, number> = {};

    await consumeSse(resp.body.getReader(), locale, {
      onEvent: (eventItem) => {
        if (
          eventItem.type === "thinking" ||
          eventItem.type === "data_fetched" ||
          eventItem.type === "planning" ||
          eventItem.type === "subagent_start" ||
          eventItem.type === "subagent_done"
        ) {
          const nowMs = eventItem.ts_unix_ms ?? Date.now();
          if (eventItem.type === "subagent_start" && eventItem.agent) {
            subagentStartedAt[eventItem.agent] = nowMs;
          }

          let content = eventItem.content ?? "";
          if (eventItem.type === "subagent_done" && eventItem.agent) {
            const started = subagentStartedAt[eventItem.agent];
            if (started) {
              const elapsedMs = Math.max(0, nowMs - started);
              const elapsedLabel =
                elapsedMs >= 1000
                  ? `${(elapsedMs / 1000).toFixed(1)}s`
                  : `${Math.round(elapsedMs)}ms`;
              content = `${content}（${localized(locale, "sse.elapsed", "耗时 {elapsed}", { elapsed: elapsedLabel })}）`;
            }
          }

          const blob = `${eventLabel(eventItem.type, locale)}｜${content}`;
          params.setMessages((membership) =>
            membership.map((messageEntry) =>
              messageEntry.id === params.thinkingMsgId
                ? {
                    ...messageEntry,
                    thinking: true,
                    thinkingLines: pushTraceLine(messageEntry.thinkingLines, blob),
                  }
                : messageEntry,
            ),
          );
        }

        if (eventItem.type === "error") {
          params.setMessages((membership) =>
            membership.map((messageEntry) =>
              messageEntry.id === params.thinkingMsgId
                ? {
                    ...messageEntry,
                    thinking: false,
                    thinkingLines: pushTraceLine(
                      messageEntry.thinkingLines,
                      `${eventLabel(eventItem.type, locale)}｜${eventItem.content ?? localized(locale, "sse.unknownError", "未知错误")}`,
                    ),
                    content: eventItem.content ?? localized(locale, "sse.agentError", "Agent 报错"),
                  }
                : messageEntry,
            ),
          );
        }

        if (eventItem.type === "answer") {
          seenAnswer = true;
          params.setMessages((membership) =>
            membership.map((messageEntry) =>
              messageEntry.id === params.thinkingMsgId
                ? {
                    ...messageEntry,
                    content: eventItem.content ?? "",
                    thinking: false,
                  }
                : messageEntry,
            ),
          );
        }
      },
    });

    if (!seenAnswer) {
      finalizeStaleThinking();
    }
  } catch (connectionError: unknown) {
    const messageLabel =
      connectionError instanceof Error
        ? connectionError.message
        : localized(locale, "sse.networkError", "网络错误");

    params.setMessages((memberList) =>
      memberList.map((messageEntry) =>
        messageEntry.id === params.thinkingMsgId
          ? {
              ...messageEntry,
              thinking: false,
              thinkingLines: pushTraceLine(
                messageEntry.thinkingLines,
                `${eventLabel("error", locale)}｜${messageLabel}`,
              ),
              content: localized(locale, "sse.cannotConnect", "{message}，无法连接 Agent SSE。", {
                message: messageLabel,
              }),
            }
          : messageEntry,
      ),
    );
  }
}
