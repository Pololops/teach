import { AlertCircle, WifiOff, Clock, RefreshCw, Home, Mail, ArrowRight } from 'lucide-react';
import type { AppError, ErrorAction } from '@teach/shared';
import { Button } from './button';

interface ErrorDisplayProps {
  error: AppError;
  onAction?: (action: ErrorAction) => void;
  className?: string;
}

const severityConfig: Record<AppError['severity'], {
  bg: string;
  border: string;
  text: string;
  icon: string;
}> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-100',
    icon: 'text-blue-500',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-900 dark:text-yellow-100',
    icon: 'text-yellow-500',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-900 dark:text-red-100',
    icon: 'text-red-500',
  },
  critical: {
    bg: 'bg-red-100 dark:bg-red-900',
    border: 'border-red-300 dark:border-red-700',
    text: 'text-red-900 dark:text-red-50',
    icon: 'text-red-600',
  },
};

const getIconForError = (error: AppError) => {
  if (error.code.includes('NETWORK') || error.code.includes('OFFLINE')) {
    return WifiOff;
  }
  if (error.code.includes('TIMEOUT') || error.code.includes('RATE_LIMIT')) {
    return Clock;
  }
  return AlertCircle;
};

const getActionIcon = (action: ErrorAction['action']) => {
  switch (action) {
    case 'retry':
      return RefreshCw;
    case 'navigate':
      return Home;
    case 'contact':
      return Mail;
    default:
      return ArrowRight;
  }
};

/**
 * Displays user-friendly error messages with appropriate styling and actions
 */
export function ErrorDisplay({ error, onAction, className = '' }: ErrorDisplayProps) {
  const config = severityConfig[error.severity];
  const Icon = getIconForError(error);

  const handleAction = (action: ErrorAction) => {
    onAction?.(action);
  };

  return (
    <div
      className={`rounded-lg border p-4 ${config.bg} ${config.border} ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`shrink-0 ${config.icon}`}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Message */}
          <p className={`text-sm font-medium ${config.text}`}>
            {error.userMessage}
          </p>

          {/* Retry countdown */}
          {error.retryAfter && (
            <p className={`mt-1 text-xs ${config.text} opacity-75`}>
              Please wait {error.retryAfter} seconds before trying again.
            </p>
          )}

          {/* Actions */}
          {error.actions && error.actions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {error.actions.map((action: ErrorAction, index: number) => {
                const ActionIcon = getActionIcon(action.action);
                return (
                  <Button
                    key={index}
                    variant={action.isPrimary ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleAction(action)}
                    className="text-xs"
                  >
                    <ActionIcon className="mr-1 h-3 w-3" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact inline error message (for forms, small spaces)
 */
export function InlineError({ error, className = '' }: { error: AppError; className?: string }) {
  const config = severityConfig[error.severity];
  const Icon = getIconForError(error);

  return (
    <div className={`flex items-center gap-2 text-sm ${config.text} ${className}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span>{error.userMessage}</span>
    </div>
  );
}

/**
 * Full-screen error display for critical errors
 */
export function FullScreenError({ error, onAction }: ErrorDisplayProps) {
  const config = severityConfig[error.severity];
  const Icon = getIconForError(error);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className={`rounded-2xl border-2 p-8 text-center ${config.bg} ${config.border}`}>
          {/* Icon */}
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${config.icon}`}>
            <Icon className="h-8 w-8" />
          </div>

          {/* Title */}
          <h2 className={`mb-2 text-xl font-bold ${config.text}`}>
            Oops!
          </h2>

          {/* Message */}
          <p className={`mb-6 text-base ${config.text}`}>
            {error.userMessage}
          </p>

          {/* Actions */}
          {error.actions && error.actions.length > 0 && (
            <div className="flex flex-col gap-3">
              {error.actions.map((action: ErrorAction, index: number) => {
                const ActionIcon = getActionIcon(action.action);
                return (
                  <Button
                    key={index}
                    variant={action.isPrimary ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => onAction?.(action)}
                    className="w-full"
                  >
                    <ActionIcon className="mr-2 h-4 w-4" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        {/* Technical details (collapsed by default) */}
        {process.env.NODE_ENV === 'development' && error.details && (
          <details className="mt-4 text-xs text-gray-600 dark:text-gray-400">
            <summary className="cursor-pointer">Technical Details</summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 dark:bg-gray-800">
              {JSON.stringify(error.details, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

