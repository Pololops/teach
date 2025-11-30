/**
 * Error types and user-friendly messages for the Teach app
 * These errors work across all features: Chat, Games, and future features
 */

/**
 * Error codes used throughout the application
 */
export enum ErrorCode {
  // Network & Connectivity
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  OFFLINE = 'OFFLINE',

  // API & Backend
  API_ERROR = 'API_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // AI Provider Errors
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  AI_PROVIDER_ERROR = 'AI_PROVIDER_ERROR',
  AI_TIMEOUT = 'AI_TIMEOUT',
  AI_INVALID_RESPONSE = 'AI_INVALID_RESPONSE',
  NO_AI_PROVIDER = 'NO_AI_PROVIDER',
  AI_QUOTA_EXCEEDED = 'AI_QUOTA_EXCEEDED',

  // Resource Errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Validation Errors
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_LEVEL = 'INVALID_LEVEL',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // Game-specific Errors
  GAME_SESSION_ERROR = 'GAME_SESSION_ERROR',
  QUESTION_GENERATION_ERROR = 'QUESTION_GENERATION_ERROR',

  // Chat-specific Errors
  CHAT_STREAM_ERROR = 'CHAT_STREAM_ERROR',
  MESSAGE_SAVE_ERROR = 'MESSAGE_SAVE_ERROR',

  // Database Errors
  DB_ERROR = 'DB_ERROR',
  DB_WRITE_ERROR = 'DB_WRITE_ERROR',
  DB_READ_ERROR = 'DB_READ_ERROR',

  // Generic
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Error severity levels for UI display
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Structured error information
 */
export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  retryable: boolean;
  retryAfter?: number; // Seconds to wait before retry
  details?: Record<string, unknown>;
  actions?: ErrorAction[];
}

/**
 * Actions user can take to resolve the error
 */
export interface ErrorAction {
  label: string;
  action: 'retry' | 'contact' | 'upgrade' | 'wait' | 'dismiss' | 'navigate';
  target?: string; // URL or route for navigation
  isPrimary?: boolean;
}

/**
 * User-friendly error messages catalog
 */
export const ERROR_MESSAGES: Record<ErrorCode, Omit<AppError, 'details'>> = {
  // Network & Connectivity
  [ErrorCode.NETWORK_ERROR]: {
    code: ErrorCode.NETWORK_ERROR,
    message: 'Requête réseau échouée',
    userMessage: "📡 Oups ! Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayer.",
    severity: ErrorSeverity.WARNING,
    retryable: true,
    actions: [
      { label: 'Réessayer', action: 'retry', isPrimary: true },
      { label: 'Annuler', action: 'dismiss' },
    ],
  },

  [ErrorCode.CONNECTION_TIMEOUT]: {
    code: ErrorCode.CONNECTION_TIMEOUT,
    message: 'Timeout de la requête',
    userMessage: '⏱️ Le serveur est occupé. Veuillez réessayer plus tard.',
    severity: ErrorSeverity.WARNING,
    retryable: true,
    actions: [
      { label: 'Réessayer', action: 'retry', isPrimary: true },
      { label: 'Attendre', action: 'wait' },
    ],
  },

  [ErrorCode.OFFLINE]: {
    code: ErrorCode.OFFLINE,
    message: 'Pas de connexion internet',
    userMessage: '🌐 Vous semblez être hors ligne. Connectez-vous à internet pour continuer à apprendre.',
    severity: ErrorSeverity.ERROR,
    retryable: true,
    actions: [
      { label: 'Réessayer', action: 'retry', isPrimary: true },
      { label: 'Annuler', action: 'dismiss' },
    ],
  },

  // API & Backend
  [ErrorCode.API_ERROR]: {
    code: ErrorCode.API_ERROR,
    message: 'Requête API échouée',
    userMessage: '🔧 Quelque chose s\'est mal passé de notre côté. Notre équipe a été informée.',
    severity: ErrorSeverity.ERROR,
    retryable: true,
    actions: [
      { label: 'Réessayer', action: 'retry', isPrimary: true },
      { label: 'Contacter le support', action: 'contact' },
    ],
  },

  [ErrorCode.SERVER_ERROR]: {
    code: ErrorCode.SERVER_ERROR,
    message: 'Erreur interne du serveur',
    userMessage: '🚨 Notre serveur est momentanément indisponible. Veuillez réessayer dans quelques minutes.',
    severity: ErrorSeverity.ERROR,
    retryable: true,
    retryAfter: 60,
    actions: [
      { label: 'Réessayer', action: 'retry', isPrimary: true },
      { label: 'Contacter le support', action: 'contact' },
    ],
  },

  [ErrorCode.SERVICE_UNAVAILABLE]: {
    code: ErrorCode.SERVICE_UNAVAILABLE,
    message: 'Service temporairement indisponible',
    userMessage: '⏸️ Nous sommes en train de faire une maintenance rapide. Nous serons de retour bientôt!',
    severity: ErrorSeverity.WARNING,
    retryable: true,
    retryAfter: 120,
    actions: [
      { label: 'Attendre & Réessayer', action: 'wait', isPrimary: true },
      { label: 'Retour à l\'accueil', action: 'navigate', target: '/' },
    ],
  },

  // AI Provider Errors
  [ErrorCode.RATE_LIMIT_EXCEEDED]: {
    code: ErrorCode.RATE_LIMIT_EXCEEDED,
    message: 'Limite de requêtes dépassée',
    userMessage: '🚦 Ralentissez, étudiant! Trop de requêtes. Faisons une pause courte.',
    severity: ErrorSeverity.WARNING,
    retryable: true,
    retryAfter: 20,
    actions: [
      { label: 'Attendre 20s', action: 'wait', isPrimary: true },
      { label: 'Retour à l\'accueil', action: 'navigate', target: '/' },
    ],
  },

  [ErrorCode.AI_PROVIDER_ERROR]: {
    code: ErrorCode.AI_PROVIDER_ERROR,
    message: 'Erreur du fournisseur d\'IA',
    userMessage: '🤖 Notre assistant IA est en pause. Veuillez réessayer bientôt.',
    severity: ErrorSeverity.ERROR,
    retryable: true,
    retryAfter: 30,
    actions: [
      { label: 'Réessayer', action: 'retry', isPrimary: true },
      { label: 'Contacter le support', action: 'contact' },
    ],
  },

  [ErrorCode.AI_TIMEOUT]: {
    code: ErrorCode.AI_TIMEOUT,
    message: 'Timeout de la requête IA',
    userMessage: '⏱️ L\'IA pense trop dur! Elle prend plus de temps que prévu. Veuillez réessayer?',
    severity: ErrorSeverity.WARNING,
    retryable: true,
    actions: [
      { label: 'Réessayer', action: 'retry', isPrimary: true },
      { label: 'Annuler', action: 'dismiss' },
    ],
  },

  [ErrorCode.AI_INVALID_RESPONSE]: {
    code: ErrorCode.AI_INVALID_RESPONSE,
    message: 'Format de réponse IA invalide',
    userMessage: '🎭 L\'IA a répondu en énigmes! Essayons de trouver une réponse plus claire.',
    severity: ErrorSeverity.ERROR,
    retryable: true,
    actions: [
      { label: 'Réessayer', action: 'retry', isPrimary: true },
      { label: 'Contacter le support', action: 'contact' },
    ],
  },

  [ErrorCode.NO_AI_PROVIDER]: {
    code: ErrorCode.NO_AI_PROVIDER,
    message: 'Aucun fournisseur d\'IA disponible',
    userMessage: '🔌 Les fonctionnalités IA sont actuellement indisponibles. Veuillez réessayer plus tard.',
    severity: ErrorSeverity.CRITICAL,
    retryable: false,
    actions: [
      { label: 'Contacter le support', action: 'contact', isPrimary: true },
      { label: 'Retour à l\'accueil', action: 'navigate', target: '/' },
    ],
  },

  [ErrorCode.AI_QUOTA_EXCEEDED]: {
    code: ErrorCode.AI_QUOTA_EXCEEDED,
    message: 'Quota d\'IA dépassé',
    userMessage: '📊 Vous avez atteint votre limite d\'apprentissage pour aujourd\'hui! Revenez demain pour plus.',
    severity: ErrorSeverity.WARNING,
    retryable: false,
    actions: [
      { label: 'Voir le progrès', action: 'navigate', target: '/progress', isPrimary: true },
      { label: 'Mettre à niveau', action: 'upgrade' },
    ],
  },

  // Resource Errors
  [ErrorCode.NOT_FOUND]: {
    code: ErrorCode.NOT_FOUND,
    message: 'Ressource non trouvée',
    userMessage: '🔍 Hmm, nous ne trouvons pas ce que vous cherchez. Peut-être a-t-il déménagé?',
    severity: ErrorSeverity.WARNING,
    retryable: false,
    actions: [
      { label: 'Retour à l\'accueil', action: 'navigate', target: '/', isPrimary: true },
      { label: 'Annuler', action: 'dismiss' },
    ],
  },

  [ErrorCode.ALREADY_EXISTS]: {
    code: ErrorCode.ALREADY_EXISTS,
    message: 'Ressource déjà existante',
    userMessage: '📋 Cette ressource existe déjà! Pas besoin de la créer à nouveau.',
    severity: ErrorSeverity.INFO,
    retryable: false,
    actions: [
      { label: 'OK', action: 'dismiss', isPrimary: true },
    ],
  },

  // Validation Errors
  [ErrorCode.INVALID_INPUT]: {
    code: ErrorCode.INVALID_INPUT,
    message: 'Input invalide',
    userMessage: '✏️ Quelque chose ne semble pas correct. Veuillez vérifier votre input et réessayer.',
    severity: ErrorSeverity.WARNING,
    retryable: true,
    actions: [
      { label: 'OK', action: 'dismiss', isPrimary: true },
    ],
  },

  [ErrorCode.INVALID_LEVEL]: {
    code: ErrorCode.INVALID_LEVEL,
    message: 'Niveau CEFR invalide',
    userMessage: '🎯 Ce niveau n\'existe pas. Choisissez entre A1, A2, B1, B2, C1, ou C2.',
    severity: ErrorSeverity.WARNING,
    retryable: false,
    actions: [
      { label: 'Aller aux paramètres', action: 'navigate', target: '/settings', isPrimary: true },
      { label: 'Annuler', action: 'dismiss' },
    ],
  },

  [ErrorCode.INVALID_FORMAT]: {
    code: ErrorCode.INVALID_FORMAT,
    message: 'Format de données invalide',
    userMessage: '📝 Le format n\'est pas correct. Veuillez réessayer.',
    severity: ErrorSeverity.WARNING,
    retryable: true,
    actions: [
      { label: 'OK', action: 'dismiss', isPrimary: true },
    ],
  },

  // Game-specific Errors
  [ErrorCode.GAME_SESSION_ERROR]: {
    code: ErrorCode.GAME_SESSION_ERROR,
    message: 'Erreur de session de jeu',
    userMessage: '🎮 Oups! Votre session de jeu a rencontré un problème. Commencez une nouvelle session!',
    severity: ErrorSeverity.ERROR,
    retryable: true,
    actions: [
      { label: 'Nouvelle partie', action: 'retry', isPrimary: true },
      { label: 'Retour à l\'accueil', action: 'navigate', target: '/' },
    ],
  },

  [ErrorCode.QUESTION_GENERATION_ERROR]: {
    code: ErrorCode.QUESTION_GENERATION_ERROR,
    message: 'Échec de la génération de question',
    userMessage: '❓ Impossible de générer une question. Essayons une autre!',
    severity: ErrorSeverity.ERROR,
    retryable: true,
    actions: [
      { label: 'Réessayer', action: 'retry', isPrimary: true },
      { label: 'Retour à l\'accueil', action: 'navigate', target: '/' },
    ],
  },

  // Chat-specific Errors
  [ErrorCode.CHAT_STREAM_ERROR]: {
    code: ErrorCode.CHAT_STREAM_ERROR,
    message: 'Interruption de la conversation',
    userMessage: '💬 La connexion a été interrompue pendant la conversation. Votre progression a été sauvegardée!',
    severity: ErrorSeverity.WARNING,
    retryable: true,
    actions: [
      { label: 'Continuer', action: 'retry', isPrimary: true },
      { label: 'Annuler', action: 'dismiss' },
    ],
  },

  [ErrorCode.MESSAGE_SAVE_ERROR]: {
    code: ErrorCode.MESSAGE_SAVE_ERROR,
    message: 'Échec de la sauvegarde du message',
    userMessage: '💾 Impossible de sauvegarder votre message. Ne vous inquiétez pas, vous pouvez réessayer de l\'envoyer.',
    severity: ErrorSeverity.WARNING,
    retryable: true,
    actions: [
      { label: 'Réessayer', action: 'retry', isPrimary: true },
      { label: 'Annuler', action: 'dismiss' },
    ],
  },

  // Database Errors
  [ErrorCode.DB_ERROR]: {
    code: ErrorCode.DB_ERROR,
    message: 'Erreur de base de données',
    userMessage: '💾 Impossible de sauvegarder votre progression. Vérifiez vos paramètres de navigateur.',
    severity: ErrorSeverity.ERROR,
    retryable: true,
    actions: [
      { label: 'Réessayer', action: 'retry', isPrimary: true },
      { label: 'Contacter le support', action: 'contact' },
    ],
  },

  [ErrorCode.DB_WRITE_ERROR]: {
    code: ErrorCode.DB_WRITE_ERROR,
    message: 'Échec de la sauvegarde des données',
    userMessage: '📝 Impossible de sauvegarder vos données. Vous risquez d\'être en dehors de l\'espace de stockage.',
    severity: ErrorSeverity.ERROR,
    retryable: true,
    actions: [
      { label: 'Réessayer', action: 'retry', isPrimary: true },
      { label: 'Effacer les anciennes données', action: 'navigate', target: '/settings' },
    ],
  },

  [ErrorCode.DB_READ_ERROR]: {
    code: ErrorCode.DB_READ_ERROR,
    message: 'Échec de la lecture des données',
    userMessage: '📖 Impossible de charger vos données. Essayons de rafraîchir.',
    severity: ErrorSeverity.WARNING,
    retryable: true,
    actions: [
      { label: 'Rafraîchir', action: 'retry', isPrimary: true },
      { label: 'Annuler', action: 'dismiss' },
    ],
  },

  // Generic
  [ErrorCode.UNKNOWN_ERROR]: {
    code: ErrorCode.UNKNOWN_ERROR,
    message: 'Erreur inconnue',
    userMessage: '🤷 Quelque chose d\'inattendu est arrivé. Essayons encore!',
    severity: ErrorSeverity.ERROR,
    retryable: true,
    actions: [
      { label: 'Réessayer', action: 'retry', isPrimary: true },
      { label: 'Contacter le support', action: 'contact' },
    ],
  },
};

/**
 * Create an AppError from an error code
 */
export function createError(
  code: ErrorCode,
  details?: Record<string, unknown>
): AppError {
  const baseError = ERROR_MESSAGES[code] || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR];
  return {
    ...baseError,
    details,
  };
}

/**
 * Parse error from various sources into AppError
 */
export function parseError(error: unknown): AppError {
  // Already an AppError
  if (typeof error === 'object' && error !== null && 'code' in error && 'userMessage' in error) {
    return error as AppError;
  }

  // API Error with status code
  if (typeof error === 'object' && error !== null) {
    const err = error as any;

    // Rate limit error
    if (err.status === 429 || err.code === 'rate_limit_exceeded') {
      const retryAfter = err.retry_after || err.retryAfter || 20;
      return {
        ...createError(ErrorCode.RATE_LIMIT_EXCEEDED),
        retryAfter,
        details: { originalError: err },
      };
    }

    // Server errors (5xx)
    if (err.status >= 500 && err.status < 600) {
      return createError(ErrorCode.SERVER_ERROR, { status: err.status });
    }

    // Not found
    if (err.status === 404) {
      return createError(ErrorCode.NOT_FOUND);
    }

    // Bad request / validation
    if (err.status === 400) {
      return createError(ErrorCode.INVALID_INPUT, {
        message: err.message || 'Invalid input',
      });
    }

    // Network/timeout errors
    if (err.name === 'TypeError' || err.message?.includes('fetch')) {
      return createError(ErrorCode.NETWORK_ERROR);
    }

    // Timeout
    if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
      return createError(ErrorCode.CONNECTION_TIMEOUT);
    }
  }

  // Standard Error object
  if (error instanceof Error) {
    // Check message for specific patterns
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      return createError(ErrorCode.RATE_LIMIT_EXCEEDED);
    }

    if (error.message.includes('timeout')) {
      return createError(ErrorCode.CONNECTION_TIMEOUT);
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return createError(ErrorCode.NETWORK_ERROR);
    }

    if (error.message.includes('AI') || error.message.includes('provider')) {
      return createError(ErrorCode.AI_PROVIDER_ERROR, { message: error.message });
    }

    // Generic error with message
    return {
      ...createError(ErrorCode.UNKNOWN_ERROR),
      details: { message: error.message },
    };
  }

  // Fallback to unknown error
  return createError(ErrorCode.UNKNOWN_ERROR, { originalError: error });
}

