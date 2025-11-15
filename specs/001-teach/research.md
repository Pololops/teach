# Research: Teach - AI English Learning Chat

**Date**: 2025-11-15
**Branch**: 001-teach

## Overview

This document consolidates research findings to resolve all "NEEDS CLARIFICATION" items identified in the Technical Context and to establish best practices for implementing the Teach application.

## Research Tasks

### 1. AI Provider SDKs Selection

**Unknown**: Which AI provider SDK(s) to use - OpenAI SDK, Anthropic SDK, or both?

**Decision**: Support both OpenAI and Anthropic SDKs with unified abstraction

**Rationale**:
- **Constitution Requirement**: Principle IV mandates AI provider agnostic architecture
- **Cost optimization**: Different providers have different pricing models; flexibility enables cost-effective selection
- **Availability & fallback**: If one provider is down or rate-limited, automatically switch to another
- **Quality comparison**: A/B testing different models for language learning effectiveness
- **Future-proofing**: Easy to add new providers (local models, other cloud providers) without refactoring

**Implementation Approach**:
- Create unified `AIProvider` interface with methods: `sendMessage()`, `streamResponse()`, `configureModel()`
- Implement concrete providers:
  - `OpenAIProvider`: Uses `openai` npm package (v4.x)
  - `AnthropicProvider`: Uses `@anthropic-ai/sdk` npm package (v0.x)
- Provider selection via configuration:
  - Environment variables: `VITE_DEFAULT_AI_PROVIDER`, `VITE_OPENAI_API_KEY`, `VITE_ANTHROPIC_API_KEY`
  - Runtime switching based on availability and performance
- Unified message format following common streaming protocol (SSE - Server-Sent Events)

**Alternatives Considered**:
- **Single provider (OpenAI only)**: Rejected because it violates constitution principle IV and creates vendor lock-in
- **LangChain abstraction**: Rejected because it adds unnecessary complexity and bundle size for our straightforward use case
- **Vercel AI SDK**: Considered but adds abstraction overhead; prefer lightweight custom implementation for performance

**Dependencies**:
```json
{
  "openai": "^4.20.0",
  "@anthropic-ai/sdk": "^0.9.0"
}
```

---

### 2. Backend Storage Solution for Cloud Sync

**Unknown**: Optional backend storage solution for cloud sync

**Decision**: Supabase (PostgreSQL + Auth + Realtime) for optional cloud sync

**⚠️ MVP UPDATE (2025-11-15)**: This Supabase research is preserved for **Phase 2 planning only**. The MVP implementation uses **IndexedDB exclusively** (local-first, no backend database, no authentication). Supabase will be revisited when adding optional cloud sync in Phase 2.

---

**Original Rationale (Phase 2)**:
- **Simplicity**: Hosted solution reduces infrastructure management (aligns with constitution simplicity principle)
- **Performance**: Built on PostgreSQL with excellent performance characteristics
- **Auth built-in**: Supabase Auth handles user authentication, reduces custom code
- **Real-time sync**: Supabase Realtime enables automatic sync across devices
- **Privacy-compliant**: Self-hosting option available for GDPR compliance
- **Cost-effective**: Generous free tier, pay-as-you-grow pricing
- **TypeScript support**: Excellent TypeScript SDK with type generation from schema
- **Row-level security**: Database-level privacy controls for user data isolation

**Implementation Approach**:
- **Local-first**: Primary storage remains IndexedDB on device
- **Opt-in sync**: Users explicitly choose to enable cloud sync
- **Selective sync**: Only sync conversation history and progress metrics, not API keys
- **Offline-first**: App functions fully offline; sync happens in background when online
- **Schema**:
  - `users` table (managed by Supabase Auth)
  - `conversations` table (user_id, messages JSONB, created_at, updated_at)
  - `progress_metrics` table (user_id, cefr_level, vocabulary_count, total_time, metrics JSONB)
- **Row-level security policies**: Users can only access their own data

**Alternatives Considered**:
- **Firebase**: Rejected due to vendor lock-in and less privacy-friendly defaults
- **Custom Node.js + PostgreSQL**: Rejected because it requires more infrastructure management
- **PlanetScale (MySQL)**: Good alternative but Supabase offers more batteries-included features
- **No backend at all**: Considered but rejected because users expect cross-device sync in modern apps

**Dependencies** (Phase 2 only - not in MVP):
```json
{
  "@supabase/supabase-js": "^2.38.0"
}
```

**MVP**: No Supabase dependency. See `versions.md` for actual MVP dependencies.

---

### 3. Accessibility Testing Tools

**Unknown**: Specific accessibility testing tools for WCAG 2.1 AA compliance

**Decision**: axe-core (automated) + manual testing with screen readers

**Rationale**:
- **axe-core**: Industry-standard automated accessibility testing, catches ~57% of WCAG issues
- **Playwright integration**: Run accessibility tests in E2E suite automatically
- **CI/CD integration**: Block deployment if critical accessibility violations detected
- **Manual testing**: Required for remaining ~43% of WCAG issues (screen reader testing, keyboard navigation)
- **Screen readers**:
  - **NVDA** (Windows) - free, widely used
  - **VoiceOver** (macOS/iOS) - built-in, mobile testing
  - **TalkBack** (Android) - built-in, mobile testing

**Implementation Approach**:
- Install `@axe-core/playwright` for automated testing in E2E suite
- Configure axe rules for WCAG 2.1 Level AA
- E2E test example:
  ```typescript
  test('chat interface is accessible', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
  ```
- Manual testing checklist:
  - Keyboard navigation (Tab, Enter, Escape, Arrow keys)
  - Screen reader announces all interactive elements
  - Touch targets minimum 44x44px
  - Color contrast ratios meet AA standards (4.5:1 for text)
  - Focus indicators visible on all interactive elements
  - ARIA labels for non-text content

**Alternatives Considered**:
- **Pa11y**: Good alternative but axe-core has better Playwright integration
- **Lighthouse accessibility audit**: Useful but less comprehensive than axe-core
- **Manual-only testing**: Rejected because automated tests catch low-hanging fruit and prevent regressions

**Dependencies**:
```json
{
  "@axe-core/playwright": "^4.8.0"
}
```

---

### 4. AI Streaming Response Implementation

**Unknown**: Best practices for implementing AI streaming responses with <100ms time-to-first-token

**Decision**: Server-Sent Events (SSE) with optimistic UI updates and streaming protocol

**Rationale**:
- **Performance**: SSE provides one-way server-to-client streaming with minimal overhead
- **Browser support**: Native EventSource API, no additional libraries needed
- **Time-to-first-token**: Display first token immediately as it arrives (streaming > waiting for full response)
- **UX**: User sees typing animation, feels like chatting with a human
- **Fallback**: If SSE fails, fallback to regular HTTP with polling

**Implementation Approach**:

**Frontend (React)**:
```typescript
// Optimistic UI update
const sendMessage = async (text: string) => {
  // 1. Immediately add user message to UI (optimistic)
  addMessage({ role: 'user', content: text, timestamp: Date.now() });

  // 2. Show typing indicator
  setIsTyping(true);

  // 3. Stream AI response
  const stream = await aiProvider.streamResponse(text);
  let assistantMessage = '';

  for await (const chunk of stream) {
    assistantMessage += chunk;
    // Update UI with partial response (real-time streaming)
    updateMessage({ role: 'assistant', content: assistantMessage });
  }

  setIsTyping(false);
};
```

**Backend Proxy (Node.js)**:
```typescript
app.post('/api/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: req.body.messages,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    res.write(`data: ${JSON.stringify({ content })}\n\n`);
  }

  res.write('data: [DONE]\n\n');
  res.end();
});
```

**Performance Optimizations**:
- **HTTP/2**: Use HTTP/2 for multiplexing (multiple streams over single connection)
- **Edge deployment**: Deploy backend proxy to edge (Vercel Edge Functions, Cloudflare Workers) for <50ms latency
- **Connection pooling**: Reuse TCP connections to AI providers
- **Prefetch**: Predict next user action and prefetch AI context

**Alternatives Considered**:
- **WebSockets**: Rejected because SSE is simpler for one-way streaming (server to client)
- **Long polling**: Rejected because it's inefficient and adds latency
- **Wait for full response**: Rejected because it violates performance requirement (<100ms time-to-first-token)

**Dependencies**: None (native EventSource API)

---

### 5. CEFR Level Detection Algorithm

**Unknown**: Best practices for implementing automatic CEFR level detection

**Decision**: Hybrid approach - rule-based heuristics + LLM-assisted assessment

**Rationale**:
- **Accuracy**: Combine linguistic rules (vocabulary, grammar) with LLM context understanding
- **Real-time**: Rule-based heuristics run locally (instant), LLM assessment runs periodically
- **Adaptation**: Continuous assessment during conversation, not one-time test
- **Privacy**: Primary assessment happens locally (no need to send all data to server)

**Implementation Approach**:

**Rule-Based Heuristics (Local)**:
- **Vocabulary complexity**:
  - A1-A2: Common 1000 words (CEFR word lists)
  - B1-B2: 2000-3000 words
  - C1-C2: Academic, idiomatic expressions
- **Sentence length**: Avg words per sentence (A1: 5-8, B1: 10-15, C1: 15+)
- **Grammar structures**:
  - A1: Simple present, basic questions
  - B1: Past perfect, conditionals
  - C1: Subjunctive, complex clauses
- **Error density**: Errors per 100 words (A1: >10, B1: 5-10, C1: <5)

**LLM-Assisted Assessment (Periodic)**:
- Every 5 messages, send conversation excerpt to LLM with prompt:
  ```
  Analyze this English learner's proficiency level (CEFR: A1, A2, B1, B2, C1, C2).
  Consider: vocabulary range, grammar accuracy, fluency, coherence.
  Return JSON: { "level": "B1", "confidence": 0.85, "strengths": [...], "areas_to_improve": [...] }
  ```
- Combine LLM assessment with local heuristics (weighted average)
- Cache assessment to avoid redundant API calls

**Adaptation Logic**:
```typescript
const adaptDifficulty = (currentLevel: CEFRLevel, userMessage: string) => {
  const detectedLevel = detectLevel(userMessage); // Rule-based

  if (detectedLevel > currentLevel) {
    // User improving - gradually increase difficulty
    return increaseLevel(currentLevel, 0.5); // Half step increase
  } else if (detectedLevel < currentLevel) {
    // User struggling - decrease difficulty
    return decreaseLevel(currentLevel, 1); // Full step decrease
  }

  return currentLevel; // Maintain current level
};
```

**Alternatives Considered**:
- **LLM-only assessment**: Rejected because it's expensive and adds latency
- **Rule-based only**: Rejected because it lacks context understanding (can't detect fluency, coherence)
- **Fixed level (user-selected)**: Rejected because it violates automatic adaptation requirement

**Resources**:
- CEFR vocabulary lists: https://www.englishprofile.org/wordlists
- Grammar structures by level: Cambridge English Profile

**Dependencies**: None (pure TypeScript, uses existing AI provider for LLM assessment)

---

### 6. IndexedDB Library Selection

**Unknown**: Best practices for IndexedDB usage in React

**Decision**: Dexie.js - Minimalistic wrapper for IndexedDB

**Rationale**:
- **Performance**: Thin wrapper, minimal overhead
- **TypeScript support**: Excellent type definitions
- **React hooks**: Official `dexie-react-hooks` package for React integration
- **Query performance**: Optimized indexing and querying
- **Developer experience**: Much simpler API than raw IndexedDB
- **Bundle size**: ~20KB gzipped (acceptable for constitution's 200KB budget)
- **Reliability**: Battle-tested, used by thousands of production apps

**Implementation Approach**:
```typescript
// db.ts - Database schema
import Dexie, { Table } from 'dexie';

interface Message {
  id?: number;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Conversation {
  id?: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

class TeachDB extends Dexie {
  conversations!: Table<Conversation>;
  messages!: Table<Message>;

  constructor() {
    super('TeachDB');
    this.version(1).stores({
      conversations: '++id, createdAt',
      messages: '++id, conversationId, timestamp',
    });
  }
}

export const db = new TeachDB();
```

**React Hook Usage**:
```typescript
import { useLiveQuery } from 'dexie-react-hooks';

const useMessages = (conversationId: string) => {
  const messages = useLiveQuery(
    () => db.messages
      .where('conversationId')
      .equals(conversationId)
      .sortBy('timestamp'),
    [conversationId]
  );

  return messages ?? [];
};
```

**Alternatives Considered**:
- **Raw IndexedDB API**: Rejected because it's verbose and error-prone
- **LocalForage**: Good alternative but Dexie has better querying and React integration
- **Redux Persist with IndexedDB**: Rejected because we're using local-first, not Redux

**Dependencies**:
```json
{
  "dexie": "^3.2.4",
  "dexie-react-hooks": "^1.1.7"
}
```

---

## Summary of Decisions

| Area | Decision | Key Benefit |
|------|----------|-------------|
| **AI Providers** | OpenAI + Anthropic SDKs with abstraction | Provider flexibility, cost optimization, failover |
| **Cloud Sync** | Supabase (PostgreSQL + Auth) | Simplicity, privacy-compliant, real-time sync |
| **Accessibility** | axe-core + manual screen reader testing | Automated + comprehensive WCAG 2.1 AA compliance |
| **AI Streaming** | Server-Sent Events (SSE) | <100ms time-to-first-token, native browser support |
| **Level Detection** | Hybrid (rule-based + LLM) | Real-time + accurate, privacy-preserving |
| **IndexedDB** | Dexie.js | Simple API, TypeScript support, React hooks |

## Technology Stack (Final)

```json
{
  "frontend": {
    "framework": "React 18+",
    "build": "Vite 5+",
    "language": "TypeScript 5.0+",
    "styling": "Tailwind CSS 3.x",
    "storage": "Dexie.js 3.x (IndexedDB)",
    "ai": "OpenAI SDK 4.x, Anthropic SDK 0.9.x",
    "testing": "Vitest 1.x, Playwright 1.40+, @axe-core/playwright 4.8+"
  },
  "backend": {
    "runtime": "Node.js 20+",
    "framework": "Hono 3.x (lightweight, edge-ready)",
    "database": "Supabase (PostgreSQL 15+)",
    "deployment": "Vercel Edge Functions"
  }
}
```

## Next Steps

All "NEEDS CLARIFICATION" items resolved. Ready to proceed to **Phase 1: Design & Contracts**.
