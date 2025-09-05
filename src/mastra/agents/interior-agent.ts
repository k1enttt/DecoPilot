import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';

import { layoutPlanTool } from '../tools/layout-plan';
import { paletteGenerateTool } from '../tools/palette-generate';
import { suggestionSaveTool } from '../tools/suggestion-save';
import { llmProviderFactory } from '../llm/provider';

// Agent cơ bản nhận input text và sinh JSON gợi ý theo schema
export const interiorAgent = new Agent({
  name: 'interiorAgent',
  description: 'Assistant giúp gợi ý thiết kế nội thất phòng làm việc dựa trên mô tả của người dùng',
  instructions: `Bạn là Interior Design Assistant.
Input: mô tả phòng, mục tiêu sử dụng, phong cách, ngân sách.
Output: JSON với các trường: style[], color_palette[], materials[], layout[], decor[], rationales[].`,
  model: llmProviderFactory(process.env.GENERATE_MODEL || 'gpt-oss-20b'), // Chỉnh sửa tên của mô hình LLM theo tài liệu
  tools: {
    'layout.plan': layoutPlanTool,
    'palette.generate': paletteGenerateTool,
    'suggestion.save': suggestionSaveTool,
  },
});
