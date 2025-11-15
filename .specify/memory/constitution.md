# Teach - English Learning Platform Constitution

## Core Principles

### I. Performance-First (NON-NEGOTIABLE)
**The app must feel instantaneous and fluid to create the illusion of talking to a real human.**

- Initial load: <2s on 3G
- Chat message response: <100ms time-to-first-token
- Animations: 60fps minimum (no jank)
- Bundle size: Frontend <200KB gzipped
- Optimistic UI updates for all user interactions
- Streaming responses from AI (never wait for complete response)
- Aggressive code splitting and lazy loading
- Performance budget enforced in CI/CD

### II. Radical Simplicity & Zero Friction
**If a user needs instructions, we've failed. The interface must be instantly understandable.**

- Zero configuration required to start chatting
- No mandatory account creation for first use
- Single-screen interface (chat is the entire app)
- Minimal UI chrome (no unnecessary buttons, menus, or options)
- Progressive disclosure (advanced features appear only when needed)
- YAGNI principle strictly enforced (ship minimal viable features)
- Every added feature must justify its cognitive cost

### III. Mobile-First & Accessible
**The primary experience is mobile. Accessibility is not optional.**

- Design and develop mobile viewport first
- Touch targets minimum 44x44px
- WCAG 2.1 AA compliance mandatory
- Keyboard navigation fully supported
- Screen reader optimized (ARIA labels, semantic HTML)
- Works offline with graceful degradation
- Responsive typography (fluid scaling)
- High contrast mode support

### IV. AI Provider Agnostic
**Never couple to a single AI provider. The AI layer must be swappable.**

- Abstract AI interactions behind a provider interface
- Support multiple providers (OpenAI, Anthropic, local models, etc.)
- Unified message format and streaming protocol
- Provider selection based on availability, cost, and quality
- Fallback mechanisms for provider failures
- Easy to A/B test different models
- Configuration-based provider switching (no code changes)

### V. Privacy-First & Data Minimalism
**User data is sacred. Collect only what's essential, store locally by default.**

- LocalStorage/IndexedDB primary storage
- Optional cloud sync (explicit user opt-in)
- No tracking or analytics without consent
- Conversation history stays on device by default
- API keys stored securely (never in localStorage)
- GDPR/CCPA compliant data handling
- Clear data export and deletion capabilities
- Minimal backend state (stateless API preferred)

### VI. Intelligent Adaptation
**The AI must dynamically adapt to user level without explicit configuration.**

- Automatic level detection (A1-C2 CEFR framework)
- Continuous assessment during conversation
- Real-time difficulty adjustment
- Context-aware corrections (grammar, vocabulary, pronunciation)
- Contextual suggestions without interrupting flow
- Learning patterns tracked locally
- Progressive challenge (comfort zone + 1)

### VII. Clean Architecture & SOLID Principles (NON-NEGOTIABLE)
**Code must be simple, maintainable, and evolutive. Architecture enables change, not prevents it.**

#### KISS (Keep It Simple, Stupid)
- Prefer simple solutions over clever ones
- No premature optimization
- Avoid over-engineering
- Clear is better than concise
- Readable code > Smart code

#### DRY (Don't Repeat Yourself)
- Extract reusable logic into functions/hooks/utilities
- Shared types and interfaces in dedicated files
- Component composition over duplication
- Configuration over hardcoded values
- Single source of truth for business logic

#### SOLID Principles
- **Single Responsibility**: Each module/function does ONE thing well
  - Components handle UI only
  - Hooks handle state logic
  - Services handle business logic
  - Utilities handle pure transformations

- **Open/Closed**: Open for extension, closed for modification
  - Use composition and configuration
  - Plugin architecture for AI providers
  - Strategy pattern for level adaptation
  - Decorator pattern for message enrichment

- **Liskov Substitution**: Interfaces must be reliable
  - AI providers interchangeable without breaking
  - Storage adapters (localStorage, cloud) swappable
  - Consistent return types and error handling

- **Interface Segregation**: Small, focused interfaces
  - Specific props for specific components
  - Narrow function signatures
  - No god objects or kitchen-sink interfaces

- **Dependency Inversion**: Depend on abstractions, not concretions
  - Components depend on hooks, not direct storage access
  - Hooks depend on services, not implementation details
  - Services depend on interfaces, not specific providers

#### Separation of Concerns - Feature-Based Architecture

**Organization**: Code is organized by feature/domain, not by technical layer. Each feature is self-contained and independently deployable.

```text
src/
├── features/                    # Business features (vertical slices)
│   ├── chat/                   # Chat conversation feature
│   │   ├── components/         # Chat UI components
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── TypingIndicator.tsx
│   │   ├── hooks/              # Chat-specific hooks
│   │   │   ├── useChat.ts
│   │   │   ├── useMessages.ts
│   │   │   └── useScrollToBottom.ts
│   │   ├── services/           # Chat business logic
│   │   │   └── chatService.ts
│   │   ├── types/              # Chat-specific types
│   │   │   └── Message.ts
│   │   └── index.ts            # Public API (exports)
│   │
│   ├── level-detection/        # CEFR level detection feature
│   │   ├── components/         # Level UI (badges, progress)
│   │   ├── hooks/              # useLevel, useLevelDetection
│   │   ├── services/           # Level detection algorithms
│   │   ├── types/              # Level, CEFRLevel types
│   │   └── index.ts
│   │
│   ├── corrections/            # Grammar/vocabulary corrections
│   │   ├── components/         # Correction overlays, highlights
│   │   ├── hooks/              # useCorrections
│   │   ├── services/           # Correction analysis logic
│   │   ├── types/              # Correction, CorrectionType
│   │   └── index.ts
│   │
│   ├── suggestions/            # Contextual suggestions feature
│   │   ├── components/         # Suggestion chips, tooltips
│   │   ├── hooks/              # useSuggestions
│   │   ├── services/           # Suggestion generation
│   │   ├── types/              # Suggestion types
│   │   └── index.ts
│   │
│   └── ai-provider/            # AI provider abstraction
│       ├── providers/          # OpenAI, Anthropic, etc.
│       │   ├── openai.ts
│       │   ├── anthropic.ts
│       │   └── base.ts         # Provider interface
│       ├── hooks/              # useAI, useStreaming
│       ├── services/           # Provider selection, fallback
│       ├── types/              # AIMessage, Provider types
│       └── index.ts
│
├── shared/                     # Shared utilities (horizontal concerns)
│   ├── components/             # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Loading.tsx
│   │   └── ErrorBoundary.tsx
│   ├── hooks/                  # Generic hooks
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   └── useMediaQuery.ts
│   ├── lib/                    # Pure utilities
│   │   ├── storage/            # Storage adapters
│   │   ├── formatting/         # Text formatting utilities
│   │   └── validation/         # Input validation
│   ├── types/                  # Global types
│   │   ├── common.ts
│   │   └── api.ts
│   └── constants/              # App-wide constants
│       └── config.ts
│
├── App.tsx                     # Root component
├── main.tsx                    # Entry point
└── router.tsx                  # Routing (if needed)
```

**Feature Module Rules**:

1. **Self-Contained**: Each feature owns its components, hooks, services, and types
2. **Public API**: Only export through `index.ts` (controlled surface area)
3. **Dependencies**: Features can depend on `shared/` but NOT on other features
4. **Communication**: Inter-feature communication via hooks or events (no direct imports)
5. **Colocation**: Keep related code together (tests next to implementation)
6. **Naming**: Feature folders use kebab-case, files use PascalCase/camelCase

#### Code Organization Rules
- **Maximum function length**: 50 lines (extract if longer)
- **Maximum file length**: 300 lines (split if longer)
- **Maximum component props**: 7 props (use composition if more)
- **Maximum function parameters**: 4 parameters (use objects if more)
- **Cyclomatic complexity**: <10 per function
- **File naming**:
  - Components: PascalCase (`ChatMessage.tsx`)
  - Hooks: camelCase with `use` prefix (`useChat.ts`)
  - Services: camelCase (`aiService.ts`)
  - Types: PascalCase (`Message.ts`)

#### Dependency Rules (Feature-Based)

**Import Hierarchy** (dependencies flow downward only):
```
App/Router
    ↓
Features (chat, corrections, suggestions, etc.)
    ↓
Shared (components, hooks, lib, types)
```

**Allowed Dependencies**:
- ✅ **App** can import: `features/*`, `shared/*`
- ✅ **Features** can import: `shared/*` (components, hooks, lib, types)
- ✅ **Features** can import: Other features' **public API only** (`features/*/index.ts`)
- ✅ **Shared** can import: Nothing from `features/` (must stay generic)
- ✅ **Within a feature**: components → hooks → services → types
- ✅ **Shared/lib**: Pure utilities (no side effects, no imports from app)

**Forbidden Dependencies**:
- ❌ Feature → Feature (direct internal imports, bypass index.ts)
- ❌ Shared → Features (breaks reusability)
- ❌ Circular dependencies (any level)
- ❌ Upward dependencies (lower layer importing higher layer)

**Inter-Feature Communication**:
- Via hooks exposed in public API (`features/chat/index.ts`)
- Via events/pub-sub pattern (for loosely coupled features)
- Via shared state management (if absolutely necessary)
- Never by direct component/service imports

### VIII. Critical Path Testing Only
**Test what matters: AI interactions, level detection, and user experience flows.**

- E2E tests for critical user journeys
- Unit tests for level detection algorithms
- Integration tests for AI provider abstraction
- Visual regression tests for UI consistency
- Performance tests enforced in CI
- Accessibility tests automated
- No testing theatre (if it doesn't prevent bugs, don't test it)

## Technical Standards

### Technology Stack
- **Frontend**: React 18+ with Vite
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS (mobile-first utility classes)
- **State**: React Context + Local Storage sync
- **API**: Node.js with Express or Hono
- **AI Integration**: Provider abstraction layer
- **Testing**: Vitest + Playwright
- **Build**: Vite with aggressive optimization
- **Deployment**: Vercel/Netlify (frontend), Railway/Fly.io (backend optional)

### Code Quality Requirements
- TypeScript strict mode enabled
- ESLint + Prettier enforced
- No `any` types (use `unknown` and narrow)
- Functional components only (hooks-based)
- Immutable data patterns (no direct mutations)
- Descriptive variable names (no abbreviations)
- Pure functions preferred (easier to test and reason about)
- Error handling: explicit (no silent failures)
- Comments: explain WHY, not WHAT (code should be self-documenting)

### Performance Requirements
- Lighthouse score: 95+ (all categories)
- Core Web Vitals: Green across the board
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- Bundle size budget enforced
- Image optimization mandatory (WebP, lazy loading)
- Font loading optimized (FOUT strategy)

## User Experience Principles

### Conversational Interface
- Chat is the primary and only interface
- Natural language input (no forms)
- Typing indicators and presence cues
- Message status (sending, sent, error)
- Smooth scroll and auto-scroll to new messages
- Smart input handling (Enter to send, Shift+Enter for newline)
- Voice input support (optional enhancement)

### Feedback & Corrections
- Inline corrections appear contextually
- Non-intrusive suggestions (dismissible)
- Explanations on demand (tap to expand)
- Positive reinforcement for progress
- Error highlighting without breaking flow
- Grammar/vocabulary hints color-coded
- Progress indicators subtle and unobtrusive

### Delightful Details
- Smooth animations (springs, not linear easing)
- Haptic feedback on mobile
- Sound effects (optional, user-controlled)
- Contextual emoji reactions
- Dark mode support (respects system preference)
- Loading states are never boring (skeleton screens)
- Error messages are helpful and human

## Development Workflow

### Feature Development
1. Clarify user value and acceptance criteria
2. Design architecture (which layer: component/hook/service?)
3. Define interfaces and types first
4. Implement with TypeScript + tests for critical paths
5. Code review focused on SOLID principles
6. Test on real devices (iOS Safari, Android Chrome)
7. Performance audit (Lighthouse)
8. Accessibility audit (axe DevTools)
9. Deploy to staging for user testing

### Code Review Checklist
- [ ] Follows SOLID principles?
- [ ] Single Responsibility respected?
- [ ] No code duplication (DRY)?
- [ ] Simple and readable (KISS)?
- [ ] Proper separation of concerns?
- [ ] Dependencies point downward only?
- [ ] TypeScript types are precise?
- [ ] Performance impact considered?
- [ ] Accessibility requirements met?
- [ ] Mobile experience tested?

### Quality Gates
- All builds must pass TypeScript compilation
- Critical tests must pass (no flaky tests allowed)
- ESLint and Prettier checks must pass
- Performance budgets must be met
- Accessibility automated tests must pass
- No console errors or warnings in production
- Bundle size must be under budget
- Cyclomatic complexity under threshold

### Continuous Improvement
- Monitor real user performance (RUM)
- A/B test UX improvements
- Regular performance audits
- User feedback loop (in-app)
- Weekly dependency updates
- Quarterly architecture review
- Regular refactoring sessions (pay technical debt)

## Governance

This constitution is the single source of truth for technical and product decisions. All features, refactors, and technical choices must align with these principles.

**Amendments require**:
- Clear justification with user impact
- Team consensus (if applicable)
- Documentation update
- Migration plan for existing code

**Priority order**: Performance > Simplicity > Maintainability > Features > Aesthetics

**When in doubt**:
- Ship less, optimize more, listen to users
- Simpler code wins
- Extract and abstract when you see patterns (3 strikes rule)
- Refactor before adding features to poorly designed code

**Technical Debt**:
- Track in issues with `tech-debt` label
- Allocate 20% of sprint capacity to refactoring
- Never ship with known security or accessibility issues
- Performance regressions block deployment

---

**Version**: 1.0.0 | **Ratified**: 2025-11-15 | **Last Amended**: 2025-11-15
