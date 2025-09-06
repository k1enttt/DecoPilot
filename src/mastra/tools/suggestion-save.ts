import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { SuggestionOutputSchema } from '../schemas/schemas';

export const suggestionSaveTool = createTool({
  id: 'suggestion.save',
  description: 'Lưu suggestion vào SQLite',
  inputSchema: SuggestionOutputSchema,
  outputSchema: z.object({ id: z.number() }),
  execute: async ({ context }) => {
    const filePath = path.resolve(process.cwd(), 'design_suggestions.json');
    // Đọc file tồn tại hoặc khởi tạo mảng trống
    let suggestions: Array<{ id: number; suggestion: any }>;
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      suggestions = JSON.parse(content);
    } catch (e: any) {
      suggestions = [];
    }
    // Tính ID mới
    const nextId = suggestions.length > 0 ? suggestions[suggestions.length - 1].id + 1 : 1;
    suggestions.push({ id: nextId, suggestion: context });
    // Ghi lại file
    await fs.writeFile(filePath, JSON.stringify(suggestions, null, 2));
    return { id: nextId };
  },
});
