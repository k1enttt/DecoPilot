# Checklist Triển khai MVP Agentic RAG Nội thất

## 1. Chuẩn bị tài liệu chuyên ngành
- [ ] Thu thập tài liệu (markdown, PDF, txt)
- [ ] Chuyển đổi tài liệu sang định dạng dễ xử lý (ưu tiên markdown/txt)
- [ ] Kiểm thử pipeline nạp tài liệu vào Chroma

## 2. Backend & Agentic RAG (Mastra)
- [ ] Xác minh `src/mastra/index.ts` có đăng ký interiorAgent (thay thế weatherAgent)
- [ ] Định nghĩa tools: room.fetch, vector.search, layout.plan, palette.generate, suggestion.save
- [ ] Tích hợp LLM gpt-oss-20b (Ollama)
- [ ] Tích hợp Embedding bge-m3 (Ollama)
- [ ] Tích hợp Chroma (collection ENV)
- [ ] Workflow `suggestionWorkflow` orchestrates fetch→retrieve→layout/palette→persist
- [ ] Confidence calculation & inclusion in SuggestionOutput
- [ ] Logging tool timing + request_id

## 3. Database
- [ ] Cài đặt MongoDB (lưu user, lịch sử chat)
- [ ] Tích hợp backend với MongoDB

## 4. Frontend MVP (Deferred)
- [ ] Thiết kế minimal web UI (Next.js hoặc HTML đơn giản)
- [ ] Kết nối API suggest
- [ ] Hiển thị trích dẫn nguồn

## 5. Kiểm thử & Demo
- [ ] Test tool đơn lẻ (mocks) (room.fetch, layout.plan)
- [ ] Test workflow end-to-end (mock LLM) parse JSON
- [ ] Schema validation (Zod) + retry parse
- [ ] Kiểm thử pipeline ingest (≥1 doc vào Chroma)
- [ ] Xác minh Hard-Min inputs đủ trước layout (xem `minimal_inputs.md`)
- [ ] Tài liệu hướng dẫn sử dụng MVP cập nhật Mastra

## 6. DevOps & Hosting
- [ ] Docker hóa: backend, Ollama, Chroma, Mongo
- [ ] Compose file cập nhật biến ENV Mastra
- [ ] CI: lint, typecheck, test, build image

## 7. Tài liệu hóa & bảo trì
- [ ] Cập nhật README (stack Mastra, weather deprecated)
- [ ] Bảng tools & schemas đồng bộ với code
- [ ] Plan mở rộng: các mục deferred (vision, image generation, product catalog, personalization, v.v.) được quản lý tập trung trong `docs/future_features.md` — tham khảo file đó.
- [ ] Xóa weather agent/workflow sau khi interiorAgent ổn định (Deferred)
