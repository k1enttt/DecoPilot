import { describe, it, expect } from 'vitest';
import { layoutPlanTool } from '../src/mastra/tools/layout-plan';
import { paletteGenerateTool } from '../src/mastra/tools/palette-generate';
import { suggestionSaveTool } from '../src/mastra/tools/suggestion-save';
import { RoomInputSchema, SuggestionOutputSchema } from '../src/mastra/schemas/schemas';
import { RuntimeContext } from '@mastra/core/runtime-context';

// Tạo input hợp lệ cho RoomInputSchema
// Input mẫu cho tests
const validRoomInput = {
  dimensions: { width_m: 3, length_m: 4 },
  openings: {
    door: { position: { x: 0, y: 0 } },
    windows: [
      { position: { x: 1, y: 1 }, width: 1, height: 1, orientation: 'N' }
    ],
  },
  primary_use: 'office',
  workstation: { screens: 1 },
};

// Test layoutPlanTool
describe('layoutPlanTool', () => {
  it('trả về stub layout hợp lệ theo schema', async () => {
    // Kiểm tra input
    expect(() => RoomInputSchema.parse(validRoomInput)).not.toThrow();
    // Gọi tool
  const result = await layoutPlanTool.execute({ context: validRoomInput as any, runtimeContext: new RuntimeContext(), tracingContext: { currentSpan: undefined } });
    // Kết quả phải có trường layout
    expect(result).toHaveProperty('layout');
    // Kiểm tra chi tiết desk
    const desk = result.layout.desk;
    expect(desk.position).toHaveProperty('x');
    expect(desk.position).toHaveProperty('y');
    expect(typeof desk.width).toBe('number');
    expect(typeof desk.depth).toBe('number');
    expect(Array.isArray(desk.rationale)).toBe(true);
    expect(typeof result.layout.confidence).toBe('number');
  });
});

// Test paletteGenerateTool
describe('paletteGenerateTool', () => {
  it('trả về stub palette hợp lệ', async () => {
    // Kiểm tra input
    expect(() => RoomInputSchema.parse(validRoomInput)).not.toThrow();
  const result = await paletteGenerateTool.execute({ context: validRoomInput as any, runtimeContext: new RuntimeContext(), tracingContext: { currentSpan: undefined } });
    expect(result).toHaveProperty('primary_colors');
    expect(Array.isArray(result.primary_colors)).toBe(true);
    expect(result.primary_colors.length).toBeGreaterThan(0);
    expect(result).toHaveProperty('accent_colors');
  });
});

// Test suggestionSaveTool
describe('suggestionSaveTool', () => {
  it('trả về id khi lưu suggestion', async () => {
    const suggestion = {
      style: ['minimal'],
      color_palette: ['#ffffff'],
      materials: [],
      layout: {},
      decor: [],
      rationales: [],
      confidence: 0.5
    };
    // Kiểm tra schema output
    expect(() => SuggestionOutputSchema.parse(suggestion)).not.toThrow();
  const result = await suggestionSaveTool.execute({ context: suggestion as any, runtimeContext: new RuntimeContext(), tracingContext: { currentSpan: undefined } });
    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('number');
    expect(result.id).toBeGreaterThan(0);
  });
});
