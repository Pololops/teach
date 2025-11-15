# Data Model: Teach - AI English Learning Chat

**Date**: 2025-11-15
**Branch**: 001-teach

## Overview

This document defines the core data entities, their relationships, validation rules, and state transitions for the Teach application. The model supports local-first architecture with optional cloud sync.

## Entity Definitions

### 1. User

Represents a French-speaking English learner.

**Attributes**:
- `id`: string (UUID) - Unique identifier (generated client-side)
- `displayName`: string (optional) - User's preferred name
- `currentLevel`: CEFRLevel (enum) - Current assessed English proficiency
- `createdAt`: timestamp - Account creation date
- `updatedAt`: timestamp - Last profile update
- `preferences`: UserPreferences (object) - User settings

**MVP Note**: No authentication required. User entity represents anonymous local user stored in IndexedDB.

**CEFRLevel Enum**:
```typescript
type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
```

**UserPreferences Object**:
```typescript
interface UserPreferences {
  theme: 'light' | 'dark' | 'system'; // UI theme
  showCorrections: boolean;           // Display inline corrections
  showSuggestions: boolean;           // Display contextual suggestions
  aiProvider: 'openai' | 'anthropic' | 'auto'; // Preferred AI provider
}
```

**MVP Note**: `cloudSyncEnabled` removed - no cloud sync in MVP.

**Validation Rules**:
- `displayName`: 1-50 characters, alphanumeric + spaces (optional)
- `currentLevel`: Must be valid CEFR level (default: 'A1')
- `id`: Generated via crypto.randomUUID() on first app load

**Relationships**:
- One User has many Conversations
- One User has one ProgressMetrics record

**Storage**:
- **Local**: IndexedDB `users` table (single record for current user)
- **Cloud**: Not in MVP (Phase 2 feature)

---

### 2. Conversation

Represents a chat session between user and AI.

**Attributes**:
- `id`: string (UUID) - Unique identifier
- `userId`: string (UUID) - Reference to User
- `title`: string - Auto-generated from first message (e.g., "Conversation about travel")
- `difficultyLevel`: CEFRLevel - Starting difficulty level for this conversation
- `createdAt`: timestamp - When conversation started
- `updatedAt`: timestamp - Last message timestamp
- `messageCount`: number - Total messages in conversation
- `status`: ConversationStatus (enum) - Current state

**ConversationStatus Enum**:
```typescript
type ConversationStatus = 'active' | 'archived' | 'deleted';
```

**Validation Rules**:
- `title`: 1-100 characters
- `difficultyLevel`: Must be valid CEFR level
- `messageCount`: Non-negative integer
- `status`: Cannot transition from 'deleted' to other states

**State Transitions**:
```
active → archived (user archives conversation)
active → deleted (user deletes conversation)
archived → active (user restores conversation)
archived → deleted (user deletes archived conversation)
```

**Relationships**:
- One Conversation belongs to one User
- One Conversation has many Messages

**Storage**:
- **Local**: IndexedDB `conversations` table
- **Cloud**: Supabase `conversations` table (if sync enabled)

**Indexes**:
- `userId, createdAt` (for fetching user's conversations sorted by date)
- `status` (for filtering active/archived conversations)

---

### 3. Message

Individual exchange in a conversation.

**Attributes**:
- `id`: string (UUID) - Unique identifier
- `conversationId`: string (UUID) - Reference to Conversation
- `role`: MessageRole (enum) - Who sent the message
- `content`: string - Message text
- `timestamp`: timestamp - When message was sent
- `metadata`: MessageMetadata (object) - Additional data for analysis

**MessageRole Enum**:
```typescript
type MessageRole = 'user' | 'assistant' | 'system';
```

**MessageMetadata Object**:
```typescript
interface MessageMetadata {
  // For user messages
  detectedLevel?: CEFRLevel;          // CEFR level detected from user's text
  vocabularyComplexity?: number;      // 0-1 score
  grammarAccuracy?: number;           // 0-1 score
  sentenceLength?: number;            // Avg words per sentence
  errorCount?: number;                // Number of detected errors

  // For assistant messages
  targetLevel?: CEFRLevel;            // Level AI is targeting
  vocabularyUsed?: string[];          // New vocabulary introduced

  // For both
  corrections?: Correction[];         // Grammar/vocabulary corrections
  suggestions?: Suggestion[];         // Contextual suggestions
}
```

**Validation Rules**:
- `content`: 1-5000 characters (prevent abuse)
- `role`: Must be valid MessageRole
- `timestamp`: Cannot be in the future
- `metadata.detectedLevel`: Must be valid CEFR level if present
- `metadata.vocabularyComplexity`: 0-1 range
- `metadata.grammarAccuracy`: 0-1 range

**Relationships**:
- One Message belongs to one Conversation
- One Message has many Corrections (embedded in metadata)
- One Message has many Suggestions (embedded in metadata)

**Storage**:
- **Local**: IndexedDB `messages` table
- **Cloud**: Supabase `messages` table (stored as JSONB in conversations.messages)

**Indexes**:
- `conversationId, timestamp` (for fetching conversation messages in order)

---

### 4. Correction

Grammar or vocabulary correction suggestion.

**Attributes**:
- `id`: string (UUID) - Unique identifier
- `type`: CorrectionType (enum) - Category of correction
- `original`: string - User's original text
- `suggested`: string - Corrected version
- `explanation`: string - Why this correction (in simple English)
- `severity`: CorrectionSeverity (enum) - How critical the error is
- `position`: TextPosition (object) - Location in message

**CorrectionType Enum**:
```typescript
type CorrectionType =
  | 'grammar'       // Grammar mistakes (tense, agreement, etc.)
  | 'spelling'      // Spelling errors
  | 'vocabulary'    // Word choice, better alternatives
  | 'punctuation'   // Punctuation errors
  | 'style';        // Stylistic improvements
```

**CorrectionSeverity Enum**:
```typescript
type CorrectionSeverity =
  | 'critical'   // Prevents understanding (e.g., wrong verb tense changes meaning)
  | 'major'      // Noticeable error but message understood
  | 'minor';     // Stylistic improvement, message clear
```

**TextPosition Object**:
```typescript
interface TextPosition {
  start: number;  // Character index start
  end: number;    // Character index end
}
```

**Validation Rules**:
- `original`: Must be non-empty substring of message content
- `suggested`: Must differ from original
- `explanation`: 10-200 characters
- `severity`: Must be valid CorrectionSeverity
- `position.start`: < position.end
- `position.end`: <= message.content.length

**Relationships**:
- Many Corrections belong to one Message (embedded in metadata)

**Storage**:
- **Embedded**: Stored in Message.metadata.corrections (not separate table)

---

### 5. Suggestion

Contextual suggestion to help user continue conversation.

**Attributes**:
- `id`: string (UUID) - Unique identifier
- `type`: SuggestionType (enum) - Category of suggestion
- `text`: string - Suggested phrase or word
- `context`: string - When to use this (in simple English)
- `level`: CEFRLevel - Difficulty level of this suggestion

**SuggestionType Enum**:
```typescript
type SuggestionType =
  | 'vocabulary'    // New word to learn
  | 'phrase'        // Common phrase or idiom
  | 'response'      // How to respond to AI's question
  | 'question';     // Question user could ask to continue conversation
```

**Validation Rules**:
- `text`: 1-200 characters
- `context`: 10-300 characters
- `level`: Must be valid CEFR level
- `level`: Should be at or slightly above user's current level (for progressive challenge)

**Relationships**:
- Many Suggestions belong to one Message (embedded in metadata)

**Storage**:
- **Embedded**: Stored in Message.metadata.suggestions (not separate table)

---

### 6. ProgressMetrics

Quantifiable learning indicators for a user.

**Attributes**:
- `userId`: string (UUID) - Reference to User (primary key)
- `currentLevel`: CEFRLevel - Latest assessed level
- `levelHistory`: LevelChange[] - Level progression over time
- `totalConversations`: number - Total conversations started
- `totalMessages`: number - Total messages sent
- `totalTime`: number - Total conversation time (seconds)
- `vocabularyEncountered`: string[] - Unique words seen
- `vocabularyMastered`: string[] - Words user uses correctly
- `topicsDiscussed`: string[] - Conversation topics
- `lastActive`: timestamp - Last conversation timestamp
- `createdAt`: timestamp - When tracking started
- `updatedAt`: timestamp - Last metric update

**LevelChange Object**:
```typescript
interface LevelChange {
  level: CEFRLevel;
  timestamp: timestamp;
  confidence: number;  // 0-1 confidence score
}
```

**Validation Rules**:
- `currentLevel`: Must be valid CEFR level
- `totalConversations`: Non-negative integer
- `totalMessages`: Non-negative integer
- `totalTime`: Non-negative integer
- `vocabularyEncountered`: Unique list of lowercase words
- `vocabularyMastered`: Subset of vocabularyEncountered
- `levelHistory`: Ordered by timestamp ascending

**Computed Properties** (not stored, calculated on read):
```typescript
interface ComputedMetrics {
  averageMessagesPerConversation: number;  // totalMessages / totalConversations
  averageSessionDuration: number;          // totalTime / totalConversations
  vocabularyGrowthRate: number;            // new words per hour
  currentStreak: number;                   // consecutive days active
  longestStreak: number;                   // max consecutive days
}
```

**Relationships**:
- One ProgressMetrics belongs to one User

**Storage**:
- **Local**: IndexedDB `progress_metrics` table (single record per user)
- **Cloud**: Supabase `progress_metrics` table (if sync enabled)

---

## Entity Relationship Diagram

```
User (1) ───< has many >───< Conversation (many)
  │                              │
  │                              │
  └─< has one >─ ProgressMetrics │
                                 │
                Conversation (1) ─< has many >─ Message (many)
                                                     │
                                                     ├─ corrections[] (embedded)
                                                     └─ suggestions[] (embedded)
```

## IndexedDB Schema

```typescript
class TeachDB extends Dexie {
  users!: Table<User>;
  conversations!: Table<Conversation>;
  messages!: Table<Message>;
  progressMetrics!: Table<ProgressMetrics>;

  constructor() {
    super('TeachDB');

    this.version(1).stores({
      users: 'id, email',
      conversations: 'id, userId, status, createdAt, updatedAt',
      messages: 'id, conversationId, timestamp',
      progressMetrics: 'userId, lastActive',
    });
  }
}
```

**Indexes Rationale**:
- `users.id`: Primary key, fast lookup by ID
- `users.email`: Find user by email for authentication
- `conversations.userId`: Filter conversations by user
- `conversations.status`: Filter active/archived conversations
- `conversations.createdAt`: Sort by date
- `messages.conversationId`: Fetch all messages in conversation
- `messages.timestamp`: Sort messages chronologically
- `progressMetrics.userId`: Primary key, one record per user

## Phase 2: Cloud Sync Schema

**Status**: Out of scope for MVP

The MVP uses IndexedDB exclusively (local-first, no authentication). For future cloud sync schema design (Supabase PostgreSQL), see:

📄 **[data-model-phase2.md](./data-model-phase2.md)**

This separation keeps the MVP implementation documentation focused on what developers actually need to build.

---

## Data Validation Summary

| Entity | Critical Validations |
|--------|---------------------|
| **User** | CEFR level enum (default A1), displayName optional 1-50 chars, UUID generated client-side |
| **Conversation** | Status transitions (active → archived → deleted), non-negative message count |
| **Message** | Content 1-5000 chars, timestamp not in future, metadata scores 0-1 |
| **Correction** | Original substring of message, position within bounds, non-empty explanation |
| **Suggestion** | Level appropriate for user (current or +1), context explains when to use |
| **ProgressMetrics** | Vocabulary mastered ⊆ encountered, level history ordered by time |

## Migration & Versioning

**IndexedDB Versioning**:
- Version 1: Initial schema (users, conversations, messages, progressMetrics)
- Future versions: Use Dexie migration API

**Supabase Migrations** (Phase 2 only):
- See `data-model-phase2.md` for cloud sync schema
- Not applicable to MVP

## Privacy Considerations

**Local-First (MVP)**:
- All data stored in IndexedDB (client-side)
- No server communication for data storage (AI proxy only)
- Fully anonymous - no user accounts or authentication

**Cloud Sync** (Phase 2 only):
- See `data-model-phase2.md` for future cloud sync privacy model
- Not in MVP scope

**Data Export**:
- Users can export all data as JSON
- Implement "Download my data" feature for GDPR compliance

**Data Deletion** (MVP):
- Local: Clear IndexedDB on user request
- No cloud data to delete (local-first only)

## Next Steps

Data model complete. Ready to proceed to **API Contracts** generation.
