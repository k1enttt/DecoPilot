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
│   ├── db/
│   │   └── sqlite.ts               # SQLite persistence
│   └── tests/                      # unit + workflow tests
├── package.json
├── pnpm-lock.yaml
└── README.md
```


## Giải thích các module chính
- `data/domain_docs/`: Lưu trữ tài liệu chuyên ngành để nạp vào Chroma.
- `src/mastra/`: Agent, tools, workflows, retrievers, schemas (Zod).
- `src/db/sqlite.ts`: Kết nối và thao tác với SQLite.
- `scripts/`: ingest-docs.ts để chunk, embed, upsert vào Chroma.
- `src/tests/`: Unit + workflow tests.
- `docs/`: Tài liệu dự án, checklist, hướng dẫn sử dụng.
- `docker/`: Dockerfile và docker-compose để triển khai các thành phần.


Ghi chú:
- Cấu trúc cũ Python/Streamlit được coi là legacy và không phải là phần của MVP.
- `weather` agent/workflow được gắn nhãn deprecated và sẽ xoá sau khi interiorAgent hoạt động.

Bạn có muốn xem snippet mẫu cho tool hoặc workflow không?
