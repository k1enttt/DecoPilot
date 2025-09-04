# Đề xuất cấu trúc thư mục dự án MVP Agentic RAG

```
interior-design-bot/
├── docs/
│   ├── checklist_mvp.md
│   ├── minimal_inputs.md
│   └── ...
├── data/
│   └── domain_docs/                # Tài liệu chuyên ngành gốc (md, txt, pdf)
├── scripts/
│   └── ingest-docs.ts              # Chunk -> embed -> upsert Chroma
├── src/
│   ├── mastra/
│   │   ├── index.ts                # MastraApp entry (hiện còn weatherAgent - deprecated)
│   │   ├── agents/
│   │   │   └── interior-agent.ts   # (Planned) interiorAgent
│   │   ├── tools/                  # room.fetch, vector.search, layout.plan, palette.generate, suggestion.save
│   │   ├── workflows/
│   │   │   └── suggestion-workflow.ts (Planned)
│   │   ├── retrievers/             # chroma-retriever.ts (Planned)
│   │   └── schemas/                # Zod schemas (Room, SuggestionRequest,...)
│   ├── api/
│   │   ├── routes/                 # rooms.ts, suggestions.ts
│   │   └── middleware/
│   ├── db/
│   │   └── mongo.ts
│   └── tests/                      # unit + workflow tests
├── package.json
├── pnpm-lock.yaml
└── README.md
```

## Giải thích các module chính
- `data/domain_docs/`: Lưu trữ tài liệu chuyên ngành để nạp vào Chroma.
- `backend/`: Chứa toàn bộ mã nguồn backend, pipeline RAG, kết nối LLM, embedding, DB.
 - `backend/`: Chứa toàn bộ mã nguồn backend, pipeline RAG, kết nối LLM, embedding, DB.
 - `frontend/`: (sẽ bổ sung web UI sau) Frontend nâng cao và các giao diện legacy được tách khỏi tài liệu MVP; chi tiết các mục frontend/vision/image-gen được tổng hợp trong `docs/future_features.md`.
 - `docker/`: Dockerfile và docker-compose để triển khai các thành phần.
- `docs/`: Tài liệu dự án, checklist, hướng dẫn sử dụng.

Ghi chú:
 - Cấu trúc cũ Python/Streamlit được coi là legacy và không phải là phần của MVP.
- `weather` agent/workflow được gắn nhãn deprecated và sẽ xoá sau khi interiorAgent hoạt động.

Bạn có muốn xem snippet mẫu cho tool hoặc workflow không?
