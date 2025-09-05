/**
 * This file contains the centralized configuration for all LLM services.
 * Instead of each agent creating its own configuration, they all use this one.
 */

// First, let's define what our configuration looks like
export interface LLMConfig {
  // The URL of your vLLM server
  baseUrl: string;
  
  // API key for authentication (optional)
  apiKey?: string;
  
  // Different models for different tasks
  models: {
    generate: string;    // For content generation
    reasoning: string;   // For complex thinking
    small: string;       // For quick responses
  };
  
  // Default settings for all LLM calls
  default: {
    timeoutMs: number;   // How long to wait before giving up
    retries: number;     // How many times to retry on failure
    backoffMs: number;   // Wait time between retries
  };
}

/**
 * This is the default configuration that will be used by all agents.
 * It reads values from environment variables, with fallbacks.
 */
export const defaultLLMConfig: LLMConfig = {
  // Get the base URL from environment variable, or use localhost as fallback
  baseUrl: process.env.VLLM_BASE_URL || process.env.OPENAI_API_BASE_URL || 'http://localhost:8000/v1',
  
  // Get the API key from environment variable (can be undefined)
  apiKey: process.env.VLLM_API_KEY || process.env.OPENAI_API_KEY,
  
  // Model configuration - read from environment with fallbacks
  models: {
    generate: process.env.GENERATE_MODEL || 'gpt-oss-20b',
    reasoning: process.env.REASONING_MODEL || 'gpt-oss-20b',
    small: process.env.SMALL_GENERATE_MODEL || 'gpt-oss-20b'
  },
  
  // Default settings - read from environment with number parsing
  default: {
    timeoutMs: parseInt(process.env.LLLM_TIMEOUT_MS || '15000'),
    retries: parseInt(process.env.LLM_RETRIES || '1'),
    backoffMs: parseInt(process.env.LLM_BACKOFF_MS || '500')
  }
};