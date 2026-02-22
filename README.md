# 🎓 Teach

**Master English Through Natural Conversation**

> An AI-powered language learning platform that feels like chatting with a real person — intuitive, adaptive, and built for the way you actually learn.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB.svg)](https://reactjs.org/)
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

---

## ✨ Why Teach?

Learning a new language shouldn't feel like studying. It should feel like **having a conversation**.

Teach transforms English learning for French speakers by creating an experience that's as natural as texting a friend — except this friend is an AI tutor that:

- 🎯 **Adapts to Your Level** — Automatically adjusts difficulty from beginner (A1) to advanced (C2)
- ⚡ **Responds Instantly** — Sub-2-second responses that maintain natural conversation flow
- 💬 **Feels Human** — No robotic scripts, just genuine, contextual conversations
- 🔒 **Protects Your Privacy** — Everything stays in your browser. No accounts, no tracking
- 📊 **Tracks Your Growth** — Watch your vocabulary expand and proficiency improve over time
- 🎨 **Looks Beautiful** — A clean, intuitive interface that makes you want to practice daily

---

## 🚀 Experience It Yourself

### The Magic in Action

**1. Start Chatting Immediately**  
No sign-up. No configuration. Just open the app and start typing in English.

**2. Real-Time Intelligence**  
Every message you send helps Teach understand your level. Within minutes, conversations adapt to challenge you perfectly — not too easy, not too hard.

**3. Learn As You Go**  
Inline corrections appear subtly in your messages. Hover to learn, or ignore them and keep the conversation flowing. Your choice.

**4. See Your Progress**  
Open your dashboard to see how many words you've learned, how long you've practiced, and how your English level has improved.

---

## 🎯 Perfect For

- **🇫🇷 French Speakers** looking to practice English conversation naturally
- **📱 Mobile Learners** who want to practice anywhere, anytime
- **🎓 Self-Directed Students** who prefer immersion over formal lessons
- **⏱️ Busy Professionals** seeking micro-learning opportunities throughout the day
- **🔐 Privacy-Conscious Users** who want to keep their data local

---

## 🛠️ Built With Excellence

### Modern Tech Stack

```text
Frontend    React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4
Backend     Hono 4 + Vercel AI SDK
Storage     IndexedDB (Dexie.js) — Local-first, zero-config
AI          OpenAI + Anthropic (provider-agnostic)
Testing     Vitest + Playwright + axe-core
```

### Architecture Highlights

- **🏗️ Feature-Based Structure** — Clean, modular, SOLID principles
- **⚡ Performance-First** — <2s load time, 60fps animations, <200KB bundle
- **📱 Mobile-First Design** — Responsive from 375px to 4K displays
- **♿ Accessibility Built-In** — WCAG 2.1 AA compliant
- **🌐 AI Provider Agnostic** — Switch between OpenAI, Anthropic, or others seamlessly

---

## 📦 Quick Start

### Prerequisites

```bash
Node.js 25.2+
pnpm 10.22+
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd teach

# Install dependencies (uses pnpm workspaces)
pnpm install

# Set up environment variables
cp apps/backend/.env.example apps/backend/.env
# Add your OpenAI or Anthropic API key

# Start the development servers
pnpm dev
```

**That's it!** Open `http://localhost:5173` and start learning.

---

## 🎮 How It Works

### For Learners

1. **Open & Chat** — Start typing in English. The AI asks what you'd like to talk about.
2. **Stay Immersed** — All responses are in English, with gentle encouragement if you switch to French.
3. **Get Corrections** — See your mistakes highlighted inline. Click for explanations.
4. **Track Progress** — View your vocabulary growth, conversation time, and level progression.

### For Developers

```text
teach/
├── apps/
│   ├── frontend/          # React SPA with feature-based architecture
│   │   └── src/
│   │       ├── features/  # Self-contained modules
│   │       │   ├── chat/              # Core conversation (P1)
│   │       │   ├── level-detection/   # CEFR assessment (P2)
│   │       │   ├── corrections/       # Grammar/vocabulary (P2)
│   │       │   ├── suggestions/       # Contextual hints (P2)
│   │       │   └── progress/          # Metrics tracking (P4)
│   │       └── shared/    # Reusable components & utilities
│   │
│   └── backend/           # Hono API proxy (AI abstraction)
│       └── src/
│           ├── routes/    # API endpoints
│           └── lib/ai/    # Provider abstraction layer
│
├── packages/
│   └── shared/            # Common types (frontend ↔ backend)
│
└── tests/                 # E2E tests (Playwright)
```

**Architecture Principle**: Features → Shared (downward dependencies only)

---

## 🌟 Key Features

### 💬 Natural AI Conversations

- **Lightning Fast**: Sub-2-second responses maintain conversation flow
- **Context Aware**: Remembers what you've discussed across messages
- **Human-Like**: Responses feel conversational, not scripted

### 📈 Intelligent Adaptation

- **CEFR Level Detection**: Automatic assessment from A1 (beginner) to C2 (mastery)
- **Dynamic Difficulty**: Vocabulary and complexity adjust in real-time
- **No Manual Settings**: Just start chatting — the AI figures it out

### ✏️ Inline Learning

- **Grammar Corrections**: Subtle colored underlining in your messages
- **On-Demand Explanations**: Hover or click to learn more
- **Non-Intrusive**: Never interrupts the conversation flow

### 📊 Progress Tracking

- **Vocabulary Growth**: See new words you've encountered
- **Time Invested**: Track total conversation time
- **Level Progression**: Watch your CEFR level improve over time
- **Visual Insights**: Beautiful charts and milestones

### 🔐 Privacy-First

- **Local-First Storage**: All data stays in your browser (IndexedDB)
- **No Authentication**: Use anonymously — no account required
- **No Tracking**: Your conversations are yours alone
- **Offline-Ready**: Works without internet (graceful degradation)

---

## 🎨 Design Philosophy

### The Teach Principles

1. **⚡ Performance-First** — Speed is a feature. Every interaction feels instant.
2. **🎯 Radical Simplicity** — Zero friction. Zero configuration. Just conversation.
3. **📱 Mobile-First** — Designed for your phone. Beautiful on desktop.
4. **🤖 AI-Agnostic** — Not locked into one provider. Flexibility built in.
5. **🔒 Privacy-First** — Your data never leaves your device.
6. **🎓 Intelligent Adaptation** — Learns from every message you send.
7. **🏗️ Clean Architecture** — SOLID principles. Maintainable. Testable.
8. **✅ Test What Matters** — Critical paths covered. No test theater.

---

## 🚦 Getting Started (Development)

### Development Workflow

```bash
# Run all tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Build for production
pnpm build
```

### Adding a New Feature

1. **Create feature module**: `apps/frontend/src/features/my-feature/`
2. **Structure it properly**:

   ```text
   my-feature/
   ├── components/       # UI components
   ├── hooks/            # React hooks
   ├── services/         # Business logic
   ├── types/            # TypeScript types
   └── index.ts          # Public API exports
   ```

3. **Follow the rules**:
   - Max 7 props per component
   - Max 50 lines per function
   - Max 300 lines per file
   - TypeScript strict mode

### Testing Strategy

- **Unit Tests** (Vitest) — Pure logic, algorithms (CEFR detection, corrections)
- **Integration Tests** — Feature interactions
- **E2E Tests** (Playwright) — Critical user journeys
- **Accessibility Tests** (axe-core) — WCAG 2.1 AA compliance
- **Performance Tests** — Bundle size, load time, Core Web Vitals

---

## 🎯 Roadmap

### ✅ MVP (Current)

- [x] Natural AI conversations
- [x] Automatic difficulty adaptation
- [x] Inline grammar corrections
- [x] Progress tracking
- [x] Local-first storage
- [x] Mobile-responsive design

### 🚧 Coming Soon

- [ ] Voice conversations (speech-to-text/text-to-speech)
- [ ] Topic-specific scenarios (travel, business, casual)
- [ ] Vocabulary flashcards from your conversations
- [ ] Pronunciation feedback
- [ ] Learning streaks & gamification
- [ ] Optional cloud sync (multi-device)

### 🔮 Future Vision

- [ ] Multiple language support (beyond English)
- [ ] Peer-to-peer conversation practice
- [ ] Teacher dashboards for classroom use
- [ ] TOEFL/IELTS preparation mode
- [ ] Native mobile apps (iOS/Android)

---

## 🤝 Contributing

We welcome contributions! Teach is built on principles of:

- **Clean Code** — SOLID, DRY, KISS
- **Performance** — Every millisecond matters
- **Accessibility** — Everyone deserves access
- **Privacy** — User data is sacred
- **Simplicity** — Less is more

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow the code style**: TypeScript strict mode, max 50 lines/function
4. **Write tests**: Unit + E2E for critical paths
5. **Submit a PR**: Clear description, linked issues

---

## 📄 License

**Mozilla Public License 2.0 (MPL-2.0)**

This project is licensed under the MPL-2.0 — a copyleft license that:

- ✅ Allows commercial use
- ✅ Allows modification and distribution
- ✅ Provides patent protection
- ⚠️ Requires source disclosure for modifications
- ⚠️ Maintains the same license for modifications

See [LICENSE](./LICENSE) for full details.

---

## 🙏 Acknowledgments

Built with love for language learners everywhere.

**Technologies**: React, TypeScript, Vite, Hono, OpenAI, Anthropic, Dexie.js, Tailwind CSS, Shadcn UI

**Inspiration**: The belief that natural conversation is the best way to learn a language.
