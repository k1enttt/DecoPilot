# Kế hoạch Agile phát triển Interior Design Agent
Kế hoạch này giúp nhóm phát triển dự án theo từng mức độ hoàn thiện, đảm bảo tiến độ và chất lượng qua từng sprint.
Mỗi sprint có checklist rõ ràng, dễ theo dõi và cập nhật trạng thái công việc.


## Sprint 0: Chuẩn bị & Khởi tạo
- [x] Tạo repo, thiết lập cấu trúc thư mục chuẩn (docs/, src/, scripts/, db/, tests/)
- [x] Viết README, tài liệu định hướng dự án
- [x] Định nghĩa schema đầu vào/ra (RoomInput, SuggestionOutput, Zod schemas)
- [x] Thiết lập SQLite DB, Chroma vector DB, Docker compose cơ bản
- [x] Lên backlog, phân task cho các sprint tiếp theo

## Sprint 1: MVP tối thiểu
 **Checklist:**
 - [x] Xây dựng agent nhận input text, sinh JSON suggestion (layout, style, palette, rationale)
 - [x] Tool: layout.plan, palette.generate (stub, trả về mẫu)
 - [x] Lưu suggestion vào SQLite (repo CRUD đơn giản)
 - [ ] Viết test đơn giản cho agent & tool
	- [x] Demo flow: nhập input -> nhận suggestion -> lưu DB

## Sprint 2: MVP cơ bản
**Checklist:**
- [ ] Xây dựng script ingest tài liệu vào Chroma (chunk, embed, upsert)
- [ ] Tool: vector.search, room.fetch (mock dữ liệu phòng)
- [ ] Agent sử dụng RAG để truy xuất tài liệu khi sinh suggestion
- [ ] Unit test cho tool, workflow e2e (mock LLM)
- [ ] Log số chunk, thời gian ingest
- [ ] Demo: nhập input -> truy xuất tài liệu -> suggestion có nguồn

## Sprint 3: MVP ổn định
**Checklist:**
- [ ] Hoàn thiện các tool: room.fetch, vector.search, layout.plan, palette.generate, suggestion.save
- [ ] Xây dựng workflow orchestrate các bước, retry parse JSON nếu lỗi
- [ ] Docker compose chạy được app + chroma + sqlite (+ vllm/ollama nếu có)
- [ ] Logging chi tiết, error handling, confidence heuristic
- [ ] Test các trường hợp lỗi, retry, validate output
- [ ] Demo: flow end-to-end, có log, có retry, có confidence

## Sprint 4: Mở rộng input & kiểm thử
**Checklist:**
- [ ] Hỗ trợ input nâng cao: ảnh, vật cản, nội thất sẵn có, ưu tiên cá nhân
- [ ] Bổ sung schema, validate các trường hợp input
- [ ] Test matrix cho các trường hợp input/output, edge case
- [ ] Chuẩn bị cấu trúc cho UI web (deferred, mockup)
- [ ] Demo: nhập input nâng cao, nhận suggestion phù hợp

## Sprint 5: Refactor & chuẩn bị mở rộng
**Checklist:**
- [ ] Loại bỏ agent/workflow cũ (weather), cleanup code, xóa file thừa
- [ ] Chuẩn hóa schema, validate input/output toàn bộ hệ thống
- [ ] Cập nhật tài liệu, checklist, onboarding contributor mới
- [ ] Đánh giá, lên backlog cho các tính năng deferred (vision, image gen, personalization, catalog, pricing)
- [ ] Demo: hệ thống sạch, sẵn sàng mở rộng

---
**Lưu ý:**
- Mỗi sprint kéo dài 1-2 tuần, có demo/retrospective cuối sprint
- Ưu tiên hoàn thiện từng mức độ, có thể release sớm cho user test
- Backlog luôn cập nhật, có thể điều chỉnh thứ tự ưu tiên theo feedback
