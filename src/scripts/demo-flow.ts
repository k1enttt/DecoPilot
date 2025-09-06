import "dotenv/config";
import db from '../db/sqlite';
import { interiorAgent } from '../mastra/agents/interior-agent';
import { suggestionSaveTool } from '../mastra/tools/suggestion-save';
import { RuntimeContext } from '@mastra/core/runtime-context';

async function demoFlow() {
  // Example user input
  const userInput = `Phòng rộng 3m x 4m, cửa sổ hướng Đông Nam, mục đích office, phong cách minimal, ngân sách 10 triệu VND.`;

  console.log('=== Demo: Input ===');
  console.log(userInput);

  // Gọi agent để sinh suggestion
  const suggestion = await interiorAgent.generate(userInput);
  console.log('=== Agent Suggestion ===');
  console.log(suggestion);

  // Giả lập JSON suggestion (dùng stub layoutPlanTool và paletteGenerateTool)
  const suggestionJson = {
    style: ['minimal'],
    color_palette: ['#ffffff', '#eeeeee'],
    materials: [],
    layout: {},
    decor: [],
    rationales: [],
    confidence: 0.9,
    sources: [],
  };

  // Lưu suggestion
  const result = await suggestionSaveTool.execute({
    context: suggestionJson,
    runtimeContext: new RuntimeContext(),
    tracingContext: { currentSpan: undefined }
  });
  console.log('=== Saved Suggestion ID ===');
  console.log(result.id);

  // Đóng kết nối DB nếu cần
  // db.close();
}

demoFlow().catch(err => {
  console.error(err);
  process.exit(1);
});
