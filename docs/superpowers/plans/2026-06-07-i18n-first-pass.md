# OptionsAji I18n First Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first-version Chinese/English language switch without changing existing routes.

**Architecture:** Keep current paths such as `/ai` and `/market`. Add a client i18n provider that stores `zh`/`en` in localStorage and a cookie, expose `useI18n()`, add a sidebar language toggle, translate high-traffic UI with `t()`, and add a DOM phrase translator as a first-pass safety net for remaining hardcoded text. Send `locale` to the Agent SSE endpoint so backend answers match the selected language.

**Tech Stack:** Next.js App Router, React context, TypeScript, FastAPI/Pydantic for Agent payload.

---

### Task 1: Frontend I18n Foundation

**Files:**
- Create: `lib/i18n/types.ts`
- Create: `lib/i18n/dictionary.ts`
- Create: `lib/i18n/context.tsx`
- Create: `components/LanguageToggle.tsx`
- Modify: `app/providers.tsx`
- Modify: `app/layout.tsx`
- Modify: `components/Sidebar.tsx`
- Modify: `components/DashboardAuthGuard.tsx`
- Modify: `components/NavVisibilityGuard.tsx`
- Modify: `components/ThemeToggle.tsx`
- Test: `npm run build`

- [ ] Create typed locale primitives and dictionary helpers.
- [ ] Add `I18nProvider` with persisted locale, cookie sync, `t(key)`, and phrase translation.
- [ ] Add a compact language toggle in the sidebar footer.
- [ ] Replace core shell/navigation/loading/settings strings with dictionary keys.
- [ ] Add `lang` hydration update for `<html>`.
- [ ] Build and fix TypeScript issues.
- [ ] Commit frontend changes on `ai-agent`.

### Task 2: AI Agent Locale Propagation

**Files:**
- Modify: `lib/agentSse.ts`
- Modify: `components/chat/ChatWindow.tsx`
- Modify backend: `/root/workspace/options-aji-backend/app/api/routes/agent.py`
- Modify backend: `/root/workspace/options-aji-backend/app/agents/user_agent.py`
- Test backend: `venv/bin/pytest tests/test_agent_sse.py -q`
- Test frontend: `npm run build`

- [ ] Include `locale` in the Agent SSE request payload.
- [ ] Extend backend Agent payload/state to accept `zh`/`en`.
- [ ] Adjust backend SSE status messages and LLM system prompt language based on locale.
- [ ] Keep default locale as `zh` for backward compatibility.
- [ ] Commit frontend changes on `ai-agent` and backend changes on `claude/redesign-options-platform-bxjbU`.

### Task 3: Verification

**Files:**
- Inspect changed frontend/backend files only.

- [ ] Confirm no unrelated untracked backend files are staged.
- [ ] Run frontend build.
- [ ] Run backend SSE tests.
- [ ] Check visible `/ai` flow in English sends `locale: "en"`.
- [ ] Report any remaining Chinese hardcoded strings as follow-up scope, not as hidden failures.
