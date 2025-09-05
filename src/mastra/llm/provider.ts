/**
 * This file creates the centralized LLM provider.
 * Instead of each agent creating its own provider, they all use this one.
 */

// Import the OpenAI provider from Mastra (works with vLLM too!)
import { createOpenAI } from '@ai-sdk/openai';

// Import our configuration
import { defaultLLMConfig, type LLMConfig } from './config';

/**
 * This function creates an LLM provider with the given configuration.
 * Think of it as a factory that makes LLM providers.
 */
export const createLLMProvider = (config: Partial<LLMConfig> = {}) => {
  // Merge the provided config with our default config
  // If no config is provided, use the default
  const mergedConfig = { ...defaultLLMConfig, ...config };
  
  // Create and return the OpenAI-compatible provider
  // This works with vLLM because vLLM provides an OpenAI-compatible API
  return createOpenAI({
    baseURL: mergedConfig.baseUrl,    // The vLLM endpoint URL
    apiKey: mergedConfig.apiKey,      // API key (can be undefined)
  });
};

/**
 * This is our default provider instance.
 * All agents will use this unless they need something special.
 */
export const llmProvider = createLLMProvider();

/**
 * This function creates model instances from our provider.
 * For example: llmProviderFactory('gpt-oss-20b')
 */
export const llmProviderFactory = (modelName: string) => {
  return llmProvider(modelName);
};