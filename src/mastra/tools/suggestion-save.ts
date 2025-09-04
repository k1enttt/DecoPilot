import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import db from '../../db/sqlite';
import { SuggestionOutputSchema } from '../schemas/schemas';

export const suggestionSaveTool = createTool({
  id: 'suggestion.save',
  description: 'Lưu suggestion vào SQLite',
  inputSchema: SuggestionOutputSchema,
  outputSchema: z.object({ id: z.number() }),
  execute: async ({ context }) => {
    // Stub: thực thi lưu vào DB
    // db logic ở đây, hiện trả về id cố định
    return { id: 1 };
  },
});
