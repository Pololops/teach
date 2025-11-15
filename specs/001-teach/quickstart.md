# Quickstart Guide: Teach Development

**Date**: 2025-11-15
**Branch**: 001-teach

## Overview

This quickstart guide helps developers set up the Teach development environment and understand the key architectural decisions.

## Prerequisites

- **Node.js**: 20.x or later
- **pnpm**: 8.x or later (preferred) or npm 10.x+
- **Git**: For version control
- **API Keys**: OpenAI and/or Anthropic API keys
- **Supabase Account**: (Optional) For cloud sync testing

## Quick Setup

### 1. Clone and Install

```bash
# Clone repository
git clone <repo-url>
cd teach

# Install dependencies (frontend)
cd frontend
pnpm install

# Install dependencies (backend - optional)
cd ../backend
pnpm install
```

### 2. Environment Configuration

**Frontend** (`frontend/.env.local`):

```bash
# AI Provider Configuration
VITE_DEFAULT_AI_PROVIDER=auto          # auto | openai | anthropic
VITE_AI_PROXY_URL=http://localhost:3000/v1  # Backend proxy URL

# Supabase (Optional - for cloud sync)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Performance Monitoring (Optional)
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

**Backend** (`backend/.env`):

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# AI Provider API Keys (NEVER commit these!)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Supabase Configuration (Optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000  # 1 hour
RATE_LIMIT_MAX_REQUESTS=100   # Max requests per window
```

### 3. Start Development Servers

**Terminal 1 - Frontend**:
```bash
cd frontend
pnpm dev
# Opens on http://localhost:5173
```

**Terminal 2 - Backend** (Optional - for AI proxy):
```bash
cd backend
pnpm dev
# Runs on http://localhost:3000
```

### 4. Verify Setup

Open browser to `http://localhost:5173`:
- You should see the chat interface
- Type a message in English
- AI should respond within 2 seconds

## Architecture Overview

### Local-First Design

**Primary Storage**: IndexedDB (client-side)
- All conversations stored locally by default
- No backend required for core functionality
- Works offline with graceful degradation

**Optional Cloud Sync**: Supabase
- User explicitly opts in
- Syncs conversations and progress across devices
- Backend only needed for sync and AI proxy

### Feature-Based Structure

```
frontend/src/
├── features/               # Self-contained feature modules
│   ├── chat/              # P1: Core conversation
│   ├── level-detection/   # P2: CEFR assessment
│   ├── ai-provider/       # AI abstraction layer
│   ├── corrections/       # P2: Grammar/vocabulary
│   ├── suggestions/       # P2: Contextual help
│   ├── progress/          # P4: Metrics tracking
│   └── auth/              # Optional authentication
└── shared/                # Reusable utilities
    ├── components/        # UI primitives
    ├── hooks/             # Generic hooks
    └── lib/               # Pure utilities
```

**Dependency Flow**: App → Features → Shared (downward only)

## Key Technologies

| Category | Technology | Why? |
|----------|-----------|------|
| **Frontend Framework** | React 18+ | Hooks, Concurrent features |
| **Build Tool** | Vite 5+ | Fast HMR, optimized builds |
| **Language** | TypeScript 5.0+ | Type safety, better DX |
| **Styling** | Tailwind CSS | Mobile-first utilities |
| **Storage** | Dexie.js (IndexedDB) | Local-first, reactive |
| **AI** | OpenAI + Anthropic SDKs | Provider flexibility |
| **Backend** | Hono | Lightweight, edge-ready |
| **Database** | Supabase (PostgreSQL) | Auth + DB + Realtime |
| **Testing** | Vitest + Playwright | Fast, comprehensive |

## Development Workflow

### 1. Create New Feature

Follow feature-based architecture:

```bash
cd frontend/src/features
mkdir my-feature
cd my-feature

# Create structure
mkdir components hooks services types
touch index.ts
```

**Feature Template** (`index.ts`):
```typescript
// Public API - only export what other features need
export { MyFeatureComponent } from './components/MyFeatureComponent';
export { useMyFeature } from './hooks/useMyFeature';
export type { MyFeatureData } from './types';
```

### 2. Component Guidelines

**Example Component** (`ChatMessage.tsx`):
```typescript
import { FC } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const ChatMessage: FC<ChatMessageProps> = ({ role, content, timestamp }) => {
  return (
    <div className={`message ${role}`}>
      <p>{content}</p>
      <span>{new Date(timestamp).toLocaleTimeString()}</span>
    </div>
  );
};
```

**Rules**:
- Max 7 props (use composition if more)
- Max 50 lines per function
- Max 300 lines per file
- TypeScript strict mode

### 3. Service Pattern

**Example Service** (`chatService.ts`):
```typescript
import { db } from '@/shared/lib/storage/db';
import type { Message, Conversation } from './types';

export const chatService = {
  async getMessages(conversationId: string): Promise<Message[]> {
    return db.messages
      .where('conversationId')
      .equals(conversationId)
      .sortBy('timestamp');
  },

  async addMessage(message: Omit<Message, 'id'>): Promise<Message> {
    const id = crypto.randomUUID();
    const newMessage = { ...message, id };
    await db.messages.add(newMessage);
    return newMessage;
  },
};
```

### 4. Testing Strategy

**Unit Tests** (Vitest):
```typescript
import { describe, it, expect } from 'vitest';
import { detectCEFRLevel } from './levelDetectionService';

describe('detectCEFRLevel', () => {
  it('detects A1 for simple vocabulary', () => {
    const text = 'Hello. My name is John. I am student.';
    const level = detectCEFRLevel(text);
    expect(level).toBe('A1');
  });
});
```

**E2E Tests** (Playwright):
```typescript
import { test, expect } from '@playwright/test';

test('user can send message and receive response', async ({ page }) => {
  await page.goto('/');

  await page.fill('[data-testid="message-input"]', 'Hello, how are you?');
  await page.click('[data-testid="send-button"]');

  // Wait for AI response
  await expect(page.locator('[data-testid="assistant-message"]').first())
    .toBeVisible({ timeout: 3000 });
});
```

**Accessibility Tests**:
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('chat interface is accessible', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy load non-critical features
const ProgressDashboard = lazy(() => import('@/features/progress'));
const AuthForm = lazy(() => import('@/features/auth'));
```

### Streaming AI Responses

```typescript
// Frontend hook
const useStreamingAI = (messages: Message[], targetLevel: CEFRLevel) => {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const streamResponse = async () => {
    setIsStreaming(true);
    const eventSource = new EventSource('/api/chat/stream', {
      method: 'POST',
      body: JSON.stringify({ messages, targetLevel }),
    });

    eventSource.onmessage = (event) => {
      if (event.data === '[DONE]') {
        eventSource.close();
        setIsStreaming(false);
      } else {
        const { content } = JSON.parse(event.data);
        setResponse((prev) => prev + content);
      }
    };
  };

  return { response, isStreaming, streamResponse };
};
```

### Bundle Size Monitoring

```bash
# Analyze bundle
pnpm build
pnpm run analyze

# Check bundle size (must be <200KB gzipped)
```

## Common Tasks

### Add New AI Provider

1. Create provider implementation:
```typescript
// frontend/src/features/ai-provider/providers/newprovider.ts
import type { AIProvider } from './base';

export class NewProvider implements AIProvider {
  async sendMessage(messages: Message[]): Promise<string> {
    // Implementation
  }

  async *streamResponse(messages: Message[]): AsyncGenerator<string> {
    // Implementation
  }
}
```

2. Register in provider factory:
```typescript
// frontend/src/features/ai-provider/services/providerService.ts
import { NewProvider } from '../providers/newprovider';

export const getProvider = (name: string): AIProvider => {
  switch (name) {
    case 'newprovider': return new NewProvider();
    // ...
  }
};
```

### Implement CEFR Detection

See `research.md` for algorithm details:
- Rule-based heuristics (vocabulary, grammar, sentence length)
- LLM-assisted assessment (periodic, every 5 messages)
- Adaptive difficulty adjustment

### Add Cloud Sync

1. Enable in user preferences
2. Configure Supabase environment variables
3. Implement sync service:

```typescript
// frontend/src/features/sync/services/syncService.ts
import { supabase } from '@/shared/lib/supabase';
import { db } from '@/shared/lib/storage/db';

export const syncService = {
  async syncConversations(): Promise<void> {
    const local = await db.conversations.toArray();
    const { data: remote } = await supabase
      .from('conversations')
      .select('*');

    // Merge strategy: last-write-wins by updatedAt
  },
};
```

## Debugging

### Performance Issues

```typescript
// Use React DevTools Profiler
import { Profiler } from 'react';

<Profiler id="Chat" onRender={(id, phase, duration) => {
  if (duration > 16) console.warn(`Slow render: ${id} took ${duration}ms`);
}}>
  <Chat />
</Profiler>
```

### IndexedDB Inspection

1. Open Chrome DevTools
2. Application tab → IndexedDB → TeachDB
3. Browse tables: users, conversations, messages, progressMetrics

### AI Response Issues

Check backend logs:
```bash
cd backend
pnpm logs
```

Test AI providers:
```bash
curl -X POST http://localhost:3000/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}], "targetLevel": "B1"}'
```

## Resources

- **Specification**: `specs/001-teach/spec.md`
- **Data Model**: `specs/001-teach/data-model.md`
- **Research**: `specs/001-teach/research.md`
- **API Contracts**: `specs/001-teach/contracts/api.yaml`
- **Constitution**: `.specify/memory/constitution.md`

## Next Steps

1. Read the [full specification](./spec.md)
2. Review [architecture decisions](./research.md)
3. Explore [data model](./data-model.md)
4. Check [constitution principles](../../.specify/memory/constitution.md)
5. Start with P1 user story: Natural AI Conversation

## Getting Help

- Check constitution for design principles
- Review research.md for technology choices
- See data-model.md for entity relationships
- Refer to API contracts for endpoint details

---

**Ready to code!** Start with the chat feature (P1) and iterate from there.
