# Repo Scout Memory - Teach Project

## Project Structure
- pnpm monorepo: `apps/frontend/`, `apps/backend/`, `packages/shared/`
- Shared types via `@teach/shared` with Zod schemas
- Frontend: React 19 + Vite + Tailwind CSS 4 + Zustand + TanStack Query + Dexie (IndexedDB)
- Backend: Hono API server + OpenAI SDK pointing at Ollama

## Key Patterns
- **Shared contract**: Zod schemas in `packages/shared/src/types/` define types AND runtime validation
- **AI provider**: `apps/backend/src/lib/ai/providers/base.ts` defines `AIProvider` interface (only Ollama impl)
- **Game service**: `apps/backend/src/lib/ai/gameService.ts` is a class with question pool caching, NOT using the AIProvider interface
- **Error handling**: `AppError` with `ErrorCode` enum, `parseError()` utility in shared
- **IndexedDB**: Dexie with version-based schema migrations in `apps/frontend/src/shared/lib/storage/db.ts`
- **No test files exist** in the project as of 2026-02-22

## File Naming Conventions
- kebab-case for files, PascalCase for components
- Feature-based organization in frontend: `features/{name}/components/`, `hooks/`, `services/`
- Shared services in `apps/frontend/src/shared/services/`
- Stores in `apps/frontend/src/shared/stores/`

## Emoji Utilities
- `apps/frontend/src/shared/lib/emojiUtils.ts` has `isEmojiOnly`, `splitEmojis`, `processEmojiMessage`
- Uses `Intl.Segmenter` for proper grapheme cluster splitting
- Used in chat messages, NOT in game feature currently
