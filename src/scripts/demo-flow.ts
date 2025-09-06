import "dotenv/config";
import db from '../db/sqlite';
import { interiorAgent } from '../mastra/agents/interior-agent';
import { suggestionSaveTool } from '../mastra/tools/suggestion-save';
import { SuggestionOutputSchema } from '../mastra/schemas/schemas';
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

  // Parse JSON từ output của agent
  let suggestionJson: any;
  try {
    // Gỡ markdown ```json và ```
    const raw = suggestion.text;
    const jsonText = raw
      .replace(/```json\s*/, '')
      .replace(/```$/, '');
    suggestionJson = JSON.parse(jsonText);
  } catch (err: any) {
    console.error('Không parse được JSON từ agent output:', err);
    process.exit(1);
  }
  // Chuẩn hóa dữ liệu để khớp schema (chỉ lưu string)
  const normalizedSuggestion = {
    style: suggestionJson.style,
    color_palette: suggestionJson.color_palette.map((c: any) => typeof c === 'string' ? c : c.hex),
    materials: suggestionJson.materials.map((m: any) => typeof m === 'string' ? m : m.item),
    layout: suggestionJson.layout,
    decor: suggestionJson.decor.map((d: any) => typeof d === 'string' ? d : d.item),
    rationales: suggestionJson.rationales,
    // Đặt default confidence nếu không có trong output
    confidence: suggestionJson.confidence,
  };

  // Validate theo schema
  SuggestionOutputSchema.parse(normalizedSuggestion);
  // Lưu suggestion
  const { id } = await suggestionSaveTool.execute({
    context: normalizedSuggestion,
    runtimeContext: new RuntimeContext(),
    tracingContext: { currentSpan: undefined }
  });
  console.log('=== Saved Suggestion ID ===');
  console.log(id);
}

demoFlow().catch(err => {
  console.error(err);
  process.exit(1);
});
