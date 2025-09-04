import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';

// Agent cơ bản nhận input text và sinh JSON gợi ý theo schema
export const interiorAgent = new Agent({
  name: 'interiorAgent',
  description: 'Assistant giúp gợi ý thiết kế nội thất phòng làm việc dựa trên mô tả của người dùng',
  instructions: `Bạn là Interior Design Assistant.
Input: mô tả phòng, mục tiêu sử dụng, phong cách, ngân sách.
Output: JSON với các trường: style[], color_palette[], materials[], layout[], decor[], rationales[].`,
  model: openai('gpt-4o') // Cần chỉnh sửa mô hình LLM cho phù hợp với tài liệu
});
