# Future / Deferred Features (extracted from existing docs)

> NOTE (CANONICAL): Đây là file nguồn duy nhất cho các tính năng "Future / Deferred". Các file docs khác chỉ nên chứa 1 câu tham chiếu tới file này khi đề cập các tính năng phát triển sau; không sao chép nội dung chi tiết tại chỗ.

Purpose: Tập hợp các tính năng được ghi là "mở rộng" / "phát triển sau" trong các tài liệu hiện có (không bổ sung nội dung mới). Mỗi mục gồm: tóm tắt ngắn dựa trên nội dung file và các trích dẫn nguyên văn từ file nguồn.

---

1) Vision / Phân tích ảnh

- Summary: Phân tích ảnh phòng / vision pipeline được ghi là tính năng phát triển sau MVP; ảnh có thể dùng làm input (photos[]) cho giai đoạn vision.
- Sources: `docs/ai_interior_agent_plan.md`, `docs/ai_interior_agent_technical_spec_v_1.md`, `docs/minimal_inputs.md`, `docs/project_structure_mvp.md`, `docs/checklist_mvp.md`
- Quotes from docs:
  - "Xử lý ảnh nâng cao, sinh ảnh minh họa, recommendation TMĐT, cá nhân hóa: sẽ phát triển sau khi hoàn thiện MVP." (`ai_interior_agent_plan.md`)
  - "Vision Model: phát triển sau." (`ai_interior_agent_plan.md`, `ai_interior_agent_technical_spec_v_1.md`)
  - Pseudocode line from worker (`ai_interior_agent_technical_spec_v_1.md`):
    `if (job.payload.mode !== 'text') {
      visionOut = await tools.vision.analyze(room.photos.map(p=>p.url));
    }`
  - `minimal_inputs.md` reference: `photos[] | URL ảnh | Tăng độ tin cậy (vision phase)`

---

2) Image generation / Sinh ảnh minh họa

- Summary: Image generation (rendering) is mentioned as a future feature and appears in worker pseudocode as an optional render step.
- Sources: `docs/ai_interior_agent_plan.md`, `docs/ai_interior_agent_technical_spec_v_1.md`, `docs/project_structure_mvp.md`
- Quotes from docs:
  - "sinh ảnh minh họa, recommendation TMĐT, cá nhân hóa: sẽ phát triển sau khi hoàn thiện MVP." (`ai_interior_agent_plan.md`)
  - Pseudocode line from worker (`ai_interior_agent_technical_spec_v_1.md`):
    `if (job.payload.render) triggerImageGen(doc._id, room.photos);`

---

3) Product catalog & pricing (recommendation / TMĐT)

- Summary: Product catalog and dynamic pricing are described as future/backlog items; pseudocode shows optional catalog search + cost estimation.
- Sources: `docs/ai_interior_agent_plan.md`, `docs/ai_interior_agent_technical_spec_v_1.md`, `docs/checklist_mvp.md`
- Quotes from docs:
  - Plan mentions: "Gợi ý sản phẩm/tham khảo mẫu thiết kế có dẫn nguồn tài liệu." (`ai_interior_agent_plan.md`)
  - Pseudocode lines (`ai_interior_agent_technical_spec_v_1.md`):
    `const products = await maybeSearchCatalog(llmJson.product_queries, job.payload.budget);`
    `const cost = estimateCost(products);`
  - `technical_spec` also contains comment: `<!-- Bỏ product_catalog trong MVP -->`
  - `checklist_mvp.md` lists: `- [ ] Catalog + pricing` under Next

---

4) Personalization / Memory / User embeddings

- Summary: Personalization (memory, user embeddings) is listed as a later enhancement; the docs also mention vector DB (Chroma) in contexts that include personalization as future use.
- Sources: `docs/ai_interior_agent_plan.md`, `docs/ai_interior_agent_technical_spec_v_1.md`, `docs/checklist_mvp.md`, `docs/project_structure_mvp.md`
- Quotes from docs:
  - "cá nhân hóa: sẽ phát triển sau khi hoàn thiện MVP." (`ai_interior_agent_plan.md`)
  - Backlog (`ai_interior_agent_technical_spec_v_1.md`): `- [ ] Personalization` (listed under Next)
  - From plan: "Vector DB: Chroma để lưu embedding (cá nhân hóa)."

---

5) Frontend rich UI / Web client (Next.js) and legacy Streamlit notes

- Summary: Frontend web UI is marked as "will be added later" / deferred; some files still reference a legacy Streamlit artifact.
- Sources: `docs/ai_interior_agent_plan.md`, `docs/ai_interior_agent_technical_spec_v_1.md`, `docs/project_structure_mvp.md`, `docs/checklist_mvp.md`
- Quotes from docs:
  - "Giao tiếp: Chat (UI web đơn giản sẽ bổ sung sau – không dùng Streamlit trong MVP)." (`ai_interior_agent_plan.md`)
  - `project_structure_mvp.md` includes `frontend/streamlit_app.py` with note that the old Python/Streamlit UI was removed in docs ("không dùng ở MVP").
  - `checklist_mvp.md` marks frontend items as Deferred

---

6) Deployment scaling: Docker Swarm / Kubernetes

- Summary: Docker is recommended for MVP; Swarm/Kubernetes are mentioned for scaling/hosting beyond MVP.
- Sources: `docs/ai_interior_agent_plan.md`, `docs/ai_interior_agent_technical_spec_v_1.md`, `docs/project_structure_mvp.md`
- Quotes from docs:
  - `ai_interior_agent_plan.md`: "DevOps: Docker, GitHub Actions." and "Hosting: Tự host (on-premise hoặc server riêng)."
  - `ai_interior_agent_plan.md` & `technical_spec`: "Docker, Docker Swarm hoặc Kubernetes." (mentioned under Hosting/DevOps)
  - `project_structure_mvp.md` references `docker/` and docker-compose

---

7) Product catalog storage / DB collection

- Summary: The data model and pseudocode include `cost_estimate` and product refs, but other places explicitly mark product_catalog as excluded from MVP.
- Sources: `docs/ai_interior_agent_technical_spec_v_1.md`, `docs/checklist_mvp.md`
- Quotes from docs:
  - In schema/pseudocode: `cost_estimate` and `product_refs` are present in examples (`ai_interior_agent_technical_spec_v_1.md`).
  - Comment in doc: `<!-- Bỏ product_catalog trong MVP -->` (`ai_interior_agent_technical_spec_v_1.md`).
  - `checklist_mvp.md` lists catalog/pricing under Next.

---

8) Image / Vision-driven API modes (example uses "text+vision" / schema enum)

- Summary: The API schema includes `mode: "text+vision" | "vision"` but vision is treated as future; example requests sometimes show `mode: "text+vision"` which creates ambiguity in current docs.
- Sources: `docs/ai_interior_agent_technical_spec_v_1.md`, `docs/ai_interior_agent_plan.md`, `docs/minimal_inputs.md`
- Quotes from docs:
  - Zod schema excerpt: `mode: z.enum(["text","text+vision","vision"]).default("text")` (`ai_interior_agent_technical_spec_v_1.md`)
  - Example request in API snippet: `"mode": "text+vision"` (`ai_interior_agent_technical_spec_v_1.md`)
  - `minimal_inputs.md` marks `photos[]` as: `URL ảnh | Tăng độ tin cậy (vision phase)`

---

9) Advanced UX / Visualization placeholders

- Summary: Visualization (placeholder layout) and roadmap items for image generation are listed as future sprint work.
- Sources: `docs/ai_interior_agent_plan.md`, `docs/ai_interior_agent_technical_spec_v_1.md`, `docs/project_structure_mvp.md`
- Quotes from docs:
  - Sprint 3 (`ai_interior_agent_plan.md`): "Visualization cơ bản (placeholder layout) / roadmap image gen." 

---

10) Environment/provider mentions relevant to future features

- Summary: Environment variables include providers and placeholders that imply optional future integrations (e.g., vision provider), as present in the technical spec; these are included here as references only.
- Sources: `docs/ai_interior_agent_technical_spec_v_1.md`, `docs/project_structure_mvp.md`
- Quotes from docs:
  - Environment variables excerpt includes: `LLM_PROVIDER`, `VISION_PROVIDER`, `VECTORDB_URL`, etc. (`ai_interior_agent_technical_spec_v_1.md`)

---

End of extracted list.

Notes:
- This file contains only summaries and verbatim quotes taken from the existing docs and does not add new features or implementation details.
- Use this file as the single source-of-truth for features that are explicitly described as deferred / future in the repository docs.

