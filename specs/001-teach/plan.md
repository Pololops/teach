# Implementation Plan: Teach - AI English Learning Chat

**Branch**: `001-teach` | **Date**: 2025-11-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-teach/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Teach is a web application designed to help French speakers learn English through natural AI-powered conversations. The app features:

- **Real-time chat interface** where users converse with an AI in English
- **Automatic difficulty adaptation** based on continuous assessment of user's CEFR level (A1-C2)
- **Ultra-responsive performance** (<2s response time) to simulate human-like conversation
- **Minimal, intuitive interface** optimized for mobile-first usage
- **Local-first architecture** with IndexedDB storage (no authentication required for MVP)
- **AI provider abstraction** supporting multiple LLM providers via backend proxy

The application prioritizes performance, simplicity, and intelligent adaptation to create an engaging language learning experience that feels like conversing with a real person.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)
**Package Manager**: pnpm 10.22+ (workspaces for monorepo)
**Runtime**: Node.js 25.2+

**Primary Dependencies**:
- **Frontend**: React 19.2+, Vite 7.2+, Tailwind CSS 4.1+, Shadcn UI (latest), Zustand 5.x, TanStack Query 5.x, Dexie.js 4.x
- **Backend**: Hono 4.10+, Vercel AI SDK 4.x, OpenAI SDK 5.x, Anthropic SDK 0.38+

**Storage**: IndexedDB (Dexie.js) for local-first persistence. No database for MVP.

**Testing**: Vitest (unit/integration), Playwright (E2E), axe-core (accessibility)

**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - last 2 versions), Mobile-first responsive design (375px-1920px+)

**Project Type**: Web application (monorepo: frontend SPA + backend API proxy)

**Performance Goals**:
- Initial load <2s on 3G
- AI response time-to-first-token <100ms
- 60fps animations
- Frontend bundle <200KB gzipped
- AI message response <2s (95th percentile)

**Constraints**:
- Lighthouse score 95+ all categories
- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
- WCAG 2.1 AA compliance
- Touch targets minimum 44x44px
- Works offline with graceful degradation (local-first)

**Scale/Scope**:
- Target: 10,000+ concurrent users
- Single-page application (SPA)
- ~15-20 components
- 5-7 core features (chat, level detection, AI provider, corrections, suggestions, progress)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Performance-First (NON-NEGOTIABLE) ✅ PASS

**Status**: Aligned

**Evidence**:
- Technical Context specifies <2s initial load on 3G
- AI response time-to-first-token <100ms target
- 60fps animation requirement
- Frontend bundle <200KB gzipped
- Streaming responses from AI (Vercel AI SDK)
- Performance budget enforced via Lighthouse 95+ requirement

**Actions Required**:
- [ ] Implement aggressive code splitting and lazy loading (Vite)
- [ ] Configure optimistic UI updates for all interactions (Zustand + TanStack Query)
- [ ] Set up performance monitoring in CI/CD

### II. Radical Simplicity & Zero Friction ✅ PASS

**Status**: Aligned

**Evidence from Spec**:
- FR-005: Single chat interface (entire app is the conversation)
- SC-005: Users start conversation within 30 seconds without help
- User Story 3: Immediately understandable interface
- Clarification 3: No authentication required (zero configuration)

**Actions Required**:
- [ ] Implement progressive disclosure pattern for advanced features
- [ ] Enforce YAGNI principle in feature development
- [ ] Design minimal UI chrome (single screen chat interface)

### III. Mobile-First & Accessible ✅ PASS

**Status**: Aligned

**Evidence**:
- Target Platform: Mobile-first responsive design (375px-1920px+)
- WCAG 2.1 AA compliance mandatory
- Touch targets minimum 44x44px
- User Story 3: Responsive across mobile, tablet, desktop

**Actions Required**:
- [ ] Design mobile viewport first
- [ ] Implement keyboard navigation
- [ ] Add ARIA labels and semantic HTML
- [ ] Test with screen readers
- [ ] Implement high contrast mode support

### IV. AI Provider Agnostic ✅ PASS

**Status**: Aligned

**Evidence**:
- Constitution principle IV explicitly required
- Feature architecture includes AI provider abstraction layer
- Multiple providers mentioned (OpenAI, Anthropic)
- Backend proxy handles provider switching

**Actions Required**:
- [ ] Design provider interface abstraction (Hono backend)
- [ ] Implement unified message format
- [ ] Create provider selection/fallback mechanism
- [ ] Support configuration-based switching

### V. Privacy-First & Data Minimalism ✅ PASS

**Status**: Aligned

**Evidence**:
- Storage: IndexedDB (primary), local-first
- No authentication required (Clarification 3)
- No cloud sync in MVP
- Backend only for AI proxy (stateless)
- API keys secured server-side (Hono backend)

**Actions Required**:
- [ ] Implement local-first storage (Dexie.js)
- [ ] Design data export/deletion capabilities
- [ ] Ensure no tracking without consent
- [ ] Secure API key storage (backend .env only)

### VI. Intelligent Adaptation ✅ PASS

**Status**: Aligned

**Evidence**:
- FR-002: Continuous proficiency assessment
- FR-003: Automatic difficulty adjustment
- User Story 2: Automatic difficulty adaptation (P2)
- CEFR levels (A1-C2) mentioned in spec

**Actions Required**:
- [ ] Implement automatic CEFR level detection algorithm
- [ ] Design real-time difficulty adjustment system
- [ ] Create context-aware correction mechanism
- [ ] Track learning patterns locally

### VII. Clean Architecture & SOLID Principles (NON-NEGOTIABLE) ✅ PASS

**Status**: Aligned

**Evidence**:
- Constitution mandates feature-based architecture
- Monorepo structure: apps/frontend, apps/backend, packages/shared
- Clear separation: features/ and shared/
- Dependency rules defined (downward only)

**Actions Required**:
- [ ] Implement feature-based folder structure
- [ ] Enforce dependency rules (features → shared only)
- [ ] Apply SOLID principles in all modules
- [ ] Maximum function length: 50 lines
- [ ] Maximum file length: 300 lines
- [ ] Cyclomatic complexity <10

### VIII. Critical Path Testing Only ✅ PASS

**Status**: Aligned

**Evidence**:
- Testing: Vitest (unit/integration), Playwright (E2E)
- axe-core for accessibility testing
- Performance tests in CI

**Actions Required**:
- [ ] E2E tests for critical user journeys (P1, P2 user stories)
- [ ] Unit tests for level detection algorithms
- [ ] Integration tests for AI provider abstraction
- [ ] Visual regression tests
- [ ] Performance tests in CI
- [ ] Accessibility tests automated

### Gate Result: ✅ ALL GATES PASSED

**Summary**: The feature specification and technical approach are fully aligned with all eight constitution principles. The monorepo architecture with Hono backend + Vite SPA frontend respects performance-first, simplicity, and clean architecture principles. No violations requiring justification.

**Next Step**: Proceed to Phase 0 Research to consolidate technology decisions.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Monorepo Structure (pnpm workspaces)
teach/
├── pnpm-workspace.yaml          # pnpm workspace configuration
├── package.json                 # Root package.json
├── .gitignore
├── .env.example                 # Environment variables template
├── turbo.json                   # (Optional) Turborepo for build optimization
│
├── apps/
│   ├── frontend/                # Vite + React SPA
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── features/        # Feature-based modules (vertical slices)
│   │   │   │   ├── chat/       # P1: Chat conversation feature
│   │   │   │   │   ├── components/     # ChatContainer, MessageList, MessageInput
│   │   │   │   │   ├── hooks/          # useChat, useMessages
│   │   │   │   │   ├── services/       # chatService (message handling)
│   │   │   │   │   ├── types/          # Message, Conversation types
│   │   │   │   │   └── index.ts        # Public API
│   │   │   │   │
│   │   │   │   ├── level-detection/    # P2: CEFR level detection
│   │   │   │   │   ├── components/     # LevelBadge
│   │   │   │   │   ├── hooks/          # useLevel, useLevelDetection
│   │   │   │   │   ├── services/       # levelDetectionService
│   │   │   │   │   ├── types/          # CEFRLevel, Assessment
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── corrections/        # P2: Grammar/vocabulary corrections
│   │   │   │   │   ├── components/     # CorrectionHighlight, CorrectionTooltip
│   │   │   │   │   ├── hooks/          # useCorrections
│   │   │   │   │   ├── services/       # correctionService
│   │   │   │   │   ├── types/          # Correction types
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── suggestions/        # P2: Contextual suggestions
│   │   │   │   │   ├── components/     # SuggestionChip
│   │   │   │   │   ├── hooks/          # useSuggestions
│   │   │   │   │   ├── services/       # suggestionService
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── progress/           # P4: Progress tracking
│   │   │   │   │   ├── components/     # ProgressPanel, ProgressMetrics
│   │   │   │   │   ├── hooks/          # useProgress
│   │   │   │   │   ├── services/       # progressService
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   └── ai/                 # AI client integration
│   │   │   │       ├── hooks/          # useAIStream
│   │   │   │       ├── services/       # AI API client
│   │   │   │       └── index.ts
│   │   │   │
│   │   │   ├── shared/          # Shared utilities (horizontal concerns)
│   │   │   │   ├── components/  # Reusable UI primitives (Shadcn components)
│   │   │   │   │   ├── ui/      # Shadcn UI components
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   └── ErrorBoundary.tsx
│   │   │   │   ├── hooks/       # Generic hooks
│   │   │   │   │   ├── useLocalStorage.ts
│   │   │   │   │   ├── useDebounce.ts
│   │   │   │   │   └── useMediaQuery.ts
│   │   │   │   ├── lib/         # Pure utilities
│   │   │   │   │   ├── storage/ # Dexie.js setup, IndexedDB adapters
│   │   │   │   │   ├── formatting/
│   │   │   │   │   └── validation/
│   │   │   │   ├── stores/      # Zustand stores
│   │   │   │   │   ├── uiStore.ts
│   │   │   │   │   └── userStore.ts
│   │   │   │   └── constants/   # App-wide constants
│   │   │   │       └── config.ts
│   │   │   │
│   │   │   ├── App.tsx          # Root component
│   │   │   ├── main.tsx         # Entry point
│   │   │   └── index.css        # Tailwind imports
│   │   │
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── backend/                 # Hono API (AI proxy)
│       ├── src/
│       │   ├── routes/          # API routes
│       │   │   ├── chat.ts      # POST /api/chat (streaming)
│       │   │   └── health.ts    # GET /api/health
│       │   ├── lib/             # Backend utilities
│       │   │   ├── ai/          # AI provider abstraction
│       │   │   │   ├── providers/
│       │   │   │   │   ├── openai.ts
│       │   │   │   │   ├── anthropic.ts
│       │   │   │   │   └── base.ts     # Provider interface
│       │   │   │   └── index.ts
│       │   │   └── middleware/  # CORS, rate limiting, etc.
│       │   ├── index.ts         # Hono app entry
│       │   └── env.ts           # Environment config
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared/                  # Shared types between frontend/backend
│       ├── src/
│       │   ├── types/           # Common TypeScript types
│       │   │   ├── message.ts   # Message, Conversation
│       │   │   ├── cefr.ts      # CEFRLevel, Assessment
│       │   │   └── api.ts       # API request/response types
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
└── tests/                       # E2E tests (Playwright)
    ├── e2e/
    │   ├── chat-flow.spec.ts    # P1: Natural conversation
    │   ├── level-adaptation.spec.ts # P2: Difficulty adaptation
    │   └── accessibility.spec.ts    # WCAG compliance
    ├── fixtures/
    └── playwright.config.ts
```

**Structure Decision**: **Monorepo with pnpm workspaces** (3 packages)

**Rationale**:
- **apps/frontend**: Vite SPA following feature-based architecture (constitution VII)
- **apps/backend**: Hono API proxy for secure AI provider access
- **packages/shared**: Shared TypeScript types for type-safe frontend ↔ backend communication
- **Feature modules**: Each feature (chat, level-detection, corrections, etc.) is self-contained
- **Separation of concerns**: Features are vertical slices; shared utilities are horizontal
- **Dependency flow**: App → Features → Shared (downward only, no circular dependencies)
- **Testability**: E2E tests at root level, unit tests colocated with features
- **Constitution compliance**: Matches prescribed structure from Section VII

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations - table empty

All constitutional principles are satisfied. No complexity exceptions required.
