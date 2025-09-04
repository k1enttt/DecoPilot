# 📘 MVP Development Plan – Interior Design Agent

Phiên bản: v1 (khởi tạo)  
Ngày tạo: 2025-09-04  
Mục đích: Lưu lại kế hoạch triển khai chi tiết để tránh phải lập lại và dùng làm “single source of truth” cho tiến độ kỹ thuật.

---
## 0. Phạm vi MVP (Scope Lock)
**In**: Text-based interior suggestion (layout + style + palette + rationale + nguồn RAG), ingest tài liệu domain, lưu suggestion vào DB.  
**Out (Deferred)**: Vision (ảnh), image generation, product catalog, personalization nâng cao, evals tự động, auth đầy đủ, pricing, multi-room project.

---
## 1. Mục tiêu hoàn thành (Definition of Done)
1. Agent sinh JSON hợp lệ (qua Zod) chứa layout + palette + sources + confidence trực tiếp (không qua API).  
2. ≥ 1 tài liệu domain được ingest và truy xuất (vector.search trả về chunk liên quan).  
3. Suggestion được lưu vào SQLite và có thể truy vấn lại.  
4. Ingest script chạy thành công với log số chunk + thời gian.  
5. Tests: tối thiểu 1 unit/test per tool chính + 1 workflow e2e (mock LLM) + 1 retry parse JSON.  
6. Docker compose khởi chạy đủ: app + chroma + sqlite (+ vllm/ollama).  
7. README + checklist cập nhật phản ánh trạng thái mới nhất.

---
## 2. Kiến trúc tóm tắt
```
Client (deferred) -> Agentic RAG Engine (local)
                 -> Tools (room.fetch, vector.search, layout.plan, palette.generate, suggestion.save)
                 -> Chroma (RAG) + Ollama (Embedding) + VLLM (LLM) + SQLite (Persistence)
```
Workflow chiến lược: validate → fetch room → formulate query → retrieve → layout plan → palette gen → aggregate + score → persist (SQLite) → return.

---
## 3. Danh sách hạng mục & Thứ tự thực thi
| Order | Module | Mô tả | Output chính |
|-------|--------|-------|--------------|
| 1 | Structure | Tạo thư mục schemas/tools/workflows/db/scripts | Khung repo ổn định |
| 2 | Schemas | Zod: RoomInput, LayoutSuggestion, PaletteSuggestion, SuggestionOutput | Contract chuẩn |
| 3 | Ingest Script | scripts/ingest-docs.ts chunk + embed + upsert | CLI ingest chạy được |
| 4 | Chroma Adapter | Hàm upsert + search (k) + minScore filter | vector.search tool nền |
| 5 | Tools Base | room.fetch mock, vector.search, suggestion.save (stub SQLite) | Tool callable |
| 6 | LLM Adapter | callModel() wrap VLLM streaming + retry | Abstraction thống nhất |
| 7 | layout.plan Tool | Prompt JSON + Zod validate + 1 retry | LayoutSuggestion hợp lệ |
| 8 | palette.generate Tool | Dựa style + retrieved chunks | PaletteSuggestion |
| 9 | Workflow | suggestionWorkflow orchestrate + error path | Chạy end-to-end mock |
|10 | SQLite Repos | rooms, suggestions CRUD | Persistence thật |
|11 | Confidence Heuristic | Hàm score(layout, retrieval density, parse stability) | confidence field |
|12 | (Bỏ API) | Agent gọi trực tiếp workflow, không endpoint HTTP | |
|13 | Tests | Unit + e2e mock | Đảm bảo ổn định |
|14 | Docker/Compose | Services + env example | Dev parity |
|15 | Cleanup | Deprecate weather, docs update | Gọn nhẹ |

---
## 4. Zod Schemas (Draft)
Mô tả khung (chi tiết implement trong code):
- RoomInput: { dimensions { width_m, length_m, height_m? }, openings { door {x,y}, windows[] }, primary_use, workstation { screens }, lighting_orientation, style_target?, budget_level?, obstacles[], existing_furniture[], personal_priorities[], photos[] }
- RetrievedChunk: { id, source, text, score }
- LayoutSuggestion: { desk { position{x,y,width,depth}, orientation, rationale[] }, seating[], circulation_notes[], constraints_violated[] }
- PaletteSuggestion: { style, primary_colors[], accent_colors[], materials[], mood_words[] }
- SuggestionOutput: { layout, palette, rationale[], sources[], confidence (0-1) }

Validation rules:  
- width_m,length_m > 0  
- windows[].orientation in enum  
- confidence computed, không input.

---
## 5. Tools Chi tiết
| Tool | Input | Output | Logic tóm tắt |
|------|-------|--------|---------------|
| room.fetch | room_id | RoomInput | Đọc SQLite (tạm mock JSON) |
| vector.search | query,k | RetrievedChunk[] | Chroma query + filter score |
| layout.plan | RoomInput + retrieved summary | LayoutSuggestion | Prompt ràng buộc ưu tiên ánh sáng, flow, privacy |
| palette.generate | style_target?, retrieved[] | PaletteSuggestion | Trích phong cách + tone màu từ docs |
| suggestion.save | SuggestionOutput + meta | {id} | Lưu SQLite + index |

Retry JSON: parse fail → sửa prompt (prepend “ONLY JSON”) → lần 2 → nếu vẫn fail ghi error với truncated raw.

---
## 6. Prompting Notes (Initial Draft)
System: “You are an interior spatial planning assistant. Always output VALID JSON EXACTLY matching provided schema. Do not add commentary.”  
Few-shot: (1 ví dụ ngắn layout với rationale).  
Instruction: Chỉ dùng dữ kiện trong room + retrieved. Nếu giả định → thêm vào rationale với prefix `assumption:`.

---
## 7. Confidence Heuristic (v1)
```
coverage = (#hardMinFieldsPresent / totalHardMin)
retrievalQuality = avg(top5.score)
jsonPenalty = parseRetries >0 ? 0.9 : 1
confidence = clamp( (0.5*coverage + 0.4*retrievalQualityNormalized + 0.1*jsonPenalty), 0, 1 )
```
Normalized: map score min/max trong batch.

---
## 8. Error & Logging Strategy
Log fields: timestamp, level, request_id, step, duration_ms, error_code, chunks_returned.  
Retry policy: network 2 lần (exp backoff 300ms, 800ms).  
Hard abort: >15s LLM call.

---
## 9. Testing Matrix
| Test | Loại | Mục tiêu |
|------|------|----------|
| roomInput_valid | Unit | Schema pass |
| roomInput_missingField | Unit | Schema fail |
| vectorSearch_minScore | Unit | Filter hoạt động |
| layoutPlan_jsonRetry | Unit | Retry logic |
| paletteGenerate_basic | Unit | Schema valid |
| workflow_success | E2E (mock) | Full pipeline |
| workflow_lowRetrieval | Edge | Branch fallback query |
| suggestionSave_persist | Unit | SQLite insert |

Mocking: LLM trả JSON có thể inject lỗi thiếu dấu ngoặc để test retry.

---
## 10. Docker Compose (Outline)
Services: app, sqlite, chroma, vllm, (ollama optional).  
Mount: ./data/models -> vllm (model weights).  
Networks: shared `rag-net`.

---
## 11. Rủi ro & Giảm thiểu
| Rủi ro | Ảnh hưởng | Mitigation |
|--------|-----------|------------|
| JSON malformed | Block workflow | Zod + retry 1 lần |
| Retrieval irrelevant | Gợi ý sai | Tune query builder + minScore |
| LLM latency cao | UX kém | Streaming + timeout + concise prompt |
| Chroma inconsistency | Crash search | Version collection name |
| Parse drift khi thêm fields | Tests fail | Central schema export |

---
## 12. Lộ trình 14 ngày (Gợi ý)
(Chi tiết như bảng ‘Order’ – mapping ngày 1→14).  
Buffer 2 ngày cuối cho fix & polish.

---
## 13. Immediate Next Steps
1. Tạo schemas stub.  
2. Stub interiorAgent + đăng ký vào MastraApp (song song weather).  
3. Tạo vector.search & room.fetch skeleton.  
4. Viết ingest script (dry-run).  
5. Tích hợp SQLite cho persistence.  
6. Commit + cập nhật checklist.

---
## 14. Follow-up (Post-MVP Backlog)
- Vision (ảnh → feature extraction).  
- Product catalog + cost estimation thực.  
- Personal style profiling.  
- Evals + quality scoring.  
- Multi-language.

---
## 15. Nguyên tắc Triển khai
- “Schema First”: khóa schema trước mở rộng prompt.  
- Mỗi tool tự validate đầu ra.  
- Không âm thầm tự bịa facts ngoài retrieved sources.

---
Document này sẽ được cập nhật nếu có thay đổi phạm vi — mỗi thay đổi lớn nên bump version (v1 → v1.1 …) kèm changelog ngắn ở đầu file.
