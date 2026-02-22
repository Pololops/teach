# Teach — AI English Learning Chat

Help French speakers learn English through AI-powered conversations.

## Commands

```bash
# Development (runs frontend + backend + shared in parallel)
pnpm dev

# Quality checks
pnpm test                    # Vitest unit tests (backend)
pnpm lint                    # ESLint (frontend)
pnpm typecheck               # TypeScript --noEmit (backend, shared)
pnpm test:e2e                # Playwright E2E tests

# Build
pnpm build                   # Build all workspaces

# Per-workspace
pnpm --filter frontend dev   # Vite dev server (port 5173)
pnpm --filter @teach/backend dev   # tsx watch (port 3000)
pnpm --filter @teach/shared dev    # tsc --watch

# Single test file
pnpm --filter @teach/backend vitest run src/lib/ai/someFile.test.ts
```

## Architecture

pnpm monorepo with 3 workspaces:

```
apps/frontend/     # React 19 + Vite + Tailwind CSS 4 + TypeScript
apps/backend/      # Hono API server (AI proxy) + TypeScript
packages/shared/   # Zod schemas + TypeScript types (contract between front/back)
```

### Frontend (`apps/frontend/`)

Feature-based architecture. Code organized by business domain, not technical layer.

```
src/
├── features/
│   ├── chat/              # Core conversation (SSE streaming)
│   ├── game/              # Vocabulary game
│   ├── home/              # Home screen
│   ├── level-detection/   # CEFR level analysis
│   └── progress/          # Progress tracking
├── shared/
│   ├── lib/storage/       # Dexie IndexedDB (local-first persistence)
│   ├── services/          # API clients (chatService, correctorService, gameService)
│   └── stores/            # Zustand stores (userStore, uiStore, navigationStore, gameStore)
├── App.tsx
└── main.tsx
```

Each feature contains: `components/`, `hooks/`, and optionally `services/`, `utils/`, `types/`, `constants/`.

### Backend (`apps/backend/`)

Hono API proxy — sits between frontend and Ollama. Routes:

- `POST /api/chat/stream` — SSE streaming chat
- `POST /api/correct` — Text correction with diff tracking
- `POST /api/game/*` — Vocabulary game sessions
- `GET /api/health` — Health check

```
src/
├── routes/        # chat, corrector, game, health
├── lib/ai/        # AI provider abstraction + services
│   └── providers/ # Ollama (implements AIProvider interface)
└── prompts/       # CEFR-level-adapted system prompts
```

### Shared (`packages/shared/`)

Zod schemas that define the contract between frontend and backend. Import as `@teach/shared`.

Exports: `CEFRLevel`, `ChatMessage`, `Message`, `Conversation`, `User`, `ProgressMetrics`, `GameSession`, `ErrorCode`, `AppError`, `parseError`, and all corresponding Zod schemas.

## Key Patterns

**State management**: Zustand for client state, TanStack Query for server state cache, Dexie (IndexedDB) for local-first persistence.

**SSE streaming**: Frontend reads `ReadableStream` with manual SSE parsing. Backend uses Hono `streamSSE`. Events: `start` → `content` (chunks) → `[DONE]`.

**AI provider abstraction**: `AIProvider` interface in `apps/backend/src/lib/ai/providers/base.ts`. Currently only Ollama implemented (via OpenAI SDK pointing at Ollama's compatible API).

**Error handling**: Structured `AppError` with `ErrorCode` enum, user-friendly French messages, severity levels, and retry info. Defined in `packages/shared/src/types/errors.ts`. Frontend uses `parseError()` to normalize errors.

**Dependency flow** (downward only):
```
App → Features → Shared
```
Features import `shared/` freely. Cross-feature imports only through public API (`index.ts`). Shared never imports from features.

## Code Constraints

From the project constitution:

- **Max 50 lines** per function
- **Max 300 lines** per file
- **Max 7 props** per component
- **Max 4 parameters** per function (use objects if more)
- **Cyclomatic complexity** < 10
- **Strict TypeScript** — no `any` (use `unknown` and narrow)
- **Functional components only** (hooks-based)
- **Immutable data** — no direct mutations

**Priority order**: Performance > Simplicity > Maintainability > Features > Aesthetics

## Environment

Defaults work out of the box with Ollama running locally. No `.env` file needed for dev.

| Variable | Default | Where |
|---|---|---|
| `PORT` | `3000` | Backend |
| `CORS_ORIGINS` | `http://localhost:5173` | Backend |
| `OLLAMA_BASE_URL` | `http://localhost:11434/v1` | Backend |
| `OLLAMA_MODEL` | `llama3.1` | Backend |
| `VITE_AI_PROXY_URL` | `http://localhost:3000` | Frontend |

**Prerequisites**: Node >= 25.2.0, pnpm >= 10.22.0, Ollama running with a model pulled (`ollama pull llama3.1`).
