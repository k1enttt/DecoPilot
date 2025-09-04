import { createTool } from '@mastra/core/tools';
import { RoomInputSchema } from '../schemas/schemas';
import { z } from 'zod';

export const paletteGenerateTool = createTool({
  id: 'palette.generate',
  description: 'Tool tạo bảng màu gợi ý dựa trên phong cách và tài liệu chuyên ngành',
  inputSchema: RoomInputSchema,
  outputSchema: z.object({
    style: z.array(z.string()),
    primary_colors: z.array(z.string()),
    accent_colors: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    // Stub: trả về palette cố định
    return {
      style: [], // stub phong cách tạm thời
      primary_colors: ['#ffffff', '#eeeeee'],
      accent_colors: ['#ff0000', '#00ff00'],
    };
  },
});
