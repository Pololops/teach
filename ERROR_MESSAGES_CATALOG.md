# Error Messages Catalog - User-Friendly Messages

## 🌐 Network & Connectivity Errors

### NETWORK_ERROR
**Icon**: 📡  
**Message**: Oops! Can't reach the server. Check your internet connection and try again.  
**Severity**: Warning  
**Actions**: [Try Again] [Dismiss]

### CONNECTION_TIMEOUT
**Icon**: ⏱️  
**Message**: Taking longer than expected. The server might be busy. Want to try again?  
**Severity**: Warning  
**Actions**: [Try Again] [Wait]

### OFFLINE
**Icon**: 🌐  
**Message**: You appear to be offline. Connect to the internet to continue learning.  
**Severity**: Error  
**Actions**: [Try Again] [Dismiss]

---

## 🔧 API & Backend Errors

### API_ERROR
**Icon**: 🔧  
**Message**: Something went wrong on our end. Our team has been notified.  
**Severity**: Error  
**Actions**: [Try Again] [Contact Support]

### SERVER_ERROR
**Icon**: 🚨  
**Message**: Our server is having a moment. Please try again in a few minutes.  
**Severity**: Error  
**Retry After**: 60 seconds  
**Actions**: [Try Again] [Contact Support]

### SERVICE_UNAVAILABLE
**Icon**: ⏸️  
**Message**: Taking a quick break for maintenance. Back shortly!  
**Severity**: Warning  
**Retry After**: 120 seconds  
**Actions**: [Wait & Retry] [Go Home]

---

## 🤖 AI Provider Errors

### RATE_LIMIT_EXCEEDED
**Icon**: 🚦  
**Message**: Slow down there, speed learner! Too many requests. Let's take a short break.  
**Severity**: Warning  
**Retry After**: 20 seconds  
**Actions**: [Wait 20s] [Go Home]

**Common Causes**:
- Making too many game requests quickly
- Rapid-fire chat messages
- Server on free tier hitting OpenAI limits

### AI_PROVIDER_ERROR
**Icon**: 🤖  
**Message**: Our AI assistant is taking a breather. Please try again shortly.  
**Severity**: Error  
**Retry After**: 30 seconds  
**Actions**: [Try Again] [Contact Support]

### AI_TIMEOUT
**Icon**: ⏱️  
**Message**: The AI is thinking too hard! Taking longer than expected. Try again?  
**Severity**: Warning  
**Actions**: [Try Again] [Dismiss]

### AI_INVALID_RESPONSE
**Icon**: 🎭  
**Message**: The AI spoke in riddles! Let's try getting a clearer answer.  
**Severity**: Error  
**Actions**: [Try Again] [Contact Support]

### NO_AI_PROVIDER
**Icon**: 🔌  
**Message**: AI features are currently unavailable. Check back soon!  
**Severity**: Critical  
**Actions**: [Contact Support] [Go Home]

### AI_QUOTA_EXCEEDED
**Icon**: 📊  
**Message**: You've reached your learning limit for today! Come back tomorrow for more.  
**Severity**: Warning  
**Actions**: [View Progress] [Upgrade]

---

## 🔍 Resource Errors

### NOT_FOUND
**Icon**: 🔍  
**Message**: Hmm, we can't find what you're looking for. Maybe it moved?  
**Severity**: Warning  
**Actions**: [Go Home] [Dismiss]

### ALREADY_EXISTS
**Icon**: 📋  
**Message**: This already exists! No need to create it again.  
**Severity**: Info  
**Actions**: [OK]

---

## ✏️ Validation Errors

### INVALID_INPUT
**Icon**: ✏️  
**Message**: Something doesn't look quite right. Please check your input and try again.  
**Severity**: Warning  
**Actions**: [OK]

### INVALID_LEVEL
**Icon**: 🎯  
**Message**: That level doesn't exist. Choose from A1, A2, B1, B2, C1, or C2.  
**Severity**: Warning  
**Actions**: [Go to Settings] [Dismiss]

### INVALID_FORMAT
**Icon**: 📝  
**Message**: The format isn't quite right. Please try again.  
**Severity**: Warning  
**Actions**: [OK]

---

## 🎮 Game-Specific Errors

### GAME_SESSION_ERROR
**Icon**: 🎮  
**Message**: Oops! Your game session hit a snag. Let's start fresh!  
**Severity**: Error  
**Actions**: [New Game] [Go Home]

### QUESTION_GENERATION_ERROR
**Icon**: ❓  
**Message**: Couldn't come up with a question. Let's try another one!  
**Severity**: Error  
**Actions**: [Try Again] [Go Home]

---

## 💬 Chat-Specific Errors

### CHAT_STREAM_ERROR
**Icon**: 💬  
**Message**: Connection interrupted while chatting. Your progress is saved!  
**Severity**: Warning  
**Actions**: [Continue] [Dismiss]

### MESSAGE_SAVE_ERROR
**Icon**: 💾  
**Message**: Couldn't save your message. Don't worry, you can try sending it again.  
**Severity**: Warning  
**Actions**: [Try Again] [Dismiss]

---

## 💾 Database Errors

### DB_ERROR
**Icon**: 💾  
**Message**: Having trouble saving your progress. Check your browser settings.  
**Severity**: Error  
**Actions**: [Try Again] [Contact Support]

### DB_WRITE_ERROR
**Icon**: 📝  
**Message**: Couldn't save your data. You might be out of storage space.  
**Severity**: Error  
**Actions**: [Try Again] [Clear Old Data]

### DB_READ_ERROR
**Icon**: 📖  
**Message**: Trouble loading your data. Let's try refreshing.  
**Severity**: Warning  
**Actions**: [Refresh] [Dismiss]

---

## 🤷 Generic Error

### UNKNOWN_ERROR
**Icon**: 🤷  
**Message**: Something unexpected happened. Let's try that again!  
**Severity**: Error  
**Actions**: [Try Again] [Contact Support]

---

## Error Severity Color Coding

| Severity | Color | Usage |
|----------|-------|-------|
| **Info** | Blue | Informational messages, no action needed |
| **Warning** | Yellow | Recoverable issues, user can retry |
| **Error** | Red | Significant problems, may need support |
| **Critical** | Dark Red | System-level issues, requires immediate attention |

---

## Design Principles

1. **Friendly Tone**: Use conversational, encouraging language
2. **Clear Actions**: Always tell users what they can do next
3. **Emoji Context**: Use relevant emojis to make errors less scary
4. **Honest Communication**: Don't hide problems, explain them simply
5. **Retryable**: When possible, let users retry failed operations
6. **Timed Retries**: Show countdown for rate-limited operations
7. **Support Access**: Easy way to contact support when needed
8. **Progressive Disclosure**: Hide technical details by default

---

## Context-Specific Variations

### In Emoji Game
- Errors shown as overlay cards
- Keep game state preserved
- Offer "Try New Question" option
- Show "Go Home" as fallback

### In Chat
- Errors shown inline with messages
- Stream interruptions handled gracefully
- Preserve message history
- Offer "Retry" or "Continue" options

### In Settings/Profile
- Inline validation errors
- Form-specific error styling
- Field-level error messages
- Clear error before next attempt

---

## Accessibility

- All errors have proper ARIA roles (`role="alert"`)
- Screen reader friendly text
- Keyboard navigable action buttons
- Sufficient color contrast ratios
- Focus management after errors

---

## Internationalization Ready

Current messages in English with friendly tone. Structure supports:
- French: "Oups! Une erreur s'est produite..."
- Spanish: "¡Ups! Algo salió mal..."
- German: "Hoppla! Da ist etwas schiefgelaufen..."

Error codes remain language-independent.

