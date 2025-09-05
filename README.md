# 🧭 Interior Design Agent MVP

Tài liệu README này tóm tắt nhanh kiến trúc & cách chạy phiên bản **MVP** của dự án AI Interior Design Agent (Agentic RAG).

## 1. Mục tiêu MVP
Mục tiêu chức năng cốt lõi phiên bản đầu: nhập mô tả phòng (và ảnh sau này) -> nhận gợi ý thiết kế có cấu trúc (style, màu, layout, décor) kèm lý do; giới hạn phạm vi ở tư vấn text + RAG.
- Chat tư vấn thiết kế nội thất dựa trên mô tả phòng + (tuỳ chọn) ảnh tham chiếu.
- Đề xuất: phong cách, bảng màu, vật liệu, layout cơ bản, décor + giải thích ngắn.
- Truy xuất kiến thức từ tài liệu chuyên ngành (RAG) + sinh câu trả lời có cấu trúc.
- Lưu lịch sử yêu cầu & gợi ý để tham chiếu lại.

## 2. Kiến trúc (MVP)
Sơ đồ: UI (deferred) → Mastra Agent (LLM + Retriever + Vector DB) → JSON gợi ý.
```
[User Web UI]* <-> [Mastra Agent]
                 |--> LLM (gpt-oss-20b - VLLM)
                 |--> Embedding (bge-m3 - Ollama)
                 |--> Vector DB (Chroma)
                 |--> Lưu dữ liệu trực tiếp ở local bằng SQLite
```
(* UI sẽ bổ sung sau – hiện tập trung agent chạy local, không có API trung gian.)

## 3. Stack chính
Mastra là framework agent duy nhất (không dùng LangChain/Streamlit trong MVP).
| Thành phần | Công nghệ |
|------------|-----------|
| Frontend (Deferred) | Web client (Next.js dự kiến) |
| Agent Framework | Mastra (@mastra/core) |
| LLM | gpt-oss-20b (Ollama) |
| Embedding | bge-m3 (Ollama) |
| Vector Store | Chroma (self-host) |
| Database | SQLite (file .db local, không cần server) |
| DevOps | Docker + GitHub Actions |

### 3.1 Core Mastra Components
| Thành phần | File / Ghi chú |
|------------|---------------|
| MastraApp Entry | `src/mastra/index.ts` (weatherAgent/weatherWorkflow = deprecated) |
| Agent (Planned) | `interiorAgent` (`src/mastra/agents/interior-agent.ts`) |
| Workflow (Planned) | `suggestionWorkflow` |
| Tools (Planned) | room.fetch, vector.search, layout.plan, palette.generate, suggestion.save |
| Minimal Inputs | `docs/minimal_inputs.md` |
| Tools & Schemas Spec | `docs/ai_interior_agent_technical_spec_v_1.md` |

## 3.a Documentation Map (Reading Order)
Thứ tự đọc tài liệu khuyến nghị và lối tắt cho từng vai trò.
| # | File | Vai trò | Khi đọc |
|---|------|---------|---------|
|1|`docs/ai_interior_agent_plan.md`|Tổng quan, mục tiêu, phạm vi|Mở đầu|
|2|`docs/minimal_inputs.md`|Input tối thiểu & fallback|Thiết kế form / validation|
|3|`docs/ai_interior_agent_technical_spec_v_1.md`|Kiến trúc + API + workflow|Implement backend/agent|
|4|`docs/project_structure_mvp.md`|Cấu trúc thư mục & module|Setup / refactor|
|5|`docs/mvp_development_plan.md`|Kế hoạch triển khai chi tiết (source-of-truth)|Kickoff / theo dõi tiến độ|
|6|`docs/checklist_mvp.md`|Tiến độ & việc còn thiếu|Theo dõi / planning|
|7|`docs/agent_persona.md`|Persona & hành vi agent|Định hướng prompt, kiểm thử, onboarding|
|7|`docs/future_features.md`|Future / Deferred features (canonical)|Tham khảo khi lập kế hoạch mở rộng|

Quick Paths:
- PM: 1 → 5
- Backend Dev: 1 → 2 → 3 → (4) → 5
- Contributor mới: 1 → 4 → 2 → 3 → 5
- Chỉ cần biết input: 2


## 4. Data Model (rút gọn)
design_suggestions: { _id, room_id, agent_version, recommendations { style[], color_palette[], materials[], layout[], decor[], rationales[] }, cost_estimate }
Nhìn tổng quát 3 collection chính để hiểu cấu trúc dữ liệu đi qua agent.
```
users: { _id, email, name, created_at, updated_at }
rooms: { _id, user_id, type, dimensions, photos[], budget, style_target[], notes }
design_suggestions: { _id, room_id, agent_version, recommendations { style[], color_palette[], materials[], layout[], decor[], rationales[] }, cost_estimate }
```
*Dữ liệu được lưu trực tiếp ở local bằng SQLite, không qua API.*

## 5. Lưu trữ dữ liệu
Toàn bộ dữ liệu phòng, gợi ý, lịch sử chat được lưu trực tiếp ở local bằng SQLite (file .db). Không sử dụng các endpoint API hay backend server.
Ví dụ dữ liệu đầu vào cho agent:
```json
{
  "goals": { "use": "phòng khách gia đình", "notes": "ưu tiên sáng ấm" },
  "style_target": ["minimal","scandinavian"],
  "budget": { "currency": "VND", "max": 40000000 }
}
```

## 6. Luồng xử lý Suggestion
Chuỗi bước nội bộ từ yêu cầu người dùng (qua chatbox) đến JSON gợi ý cuối cùng lưu local.
1. Người dùng nhập mô tả phòng qua chatbox.
2. Agent lấy thông tin phòng + goals từ input chat.
3. Tạo context RAG (truy xuất tài liệu embedding từ Chroma theo từ khoá style / vật liệu).
4. Gọi LLM sinh JSON (schema cố định).
5. Ước tính chi phí đơn giản (mapping layout items → cost mẫu).
6. Lưu vào bảng `design_suggestions` trong SQLite để tham chiếu lại.

## 7. Prompt dạng mẫu (rút gọn)
Khung định hướng LLM giữ đúng schema, nêu giả định khi thiếu dữ liệu và tuân thủ ngân sách.
```
Bạn là Interior Design Assistant.
Input: thông tin phòng + mục tiêu + style + budget.
Output JSON với các trường: style[], color_palette[], materials[], layout[], decor[], rationales[].
Không vượt quá ngân sách. Nếu thiếu dữ liệu → giả định an toàn và ghi rõ.
```

## 8. Chạy dự án
Điều kiện môi trường và lệnh cơ bản để khởi chạy môi trường dev demo hiện tại.
### 8.1 Điều kiện
- Node.js ≥ 20
- Đã cài `pnpm` / `npm`
- Ollama đã pull model:  `bge-m3`
- Chạy Chroma server (hoặc dùng embedded mode tạm)

### 8.2 Cài đặt & chạy
```bash
pnpm install
pnpm dev
```
Agent sẽ chạy trực tiếp ở local, lưu dữ liệu vào file hoặc bộ nhớ, không cần backend server/API.

### 8.3 Demo Flow
Bạn có thể chạy demo end-to-end (generate + save) bằng lệnh sau:
```bash
pnpm demo
```
Trước khi chạy, hãy đảm bảo:
- Đã cài đặt dependencies: `pnpm install`
- Thiết lập biến môi trường trong `.env` (ví dụ `GENERATE_MODEL`, `CHROMA_URL` nếu cần)
- Chuẩn bị SQLite file (sẽ tự động tạo nếu chưa có)

Lệnh này sẽ:
1. Gọi `interiorAgent.generate` với input mẫu.
2. Hiển thị output JSON từ agent.
3. Gọi `suggestionSaveTool.execute`, lưu vào SQLite và in ra ID kết quả.

## 9. Migration từ weather demo → interior agent
Weather agent/workflow hiện diện để minh hoạ — được gắn nhãn deprecated.
| Bước | Hành động |
|------|-----------|
| 0 | Kiểm tra `src/mastra/index.ts` export MastraApp (log level ok) |
| 1 | Thêm schemas (Room, SuggestionRequest, MinimalInputsCore) |
| 2 | Implement tools: room.fetch, vector.search |
| 3 | Implement tools: layout.plan, palette.generate |
| 4 | Implement suggestion.save (gộp cost estimation) |
| 5 | Ingest tài liệu domain (scripts/ingest-docs.ts) |
| 6 | Workflow `suggestionWorkflow` + LLM JSON + retries |
| 7 | Thêm confidence vào SuggestionOutput |
| 8 | E2E test mock LLM + parse validation |
| 9 | Gỡ weather agent/workflow |

## 10. Backlog (MVP → Next)
Phân tầng công việc: những gì phải có cho MVP và nhóm mở rộng tiếp theo để lập kế hoạch sprint.
MVP: suggest text, lưu lịch sử phòng/gợi ý ở local.
Next: vision (ảnh), catalog, image generation, personalization, tích hợp API nếu cần mở rộng.

## 11. Thư mục đề xuất tiếp theo
Xem chi tiết cấu trúc trong `docs/project_structure_mvp.md` (đã chuyển sang Mastra + TypeScript).

## 12. Ghi chú phát triển
Nguyên tắc cần duy trì: ổn định schema sớm, log đủ ngữ cảnh RAG, kiểm soát token & latency trước khi thêm vision.
- Ưu tiên ổn định JSON schema trước khi mở rộng vision.
- Thêm kiểm soát token usage và thời gian phản hồi.
- Ghi log đủ để tái hiện prompt và context (cần cho debug RAG).

---
✅ README này phục vụ định hướng nhanh cho team dev. Tiếp theo: implement tools & workflow interiorAgent.
