/**
 * This file exports all LLM functionality for easy importing.
 * Instead of importing from multiple files, you can import from here.
 */

// Export the main adapter function
export { callModel } from './adapter';

// Export the provider functions
export { llmProviderFactory, createLLMProvider } from './provider';

// Export the configuration
export { defaultLLMConfig } from './config';

// Export the types
export type { LLMConfig } from './config';
export type { LLMCallOptions } from './adapter';