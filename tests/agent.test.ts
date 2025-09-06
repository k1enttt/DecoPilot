import { describe, it, expect } from 'vitest';
import { interiorAgent } from '../src/mastra/agents/interior-agent';

// Test đơn giản cho agent
describe('interiorAgent setup', () => {
  it('should have correct name and tools registered', () => {
    expect(interiorAgent.name).toBe('interiorAgent');
    // Kiểm tra layout.plan tool exists
    expect(interiorAgent.tools).toHaveProperty('layout.plan');
    expect(interiorAgent.tools).toHaveProperty('palette.generate');
    expect(interiorAgent.tools).toHaveProperty('suggestion.save');
  });
});
