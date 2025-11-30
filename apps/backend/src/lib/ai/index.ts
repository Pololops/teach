import type { AIProvider as AIProviderType } from '@teach/shared';
import type { AIProvider } from './providers/base';
import { OllamaProvider } from './providers/ollama';

// Initialize Ollama provider
const ollamaProvider = new OllamaProvider();

/**
 * Get AI provider (always returns Ollama)
 */
export function getProvider(name: AIProviderType = 'ollama'): AIProvider {
  if (!ollamaProvider.isAvailable()) {
    throw new Error(
      'Ollama is not available. Please ensure Ollama is running locally and the model is loaded.'
    );
  }

  return ollamaProvider;
}

/**
 * Get list of available providers
 */
export function getAvailableProviders(): string[] {
  return ollamaProvider.isAvailable() ? ['ollama'] : [];
}

// Export provider interface
export type { AIProvider };
