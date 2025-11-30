# Error Handling System - Developer Guide

## Quick Start

### 1. Import Error Utilities

```typescript
import { parseError, createError, ErrorCode, AppError } from '@teach/shared';
```

### 2. Basic Error Handling Pattern

```typescript
try {
  // Your code that might fail
  const result = await someOperation();
} catch (error) {
  // Convert to AppError with friendly message
  const appError = parseError(error);
  setError(appError);
}
```

### 3. Display Error in UI

```typescript
import { ErrorDisplay } from '@/components/ui/error-display';

function MyComponent() {
  const [error, setError] = useState<AppError | null>(null);

  const handleErrorAction = (action: ErrorAction) => {
    // Handle user action
    if (action.action === 'retry') {
      retryOperation();
    }
  };

  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        onAction={handleErrorAction}
      />
    );
  }

  return <YourNormalUI />;
}
```

---

## Common Patterns

### API Calls

```typescript
async function fetchData() {
  try {
    const response = await fetch('/api/endpoint');
    
    if (!response.ok) {
      // Parse HTTP error into AppError
      const errorData = await response.json().catch(() => ({}));
      throw parseError({ 
        status: response.status, 
        ...errorData 
      });
    }
    
    return await response.json();
  } catch (error) {
    // Convert any error to AppError
    const appError = parseError(error);
    console.error('API Error:', appError);
    throw appError;
  }
}
```

### Streaming (SSE)

```typescript
async function streamChat(options: {
  onError?: (error: AppError) => void;
}) {
  try {
    const reader = response.body?.getReader();
    if (!reader) {
      throw createError(ErrorCode.CHAT_STREAM_ERROR);
    }
    
    // Stream processing...
  } catch (error) {
    const appError = parseError(error);
    options.onError?.(appError);
    throw appError;
  }
}
```

### Database Operations

```typescript
async function saveToDb(data: any) {
  try {
    await db.save(data);
  } catch (error) {
    // Database errors automatically become DB_ERROR
    const appError = parseError(error);
    
    // Add custom details
    appError.details = {
      ...appError.details,
      dataType: typeof data,
      timestamp: Date.now(),
    };
    
    throw appError;
  }
}
```

### Form Validation

```typescript
function validateInput(input: string): AppError | null {
  if (!input.trim()) {
    return createError(ErrorCode.INVALID_INPUT, {
      field: 'message',
      reason: 'empty',
    });
  }
  
  if (input.length > 5000) {
    return createError(ErrorCode.INVALID_INPUT, {
      field: 'message',
      reason: 'too_long',
      maxLength: 5000,
      actualLength: input.length,
    });
  }
  
  return null;
}

// Usage
const error = validateInput(userInput);
if (error) {
  setError(error);
  return;
}
```

---

## Error Display Components

### Standard Error Card

Best for: Main content area, dedicated error states

```tsx
<ErrorDisplay 
  error={error} 
  onAction={handleErrorAction}
  className="mb-4"
/>
```

### Inline Error

Best for: Form fields, inline validation

```tsx
<InlineError 
  error={error}
  className="mt-2"
/>
```

### Full Screen Error

Best for: Critical app-level errors, page not found

```tsx
<FullScreenError 
  error={error}
  onAction={handleErrorAction}
/>
```

---

## Store Integration

### With Zustand

```typescript
import { create } from 'zustand';
import type { AppError } from '@teach/shared';

interface MyStore {
  error: AppError | null;
  setError: (error: AppError | null) => void;
}

export const useMyStore = create<MyStore>((set) => ({
  error: null,
  setError: (error) => set({ error }),
}));
```

### With React Query

```typescript
import { useMutation } from '@tanstack/react-query';
import { parseError } from '@teach/shared';

const mutation = useMutation({
  mutationFn: async (data) => {
    try {
      return await apiCall(data);
    } catch (error) {
      throw parseError(error);
    }
  },
  onError: (error: AppError) => {
    // Error is already AppError
    setError(error);
  },
});
```

---

## Creating Custom Errors

### Simple Custom Error

```typescript
const error = createError(ErrorCode.GAME_SESSION_ERROR);
```

### With Additional Details

```typescript
const error = createError(ErrorCode.RATE_LIMIT_EXCEEDED, {
  userId: user.id,
  requestCount: 10,
  limit: 3,
  resetTime: Date.now() + 20000,
});
```

### Override Default Message

```typescript
const error = createError(ErrorCode.INVALID_INPUT);
error.userMessage = "Your custom message here!";
error.actions = [
  { label: 'Custom Action', action: 'retry', isPrimary: true }
];
```

---

## Error Actions

### Available Actions

| Action | Description | Example Use |
|--------|-------------|-------------|
| `retry` | Try the operation again | Failed API call |
| `navigate` | Go to different page | 404, go home |
| `contact` | Contact support | Critical errors |
| `wait` | Wait before retrying | Rate limits |
| `dismiss` | Close error message | Non-critical warnings |
| `upgrade` | Upgrade account | Quota exceeded |

### Implementing Action Handler

```typescript
const handleErrorAction = (action: ErrorAction) => {
  switch (action.action) {
    case 'retry':
      // Retry the failed operation
      retryOperation();
      setError(null);
      break;
      
    case 'navigate':
      // Navigate to target route
      if (action.target === '/') {
        navigateTo('home');
      } else {
        // Handle other routes
        router.push(action.target);
      }
      break;
      
    case 'wait':
      // Show user we're waiting
      if (error?.retryAfter) {
        setTimeout(() => {
          retryOperation();
        }, error.retryAfter * 1000);
      }
      break;
      
    case 'contact':
      // Open support email or chat
      window.location.href = 'mailto:support@teach.app?subject=Help Needed';
      break;
      
    case 'dismiss':
      // Just close the error
      setError(null);
      break;
      
    case 'upgrade':
      // Navigate to pricing page
      navigateTo('pricing');
      break;
  }
};
```

---

## Backend Integration

### Express Route Error Handling

```typescript
import { ErrorCode, createError } from '@teach/shared';

app.post('/api/game/question', async (req, res) => {
  try {
    const question = await gameService.generateQuestion();
    res.json(question);
  } catch (error: any) {
    // Rate limit
    if (error.status === 429) {
      return res.status(429).json({
        code: ErrorCode.RATE_LIMIT_EXCEEDED,
        message: 'Rate limit exceeded',
        retryAfter: error.retry_after || 20,
      });
    }
    
    // Generic server error
    res.status(500).json({
      code: ErrorCode.SERVER_ERROR,
      message: 'Internal server error',
    });
  }
});
```

### AI Provider Error Mapping

```typescript
function handleAIError(error: any): never {
  if (error.status === 429) {
    throw createError(ErrorCode.RATE_LIMIT_EXCEEDED, {
      retryAfter: error.retry_after,
      provider: 'OpenAI',
    });
  }
  
  if (error.status === 500) {
    throw createError(ErrorCode.AI_PROVIDER_ERROR, {
      provider: 'OpenAI',
      model: 'gpt-4o-mini',
    });
  }
  
  if (error.name === 'TimeoutError') {
    throw createError(ErrorCode.AI_TIMEOUT);
  }
  
  throw createError(ErrorCode.AI_PROVIDER_ERROR);
}
```

---

## Testing Errors

### Triggering Errors for Testing

```typescript
// Network error
navigator.onLine = false;

// Rate limit
for (let i = 0; i < 10; i++) {
  await fetchQuestion();
}

// Timeout
jest.setTimeout(100); // Set very short timeout

// Invalid response
mockServer.mockReturnValue({ invalid: 'data' });

// Database error
// Fill up browser storage to trigger quota
```

### Testing Error Display

```tsx
import { render, screen } from '@testing-library/react';
import { ErrorDisplay } from '@/components/ui/error-display';
import { createError, ErrorCode } from '@teach/shared';

test('displays error message', () => {
  const error = createError(ErrorCode.NETWORK_ERROR);
  
  render(<ErrorDisplay error={error} />);
  
  expect(screen.getByText(/can't reach the server/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
});
```

---

## Best Practices

### ✅ Do

- Always use `parseError()` to convert errors
- Provide `onAction` handler for user actions
- Log errors with context for debugging
- Clear errors when user navigates away
- Test error states in development
- Show retry countdown for rate limits
- Preserve user data when errors occur

### ❌ Don't

- Show raw error messages to users
- Ignore errors silently
- Block UI without showing error
- Use alert() or console.log() for errors
- Retry automatically without user consent
- Lose user input on error
- Show stack traces in production

---

## Debugging

### Development Mode

Technical details are automatically shown in `<FullScreenError>`:

```tsx
{process.env.NODE_ENV === 'development' && error.details && (
  <details>
    <summary>Technical Details</summary>
    <pre>{JSON.stringify(error.details, null, 2)}</pre>
  </details>
)}
```

### Adding Debug Info

```typescript
const appError = parseError(error);
appError.details = {
  ...appError.details,
  userId: user.id,
  action: 'fetch_question',
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
};
```

### Error Logging Service

```typescript
function logError(error: AppError) {
  if (process.env.NODE_ENV === 'production') {
    // Send to logging service (Sentry, LogRocket, etc.)
    analytics.logError({
      code: error.code,
      message: error.message,
      severity: error.severity,
      details: error.details,
    });
  } else {
    console.error('AppError:', error);
  }
}
```

---

## Migration Guide

### From Old Error Handling

**Before:**
```typescript
try {
  await fetchData();
} catch (error) {
  setError(error.message);
  // Show ugly error string to user
}
```

**After:**
```typescript
try {
  await fetchData();
} catch (error) {
  const appError = parseError(error);
  setError(appError);
  // Beautiful error UI with actions
}
```

### Updating Store Types

**Before:**
```typescript
interface State {
  error: string | null;
}
```

**After:**
```typescript
import type { AppError } from '@teach/shared';

interface State {
  error: AppError | null;
}
```

---

## FAQ

**Q: Can I customize error messages?**  
A: Yes! Create the error and override the `userMessage` property.

**Q: How do I add a new error type?**  
A: Add it to the `ErrorCode` enum and `ERROR_MESSAGES` catalog in `errors.ts`.

**Q: What about errors from external libraries?**  
A: Use `parseError()` - it automatically converts common errors.

**Q: Can I use this with React Error Boundaries?**  
A: Yes! Catch errors and render `<FullScreenError>` component.

**Q: How do I handle multiple errors at once?**  
A: Store array of errors, or show them sequentially with dismissal.

**Q: Are errors automatically reported?**  
A: No - you need to integrate with your logging service of choice.

