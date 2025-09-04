# 🧭 AI Interior Agent — Technical Specification (v1)

> Scope: Chi tiết kỹ thuật để đội dev triển khai MVP và mở rộng. Kiểu tài liệu: hướng dẫn triển khai + reference.

---

## 0) Tổng quan hệ thống

**Goal**: Agent tư vấn thiết kế nội thất theo nhu cầu user và đặc điểm phòng/nhà, hỗ trợ phân tích text và sinh gợi ý bố trí, style, palette. Các mở rộng liên quan đến ảnh/hình minh họa và gợi ý sản phẩm được mô tả trong `docs/future_features.md`.

**Stack (MVP)**
- Frontend: (Chưa ưu tiên – sẽ bổ sung web client đơn giản sau)
- Backend: Node.js (Express + TypeScript + Zod)
- Agentic RAG: Mastra (framework chính; không dùng fallback LangChain trong MVP)
- LLM: gpt-oss-20b (local qua Ollama API)
- Embedding: bge-m3 (Ollama)
- Vector DB: Chroma (tự host)
- Database: MongoDB (users, rooms, suggestions)
- DevOps: Docker + GitHub Actions (lint, test, build)


**Kiến trúc hệ thống (MVP)**

```
[Frontend UI]  <->  [Backend API]  <->  [Agentic RAG Engine]
                                         |--> [LLM Model: gpt-oss-20b local]
                                         |--> [Embedding Model: bge-m3 từ Ollama]
                                         |--> [Document Store / Vector DB: Chroma (tự host)]
                                         |--> [Retriever] (tìm kiếm tài liệu liên quan từ Vector DB)
                                         |--> [Database] (user, lịch sử chat)
```

**Lưu ý:** Agent sử dụng RAG (Mastra orchestration) để truy xuất tài liệu chuyên ngành, LLM sinh câu trả lời có cấu trúc + dẫn nguồn. Không sử dụng fallback LangChain trong phạm vi MVP.

**Mastra App Hiện Có:** `src/mastra/index.ts` (đang đăng ký `weatherAgent` & `weatherWorkflow` – deprecated, sẽ thay bằng `interiorAgent` & `suggestionWorkflow`).


## 1) Data Model (MongoDB)

> Tên DB: `ai_interior`

### 1.1 users (MVP)
```json
{
  "_id": "ObjectId",
  "email": "string",
  "name": "string",
  "created_at": "Date",
  "updated_at": "Date"
}
```

<!-- Bỏ collection projects trong MVP, dùng trực tiếp rooms gắn user_id -->

### 1.2 rooms (MVP)
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "type": "living|bedroom|kitchen|bathroom|office|other",
  "shape": "rectangle|square|l-shape|other",
  "dimensions": {"length_m": 5.2, "width_m": 3.4, "height_m": 2.8},
  "photos": [{"url": "string"}],
  "budget": {"currency": "VND", "min": 10000000, "max": 50000000},
  "style_target": ["minimal","scandinavian"],
  "notes": "string",
  "created_at": "Date",
  "updated_at": "Date"
}
```

### 1.3 design_suggestions (MVP)
```json
{
  "_id": "ObjectId",
  "room_id": "ObjectId",
  "agent_version": "string",
  "recommendations": {
    "style": ["minimal", "scandinavian"],
    "color_palette": ["#F2F2F2","#1F2937","#8B5E3C"],
    "materials": ["oak","linen","matte black"],
    "layout": [
      {"zone": "seating", "items": ["sofa 2.2m","armchair","coffee table ø70"], "position_hint": "east wall"}
    ],
  "decor": ["jute rug 160x230","2 wall frames 50x70"],
    "rationales": ["narrow room → slim sofa","north-facing → warm tones"]
  },
  "cost_estimate": {"currency": "VND", "items": [{"label":"sofa","cost":8000000}]},
  "created_at": "Date"
}
```

<!-- Bỏ product_catalog trong MVP -->

---

## 2) API Design (MVP)

**Versioning**: `/api/v1`
**Auth**: JWT (cookie/httpOnly) hoặc Bearer.
**Validation**: Zod/Joi. **Errors**: RFC7807-like `{type,title,detail,instance}`.

### 2.1 Auth
- `POST /auth/signup` {email,password,name}
- `POST /auth/login` {email,password}
- `POST /auth/logout`
- `GET /auth/me` → user

### 2.1 Rooms
- `POST /rooms` {type, dimensions, style_target?, budget?}
- `GET /rooms/:id`
- `PATCH /rooms/:id`
- `DELETE /rooms/:id`
- `POST /rooms/:id/photos` (multipart)

### 2.2 Suggestions
- `POST /rooms/:id/suggest`
  - Body: `{ goals, style_target?, budget? }`
  - Trả về `{suggestion_id, status: "queued"}`
- `GET /suggestions/:id`

<!-- Bỏ Catalog trong MVP -->

<!-- Bỏ Webhooks trong MVP -->

**Example: POST /rooms/:id/suggest**
```json
{
  "goals": {
    "use": "living room for family + occasional WFH",
    "style": ["japandi","minimal"],
    "palette_prefer": ["warm neutral"],
    "avoid": ["glossy surfaces"],
    "special": ["cat-friendly"]
  },
  "budget": {"currency":"VND","max":35000000},
  "constraints": {"rental": true},
  "mode": "text"
}
```

**Responses**
- `202 Accepted` `{suggestion_id, status}` rồi client poll `GET /suggestions/:id`.

---

## 3) Agent Workflow (Mastra)

> Tham chiếu minimal inputs: xem `minimal_inputs.md`. Backend phải validate đủ Hard‑Min trước khi tạo job suggest; nếu thiếu → HTTP 422.

### 3.1 Core Tools (Planned)
| Name | Input Schema (ref) | Output Schema (ref) | Notes | Status |
|------|--------------------|---------------------|-------|--------|
| room.fetch | RoomIdParam | Room | Trả 404 nếu không tồn tại | Planned |
| vector.search | VectorSearchQuery | VectorSearchResult | Wrap Chroma query (k, filter) | Planned |
| layout.plan | LayoutPlanInput | LayoutPlanOutput | Dùng minimal inputs + heuristics ánh sáng | Planned |
| palette.generate | PaletteInput | PaletteOutput | Cache theo style_target | Planned |
| suggestion.save | SuggestionPersistInput | SuggestionPersistResult | Gộp cost estimation nội bộ | Planned |

### 3.2 Core Schemas (trích – Zod)
| Schema | Mục đích |
|--------|----------|
| Room | Dữ liệu phòng (dimensions, type, style_target, photos) |
| SuggestionRequest | Payload yêu cầu gợi ý (goals, budget, constraints, mode) |
| MinimalInputsCore | Các trường Hard-Min layout (dimensions, openings, primary_use, screens, lighting_orientation) |
| SuggestionOutput | style[], color_palette[], materials[], layout[], decor[], rationales[], confidence |
| VectorSearchResult | Danh sách chunks {id, score, text, source, metadata} |
| LayoutPlanOutput | desk, alternatives[], assumptions[], next_data_to_improve[], confidence_partial |

### 3.3 Orchestration (Sequence)
1. room.fetch → lấy Room + validate minimal inputs.
2. vector.search → lấy top-k chunk (style/material/usage context).
3. layout.plan + palette.generate chạy song song (có thể) để tạo layout & palette.
4. Assemble Suggestion: hợp nhất RAG context + layout + palette → prompt LLM sinh JSON (schema SuggestionOutput). Tính confidence.
5. suggestion.save → lưu DB + trả id.

Retry: nếu parse JSON fail: tối đa 2 lần với prompt sửa lỗi.

### 3.4 Confidence
`confidence = clamp(0.4, 0.95, (core_present/core_total)*0.75 + (optional_present/optional_total)*0.25)`.
Trả trong SuggestionOutput.

> Tham chiếu minimal inputs: xem `minimal_inputs.md` (Hard-Min + Optional). Backend phải validate đủ Hard‑Min trước khi tạo job suggest; nếu thiếu → HTTP 422 với danh sách trường thiếu.

### 3.1 Tooling (MVP)
Tools:
- `room.fetch(room_id)` → room JSON
- `layout.plan(room, goals)` → layout JSON
- `palette.generate(preferences)` → màu gợi ý
- `suggestion.save(payload)` → DB id

### 3.2 Orchestration (Pseudo-sequence)
```
User → API /suggest → Job Queue → Worker
  1) Fetch room + goals
  2) Build context
  3) Gọi LLM sinh JSON (style, palette, layout, decor, rationales)
  4) Ước tính cost cơ bản
  5) Lưu suggestion; trả id
```

### 3.3 LLM Output JSON Schema (strict)
```json
{
  "style": ["string"],
  "color_palette": ["#RRGGBB"],
  "materials": ["string"],
  "layout": [
    {"zone":"string","items":["string"],"position_hint":"string","notes":"string?"}
  ],
  "decor": ["string"],
  "rationales": ["string"]
}
```

**Guardrails**: Use JSON schema + retries; fallbacks if parse fail.
## 3.5 Ingest Pipeline
Script: `scripts/ingest-docs.ts`
Steps: đọc file (pdf/md/txt) → chunk (max 800 tokens, overlap 80) → tính hash + token_count → embed (bge-m3) → upsert Chroma (collection ENV `CHROMA_COLLECTION`).
Metadata tối thiểu: source, doc_type, chunk_index, token_count, hash, created_at (ISO); optional: style_tags[].

## 3.6 Environment (Mastra & Backend)
| Variable | Mô tả |
|----------|------|
| MODEL_PROVIDER | ollama |
| MODEL_NAME | gpt-oss-20b |
| EMBEDDING_MODEL_NAME | bge-m3 |
| CHROMA_URL | URL Chroma |
| CHROMA_COLLECTION | Tên collection |
| MONGO_URI | Kết nối Mongo |
| MASTRA_LOG_LEVEL | info|debug |
| MASTRA_ENV | dev|prod |
| JWT_SECRET | Auth (tương lai) |

## 3.7 Evaluation (MVP)
Metric: JSON schema validity (>=95%), latency job (<=30s text), token usage total, confidence distribution (monitor min/mean). Manual spot-check 5 suggestion/tuần.

## 3.8 Observability
Log format JSON: {ts, level, request_id, tool, event, duration_ms}. Tool calls log start/end. request_id từ header hoặc uuid.

## 3.9 Deprecated
`weatherAgent`, `weatherWorkflow` sẽ bị gỡ sau khi `interiorAgent` & `suggestionWorkflow` hoạt động ổn định.


---

> NOTE: Các tính năng mở rộng (vision, image generation, product catalog, personalization, 3D/AR, v.v.) không được mô tả chi tiết trong tài liệu này để tránh lặp nội dung. Chi tiết và lộ trình cho các tính năng deferred được quản lý tập trung trong `docs/future_features.md` (canonical source). Vui lòng tham khảo file đó để biết mô tả đầy đủ.

---

## 4) Non‑functional (MVP)

**Perf**: P95 < 800ms (suggestion tạo job) – job hoàn thành < 30s.
**Security**: JWT httpOnly, validate input.
**Reliability**: Retry 1 lần nếu call LLM lỗi tạm thời.
**Logging**: request id, thời gian, token usage.

---

## 5) Prompting (Initial Draft)

**System Prompt (Agent)**
```
Bạn là Interior Design Agent. Trả lời ngắn gọn, có cấu trúc JSON theo schema đã cho. Luôn cân nhắc: kích thước phòng, ánh sáng, ngân sách, vật liệu sẵn có, an toàn (trẻ em/thú cưng), và luật thuê nhà. Không đề xuất vượt ngân sách. Khi thiếu dữ liệu, giả định an toàn và nêu rõ giả định.
```

**Few-shot Hints**
- Phòng hẹp → sofa mỏng, chân cao; màu sáng; gương cỡ lớn đối diện nguồn sáng nhưng tránh lóe.
- Hướng bắc ít sáng → 2700–3000K, chất liệu ấm.

**JSON Output Reminder**
- “Luôn output đúng schema, không thêm text ngoài JSON”.

---

## 6) Validation (MVP)

**Budget Check**: sum(cost_estimate.items) ≤ budget.max.
**Layout sanity**: mỗi zone có ≥1 item.

---

## 7) Simple UI Flow (MVP)
1. User tạo room (text form)
2. (Optional) upload ảnh (lưu URL đơn giản)
3. Gửi request suggest
4. Poll kết quả và hiển thị JSON parse → bảng + danh sách layout

---

## 8) CI/CD
**Envs**: dev, prod.
**CI**: lint, typecheck, unit test, docker build.
**CD**: manual deploy docker compose.

---

## 9) Testing
Unit: validators + LLM output parser.
Contract: OpenAPI schema.
E2E: create room → suggest → fetch suggestion.

---

## 10) Example Contracts

### 12.1 Zod Schemas (excerpt)
```ts
export const Budget = z.object({ currency: z.string(), min: z.number().optional(), max: z.number() });
export const Dimensions = z.object({ length_m: z.number().positive(), width_m: z.number().positive(), height_m: z.number().positive() });
export const SuggestionRequest = z.object({
  goals: z.object({ use: z.string(), style: z.array(z.string()).optional(), palette_prefer: z.array(z.string()).optional(), avoid: z.array(z.string()).optional(), special: z.array(z.string()).optional() }),
  budget: Budget.optional(),
  constraints: z.object({ rental: z.boolean().optional(), pet_friendly: z.boolean().optional(), no_paint: z.boolean().optional() }).optional(),
  mode: z.enum(["text","text+vision","vision"]).default("text")
});
```

### 12.2 OpenAPI (snippet)
```yaml
paths:
  /rooms/{id}/suggest:
    post:
      summary: Create interior suggestion
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SuggestionRequest'
      responses:
        '202': { description: Accepted }
        '400': { description: Bad Request }
        '401': { description: Unauthorized }
```

---

## 11) Job Worker Pseudocode
```ts
async function handleSuggestJob(job) {
  const room = await db.rooms.findById(job.roomId);
  const goals = job.payload.goals;

  let visionOut = null;
  if (job.payload.mode !== 'text') {
    visionOut = await tools.vision.analyze(room.photos.map(p=>p.url));
  }

  const llmInput = buildContext(room, goals, visionOut);
  const llmJson = await callLLMJson(llmInput, schema);

  const products = await maybeSearchCatalog(llmJson.product_queries, job.payload.budget);
  const cost = estimateCost(products);
  const doc = await db.suggestions.insert({ room_id: room._id, recommendations: { ...llmJson, product_refs: products.map(p=>p.sku) }, cost_estimate: cost });

  if (job.payload.render) triggerImageGen(doc._id, room.photos);
  return doc._id;
}
```

---

## 12) Security (MVP)
Audit log cơ bản: user_id, action, target_id.

---

## 13) Backlog
**MVP**
- [ ] Auth basic
- [ ] CRUD Room
- [ ] Upload ảnh (đơn giản URL)
- [ ] Suggestion (text) job
- [ ] View suggestion + palette + layout

**Next (deferred)**
Chi tiết các mục mở rộng (vision, catalog/pricing, image generation, personalization) được chuyển sang `docs/future_features.md`.

---

## 14) Environment Variables
```
NODE_ENV=production
MONGO_URI=mongodb+srv://...
S3_ENDPOINT=https://s3.local
S3_BUCKET=ai-interior
JWT_SECRET=...
LLM_PROVIDER=openai|anthropic|ollama
VISION_PROVIDER=...
VECTORDB_URL=...
REDIS_URL=redis://...
```

---

## 15) Acceptance Criteria (MVP)

1. Người dùng tạo project + room với dimensions & budget.
2. Upload ≥1 ảnh (optional cho MVP-text).
3. Gửi yêu cầu suggest → nhận `202` + `suggestion_id`.
4. Trong ≤30s (text)/≤120s (text+vision), `GET /suggestions/:id` trả về cấu trúc gợi ý đầy đủ (style, palette, layout, rationales) và tổng chi phí ước tính.
5. UI hiển thị palette chips, layout list, và lý do.

---

<!-- Bỏ 3D & AR trong MVP -->

---

**End of v1**

