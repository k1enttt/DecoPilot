import { createTool } from '@mastra/core/tools';
import { RoomInputSchema } from '../schemas/schemas';
import { z } from 'zod';

export const layoutPlanTool = createTool({
  id: 'layout.plan',
  description: 'Tool tạo layout gợi ý vị trí đặt bàn cho phòng làm việc',
  inputSchema: RoomInputSchema,
  outputSchema: z.object({
    layout: z.object({
      desk: z.object({
        position: z.object({ x: z.number(), y: z.number() }),
        width: z.number(),
        depth: z.number(),
        orientation: z.string(),
        rationale: z.array(z.string()),
        alternatives: z.array(z.any()),
      }),
      assumptions: z.array(z.string()),
      next_data_to_improve: z.array(z.string()),
      confidence: z.number().min(0).max(1),
    }),
  }),
  execute: async ({ context }) => {
    // Stub: trả về layout cố định
    return {
      layout: {
        desk: {
          position: { x: 1, y: 1 },
          width: 1.2,
          depth: 0.6,
          orientation: 'facing_window',
          rationale: ['Stub position cạnh cửa sổ để tận dụng ánh sáng'],
          alternatives: [],
        },
        assumptions: ['orientation default'],
        next_data_to_improve: ['photos'],
        confidence: 0.9,
      },
    };
  },
});
