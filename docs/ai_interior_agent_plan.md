# 📁 Kế hoạch phát triển AI Agent tư vấn thiết kế nội thất

## 1. Mục tiêu dự án
  - Xây dựng Agentic RAG AI tư vấn thiết kế nội thất, có khả năng học và truy xuất thông tin từ tài liệu chuyên ngành do người dùng cung cấp.
  - Hiểu nhu cầu người dùng (gu thẩm mỹ, ngân sách, mục đích sử dụng phòng).
  - Phân tích thông tin căn phòng/nhà (kích thước, bố cục, hình ảnh).
  - Đề xuất ý tưởng thiết kế nội thất phù hợp (phong cách, màu sắc, vật liệu, bố trí đồ nội thất) dựa trên kiến thức thực tế từ tài liệu chuyên ngành.
  - Gợi ý sản phẩm/tham khảo mẫu thiết kế có dẫn nguồn tài liệu.


---

## 2. Phạm vi tính năng
### 2.1 Giai đoạn MVP
  - Giao tiếp: Chat (UI web đơn giản sẽ bổ sung sau – không dùng Streamlit trong MVP).
  - Input: Text (mô tả phòng, phong cách, ngân sách) – xem `minimal_inputs.md` cho bộ tối thiểu layout.
  - Output: Tư vấn phong cách, màu sắc, bố trí nội thất, có trích dẫn nguồn từ tài liệu chuyên ngành.
  - Agent sử dụng RAG (Mastra + LLM local gpt-oss-20b + embedding bge-m3 + Chroma) để truy xuất tài liệu chuyên ngành.

### 2.2 Giai đoạn mở rộng
  - Các tính năng mở rộng (vision, image generation, product catalog, personalization, v.v.) được tóm tắt và quản lý trong `docs/future_features.md`. Vui lòng tham khảo file đó để biết chi tiết và lộ trình mở rộng.

---

### 2.3 Minimal Viable User Inputs (tóm tắt)
Để sinh gợi ý bố trí (ví dụ vị trí & hướng bàn) cần tối thiểu: kích thước phòng, cửa & cửa sổ (vị trí + hướng), mục đích sử dụng chính, nhu cầu workstation (số màn hình), hướng nhận sáng. Chi tiết đầy đủ & schema xem `docs/minimal_inputs.md`.

---

## 3. Kiến trúc hệ thống

```
[Frontend UI]  <->  [Backend API]  <->  [Agentic RAG Engine]
                                         |--> [LLM Model: gpt-oss-20b local]
                                         |--> [Embedding Model: bge-m3 từ Ollama]
                                         |--> [Document Store / Vector DB: Chroma (tự host)]
                                         |--> [Retriever] (tìm kiếm tài liệu liên quan từ Vector DB)
                                         |--> [Database] (user, lịch sử chat)
```

**Lưu ý:** Agent sẽ sử dụng RAG để truy xuất thông tin từ tài liệu chuyên ngành, kết hợp LLM để sinh câu trả lời chính xác, có dẫn nguồn. Framework đề xuất: Mastra, LLM (gpt-oss-20b hoặc tương đương), Vector DB (Weaviate/Pinecone/Qdrant).

---

## 4. Công nghệ đề xuất


- **Frontend**: (Sẽ bổ sung sau) – giai đoạn này ưu tiên backend + agent; dự kiến Next.js/Tailwind.
- **Backend**: Node.js (Express hoặc HTTP nhẹ) + TypeScript.
- **Agentic RAG**: Mastra (framework chính cho agent, tool, workflow).
- **LLM**: gpt-oss-20b (local qua Ollama).
- **Embedding Model**: bge-m3 (Ollama).
- **Vector DB**: Chroma (self-host).
 - **Vision / Image Generation / Other deferred features**: chi tiết các mở rộng được tập trung trong `docs/future_features.md` (không lặp ở tài liệu này).
- **Database**: MongoDB (user, rooms, suggestions).
- **DevOps**: Docker, GitHub Actions.
- **Hosting**: Tự host (on-premise hoặc server riêng).

### Pipeline nạp tài liệu chuyên ngành

- Tài liệu (PDF, markdown, web, v.v.) được chuyển đổi thành vector thông qua Embedding Model bge-m3 (Ollama).
- Vector lưu vào Document Store/Vector DB Chroma.
- Agent sử dụng Retriever để tìm kiếm các đoạn tài liệu liên quan khi có truy vấn từ user.

- **AI Agent Engine**:  
  - Framework: Mastra (agents + tools + workflows; không dùng fallback LangChain trong MVP).
  - LLM: gpt-oss-20b (local qua Ollama API).
  - Embedding Model: bge-m3 (Ollama).
  - Document Store/Vector DB: Chroma.
  - Vision / Image Generation / Other deferred features: xem `docs/future_features.md`.
  - Pipeline: Retrieval-Augmented Generation (RAG) — tích hợp module truy xuất tài liệu chuyên ngành (Chroma, embedding bge-m3, search) để tăng độ chính xác và căn cứ cho tư vấn.

- **Database**:  
  - MongoDB (lưu gợi ý, người dùng, lịch sử chat).
  - Vector DB: Chroma để lưu embedding (cá nhân hóa).

- **Hosting/DevOps**:  
  - Docker, Docker Swarm hoặc Kubernetes.
  - Hosting: Tự host (on-premise hoặc server riêng).

---

## 5. Các module chính
1. **User Interaction Module**  
  - (Sẽ bổ sung) UI web nhẹ hiển thị chat & trích dẫn; giai đoạn đầu tập trung backend.

2. **Design Suggestion Module**  
  - Sử dụng LLM + RAG để đưa ra tư vấn dựa trên input text.
  - Mapping nhu cầu → phong cách → bố trí cơ bản, có trích dẫn nguồn tài liệu.

3. **Knowledge Retrieval Module**  
  - Quản lý, truy xuất và cập nhật tài liệu chuyên ngành cho agent.
  - Tích hợp với Chroma, embedding bge-m3, search để phục vụ quy trình Agentic RAG.

4. **Database Module**
  - Lưu hồ sơ người dùng, lịch sử chat bằng MongoDB.

Các tính năng mở rộng (ví dụ: vision, image generation, recommendation TMĐT, personalization) được tách ra và mô tả đầy đủ trong `docs/future_features.md`.

---

## 6. Lộ trình phát triển
### Sprint 1 (2-3 tuần)
- Thiết lập dự án (repo, CI/CD, kiến trúc Mastra).  
- Tạo Mastra agent `interiorAgent`, tools & workflow `suggestionWorkflow`.  
- Tích hợp LLM & embedding + Chroma + MongoDB.  

### Sprint 2 (2-3 tuần)
- Gợi ý phong cách + màu sắc + bố trí (tối ưu prompt + confidence).  
- Lưu dữ liệu người dùng vào DB + ingestion tài liệu domain.  
- (Chuẩn bị) thiết kế UI web.  

### Sprint 3 (3-4 tuần)
- UI/UX refinement and placeholder visualization tasks; detailed work on visualization, image generation and product-catalog/pricing are deferred and documented in `docs/future_features.md`.

### Sprint 4 (mở rộng)
- Cá nhân hóa gợi ý (memory / embedding user preference).
- Tích hợp TMĐT thực.
- Beta release.

---

## Mastra Adoption (MVP)
| Thành phần | Trạng thái | Ghi chú |
|------------|-----------|--------|
| Agent (`interiorAgent`) | Planned | Sẽ thay thế `weatherAgent` (deprecated) |
| Workflow (`suggestionWorkflow`) | Planned | Orchestrates fetch→retrieve→layout/palette→persist |
| Tools | Planned | room.fetch, vector.search, layout.plan, palette.generate, suggestion.save |
| Ingest Script | Planned | `scripts/ingest-docs.ts` chunk 800/80 |
| Confidence | Planned | Tính theo độ đủ minimal inputs |

Minimal inputs cho layout: xem `minimal_inputs.md`.

---

## 7. Đánh giá & Mục tiêu thành công
- **MVP thành công** khi:  
  - Người dùng nhập thông tin căn phòng và nhận được gợi ý thiết kế có giá trị thực tế.  
  - UI thân thiện, phản hồi nhanh (<5s).  
- **Thành công mở rộng** khi:  
  - AI Agent có thể phân tích hình ảnh + gợi ý chính xác hơn.  
 - **Thành công mở rộng** khi:  
  - AI Agent có thể phân tích hình ảnh + gợi ý chính xác hơn.  
  - Các mục mở rộng (ví dụ: sinh ảnh minh họa, tích hợp sản phẩm thương mại) được mô tả trong `docs/future_features.md`.

