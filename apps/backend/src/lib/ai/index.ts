import type { AIProvider as AIProviderType } from '@teach/shared';
import type { AIProvider } from './providers/base';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';

// Initialize providers
const providers: AIProvider[] = [new OpenAIProvider(), new AnthropicProvider()];

/**
 * Get AI provider by name or auto-select
 * Auto-selection preference: OpenAI (lower latency) → Anthropic → error
 */
export function getProvider(name: AIProviderType = 'auto'): AIProvider {
  if (name === 'auto') {
    // Auto-select first available provider
    for (const provider of providers) {
      if (provider.isAvailable()) {
        return provider;
      }
    }
    throw new Error(
      'No AI providers available. Please configure OPENAI_API_KEY or ANTHROPIC_API_KEY.'
    );
  }

  // Get specific provider
  const provider = providers.find((p) => p.name === name);
  if (!provider) {
    throw new Error(`Unknown AI provider: ${name}`);
  }

  if (!provider.isAvailable()) {
    throw new Error(`${name} provider not available - API key not configured`);
  }

  return provider;
}

/**
 * Get list of available providers
 */
export function getAvailableProviders(): string[] {
  return providers.filter((p) => p.isAvailable()).map((p) => p.name);
}

// Export provider interface
export type { AIProvider };
