# Feature Specification: Teach - AI English Learning Chat

**Feature Branch**: `001-teach`
**Created**: 2025-11-15
**Status**: Draft
**Input**: User description: "créons une web app pour apprendre la langue anglaise à des français. Elle se présentera sous la forme d'un chat afin de converser avec une IA, en anglais. Les type et niveau de difficulté de ces discussion sera défini intelligement et automatiquement en fonction du niveau d'anglais de l'utilisateur. Cette web app doit être extrêment simple, intuitive, optimisée et réactive afin de donner la sensation de discuter réallement avec un véritable humain. Et avoir une interface user friendly, intuitive, simple, attrayante et ludique pour susciter l'adhésion et l'envie de l'utiliser intensément."

## Clarifications

### Session 2025-11-15

- Q: When and how should grammar corrections be displayed to the user? → A: After sending the message, inline within the user's message with colored underlining and tooltip explanation on click/hover.
- Q: How should the AI initiate new conversations? → A: The AI asks the user what they want to talk about, giving full control to the user (e.g., "Hi! What would you like to talk about today?").
- Q: When is user authentication required? → A: No authentication required for this version. The app is completely anonymous by default with all data stored locally in the browser (IndexedDB). No user accounts or cloud sync in this initial version.
- Q: How do users access their progress metrics? → A: Via a button/icon in the chat interface header that opens a side panel or modal displaying the metrics, keeping users in the chat context.
- Q: How should the AI respond when the user writes in French instead of English? → A: Respond in simple, encouraging English (e.g., "I understand it's challenging! Let's try to continue in English. What would you like to talk about?") to maintain English immersion while being empathetic.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Natural AI Conversation (Priority: P1)

A French speaker wants to practice their English by having natural conversations on everyday topics. They open the app, start chatting in English, and receive responses that feel like talking to a real person - immediate, contextual, and engaging.

**Why this priority**: This is the core value proposition. Without natural, real-time conversation, the app fails its primary purpose. This alone creates a usable MVP that delivers immediate learning value.

**Independent Test**: Can be fully tested by having a user start a conversation on any topic and observing whether responses arrive within 2 seconds and feel conversationally natural (not robotic or scripted).

**Acceptance Scenarios**:

1. **Given** a user opens the app, **When** they send their first message in English, **Then** they receive a contextual response within 2 seconds that continues the conversation naturally
2. **Given** a user is having an ongoing conversation, **When** they send a message, **Then** the response acknowledges previous context and maintains conversational flow
3. **Given** a user makes a grammatical error, **When** the AI responds, **Then** the conversation continues naturally without explicitly breaking flow to correct (corrections integrated conversationally)
4. **Given** a user sends a simple greeting like "Hello", **When** the AI responds, **Then** it initiates an engaging conversation starter appropriate to language learning

---

### User Story 2 - Automatic Difficulty Adaptation (Priority: P2)

A beginner English learner shouldn't face advanced vocabulary, while an intermediate learner should be challenged appropriately. The system automatically adjusts conversation complexity based on the user's demonstrated English level without requiring manual settings.

**Why this priority**: Prevents user frustration (too hard) or boredom (too easy), maximizing learning effectiveness. However, even without this, users can still have valuable conversations (P1), making this an enhancement rather than core requirement.

**Independent Test**: Can be tested by having users at different English levels (A1, B1, C1) each have a 10-minute conversation and evaluating whether vocabulary and sentence complexity matches their demonstrated level.

**Acceptance Scenarios**:

1. **Given** a user demonstrates beginner-level English (simple vocabulary, basic grammar), **When** the AI responds, **Then** it uses simple vocabulary and short sentences appropriate for A1-A2 level
2. **Given** a user demonstrates intermediate-level English (varied vocabulary, complex sentences), **When** the AI responds, **Then** it introduces moderate complexity appropriate for B1-B2 level
3. **Given** a user's English level improves during conversation (more complex structures, better vocabulary), **When** the AI detects this improvement, **Then** it gradually increases response complexity over subsequent messages
4. **Given** a user struggles with advanced vocabulary introduced by the AI, **When** they respond with simpler language or confusion, **Then** the AI adjusts back to a more appropriate difficulty level

---

### User Story 3 - Simple and Engaging Interface (Priority: P3)

A user who may not be tech-savvy wants an interface that is immediately understandable, visually appealing, and doesn't distract from the learning experience. They should feel motivated to return daily.

**Why this priority**: Drives user retention and engagement, but the core learning value (P1, P2) can exist even with a basic interface. This enhances the experience to maximize adoption.

**Independent Test**: Can be tested through user observation - new users should be able to start their first conversation within 30 seconds of opening the app without instructions, and qualitative feedback should indicate the interface feels "simple" and "attractive".

**Acceptance Scenarios**:

1. **Given** a new user opens the app for the first time, **When** they see the interface, **Then** it is immediately clear where to start typing their message without requiring instructions or tutorials
2. **Given** a user is having a conversation, **When** they view the chat interface, **Then** messages are clearly distinguished between user and AI, with readable text and pleasant visual design
3. **Given** a user completes a conversation, **When** they view their experience, **Then** they see encouraging feedback or progress indicators that motivate continued use
4. **Given** a user accesses the app on different devices, **When** they interact with the interface, **Then** it remains responsive and usable across mobile, tablet, and desktop screens

---

### User Story 4 - Progress Tracking (Priority: P4)

A learner wants to see their improvement over time - vocabulary growth, conversation duration, topics covered - to stay motivated and understand their learning journey.

**Why this priority**: Enhances motivation and provides learning insights, but users can learn effectively even without explicit progress tracking. This is a retention and engagement feature.

**Independent Test**: Can be tested by having a user complete multiple conversations over several days and verifying they can view metrics showing their progression (e.g., vocabulary count, conversation time, level evolution).

**Acceptance Scenarios**:

1. **Given** a user has completed multiple conversations, **When** they click the progress button/icon in the chat header, **Then** a side panel or modal opens displaying metrics such as total conversation time, vocabulary encountered, and current estimated level
2. **Given** a user's English level has improved, **When** they view their progress panel, **Then** they see visual indicators of level progression over time
3. **Given** a user regularly uses the app, **When** they view their progress panel, **Then** they see encouraging milestones or achievements reached

---

### Edge Cases

- **User switches to French**: AI responds in simple, encouraging English to maintain immersion (see FR-016)
- How does the system handle very short responses or non-verbal inputs (emoji only, single word)?
- What happens when a user asks the AI to explain grammar rules in depth?
- How does the system respond if a user inputs inappropriate or off-topic content?
- What happens if the user's messages are consistently at a level that's difficult to assess (very brief, non-committal responses)?
- How does the system handle network interruptions during conversation without losing context?
- What happens when a user doesn't respond for extended periods during an active conversation?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide conversational responses in English to user messages within 2 seconds to maintain natural conversation flow
- **FR-002**: System MUST continuously assess user's English proficiency level based on vocabulary, grammar, and sentence complexity demonstrated in their messages
- **FR-003**: System MUST automatically adjust conversation difficulty (vocabulary, sentence structure, topic complexity) to match the user's current assessed English level
- **FR-004**: System MUST maintain conversation context across multiple messages to ensure coherent, natural dialogue
- **FR-005**: System MUST present a chat interface where users can type and send messages in English
- **FR-006**: System MUST distinguish between user messages and AI responses visually in the interface
- **FR-007**: System MUST provide an initial conversation starter when a user begins a new conversation by asking the user what topic they want to discuss (e.g., "Hi! What would you like to talk about today?")
- **FR-008**: System MUST allow users to start a new conversation at any time
- **FR-009**: System MUST persist user conversation history and learning progress locally in the browser (IndexedDB) across sessions without requiring authentication
- **FR-010**: System MUST be responsive and usable on mobile devices, tablets, and desktop computers
- **FR-011**: System MUST handle user input gracefully when users make spelling or grammatical errors without breaking conversation flow
- **FR-012**: System MUST provide conversation topics relevant to language learning (everyday situations, common scenarios)
- **FR-013**: System MUST integrate learning elements (vocabulary, grammar corrections) conversationally without feeling like explicit teaching unless requested
- **FR-013a**: System MUST display grammar and vocabulary corrections inline within user messages after they are sent, using colored underlining with tooltip explanations accessible on click or hover
- **FR-014**: System MUST display conversation history to users so they can review past exchanges
- **FR-015**: System MUST track user progress metrics including conversation duration, vocabulary range, and estimated proficiency level
- **FR-016**: System MUST handle edge cases where user switches to French by responding in simple, encouraging English that maintains immersion while being empathetic (e.g., "I understand it's challenging! Let's try to continue in English. What would you like to talk about?")

### Key Entities

- **User**: Represents a French-speaking learner with attributes including current English proficiency level (e.g., A1, A2, B1, B2, C1, C2), learning history, and progress metrics
- **Conversation**: Represents a chat session between user and AI, containing multiple messages, a topic context, and difficulty level settings
- **Message**: Individual exchange in a conversation, containing text content, timestamp, sender (user or AI), and metadata about language complexity
- **Proficiency Assessment**: Continuous evaluation of user's English level based on demonstrated vocabulary range, grammatical accuracy, sentence complexity, and comprehension
- **Progress Metrics**: Quantifiable learning indicators including total conversation time, vocabulary encountered, topics covered, level progression over time

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 80% of users successfully complete their first conversation lasting at least 5 minutes within their first session
- **SC-002**: AI response time is under 2 seconds for 95% of messages to maintain natural conversation feel
- **SC-003**: Users rate the conversation as feeling "natural" or "like talking to a real person" in at least 75% of post-conversation feedback
- **SC-004**: Conversation difficulty matches user proficiency level in 85% of cases as validated by language teachers reviewing conversation transcripts
- **SC-005**: Users can start a conversation within 30 seconds of opening the app without requiring help or tutorials
- **SC-006**: 60% of users return for a second conversation within 3 days of their first session
- **SC-007**: Users engage in conversations for an average of 10+ minutes per session
- **SC-008**: Interface remains fully functional and responsive on devices with screen sizes from 375px (mobile) to 1920px+ (desktop)
- **SC-009**: Users demonstrate measurable vocabulary growth of at least 20 new words per 5 hours of conversation time
- **SC-010**: User retention rate of 40% or higher after 30 days (users who complete at least one conversation per week)

## Assumptions

- Users have basic internet connectivity to support real-time chat
- Users possess at least A1 (beginner) level English to engage in basic conversation
- Users access the app through modern web browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- Initial English level assessment will begin with an assumption of beginner level (A1-A2) and adapt rapidly based on first conversation
- Conversation topics will focus on everyday scenarios relevant to language learners (travel, shopping, hobbies, work, culture) rather than specialized domains
- Users are motivated to practice English and are comfortable with AI-driven conversation
- French-speaking users may occasionally ask for clarifications in French, which the system will handle by redirecting gently to English practice
- Progress metrics will use standard CEFR levels (A1, A2, B1, B2, C1, C2) for English proficiency assessment
- All data is stored locally in the browser (IndexedDB) - no backend storage or user accounts in this version
- Users understand that clearing browser data will delete their conversation history and progress
- The app will be primarily used for personal language learning, not classroom/institutional settings (in this initial version)

## Out of Scope

- Voice/audio conversation (text-only in this version)
- Learning other languages besides English
- Formal testing or certification (TOEFL, IELTS preparation)
- Classroom management features or teacher dashboards
- Group conversations or peer-to-peer learning
- Explicit grammar lessons or structured curriculum (integrated conversationally only)
- Payment or subscription management (this spec focuses on core learning functionality)
- Translation features (focus is on English conversation practice)
- Offline mode functionality
- User accounts and authentication (fully anonymous local-first app in this version)
- Cloud sync or backend storage (all data stored locally in browser)
- Multi-device synchronization
