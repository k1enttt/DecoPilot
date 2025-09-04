# Minimal Viable User Inputs (Layout & Interior Suggestion Seed)

Mục đích: Bộ dữ liệu nhỏ nhất cần thu để AI sinh gợi ý bố trí (đặc biệt vị trí & hướng bàn làm việc) với độ tin cậy chấp nhận được; kèm mở rộng nâng chất lượng. Được tiêu thụ bởi tool `layout.plan` và workflow `suggestionWorkflow` (Mastra) – xem `src/mastra/index.ts`.

## 1. Hard-Min (bắt buộc)
| Key | Mô tả | Ghi chú |
|-----|------|---------|
| dimensions.width_m, length_m | Kích thước mặt bằng (m) | 2 số dương |
| openings.door.position | Tọa độ cửa (m) | Gốc (0,0) là góc tây–bắc | 
| openings.windows[] | `{position:{x,y}, width, height, orientation}` | Orientation: N/S/E/W/NE/NW/SE/SW |
| primary_use | `office|bedroom|living|mixed` | Dùng để ưu tiên ánh sáng / riêng tư |
| workstation.screens | `1|2` | Mặc định 1 nếu thiếu |
| lighting_orientation | Hướng chính nhận sáng (nếu khác orientation cửa sổ) | Nếu thiếu suy từ cửa sổ lớn nhất |

Tối thiểu cần đủ để xác định: vùng khả dụng, nguồn sáng, nhu cầu bàn.

## 2. Optional (nâng chất lượng)
| Nhóm | Trường | Tác dụng |
|------|--------|----------|
| dimensions.height_m | Chiều cao | Gợi ý tủ/kệ đứng |
| obstacles[] | `{type, position:{x,y}, w,d}` | Loại trừ vùng đặt bàn |
| existing_furniture[] | `{kind, w,d, movable:boolean}` | Giảm xung đột layout |
| style_target | 1 phong cách chính | Ảnh hưởng palette & vật liệu |
| budget_level | `low|mid|flex` | Điều chỉnh đề xuất vật liệu |
| personal_priorities | ≤3 giá trị: `light|quiet|open|video_bg|easy_clean` | Thay đổi weighting |
| photos[] | URL ảnh | Tùy chọn — tích hợp vision-phase được mô tả chi tiết trong `docs/future_features.md` |

## 3. Fallback / Assumptions
| Thiếu | Giả định | Flag assumption? |
|-------|---------|------------------|
| lighting_orientation | "N" | Có |
| workstation.screens | 1 | Có |
| obstacles | none | Không |
| style_target | "minimal" | Có |

## 4. Thứ tự ưu tiên khi xung đột
1. Ánh sáng & tránh chói (light ergonomics)
2. Luồng di chuyển (≥70cm clear path)
3. Tầm nhìn cửa ra vào (an toàn / tập trung)
4. Riêng tư & nền họp video
5. Thẩm mỹ / phong cách

## 5. Output Layout (rút gọn JSON)
```json
{
  "layout_version": "1.0",
  "desk": {
    "position": { "x": 1.2, "y": 0.8, "width": 1.4, "depth": 0.7, "unit": "m" },
    "orientation": "facing_ne",
    "rationale": ["ánh sáng gián tiếp", "không quay lưng cửa"],
    "alternatives": [ { "position": {"x":0.5,"y":2.1}, "orientation": "facing_s" } ]
  },
  "assumptions": ["orientation default N"],
  "next_data_to_improve": ["photos", "obstacles"],
  "confidence": 0.74
}
```

## 6. Validation (pseudo Zod)
```ts
const Dimensions = z.object({ width_m: z.number().gt(0), length_m: z.number().gt(0) });
const Window = z.object({ position: z.object({x:z.number(), y:z.number()}), width: z.number().gt(0), height: z.number().gt(0), orientation: z.enum(["N","S","E","W","NE","NW","SE","SW"]) });
const InputCore = z.object({
  dimensions: Dimensions,
  openings: z.object({ door: z.object({ position: z.object({x:z.number(), y:z.number()}) }), windows: z.array(Window).min(1) }),
  primary_use: z.enum(["office","bedroom","living","mixed"]),
  workstation: z.object({ screens: z.number().int().min(1).max(2) }).default({ screens:1 }),
  lighting_orientation: z.enum(["N","S","E","W","NE","NW","SE","SW"]).optional()
});
```

## 7. Confidence (đơn giản)
`confidence = (core_present / core_total)*0.8 + (optional_present / optional_total)*0.2` (clamp 0.4–0.95).

## 8. Ghi chú triển khai
- Assumptions phải được trả trong mảng `assumptions` để UI hiển thị cảnh báo nhẹ.
- Nếu thiếu >1 trường Hard-Min → từ chối (422) kèm danh sách thiếu.
- Chuẩn hóa hệ tọa độ: (0,0) = góc tây–bắc; trục x → đông, trục y → nam.

## 9. Ảnh hưởng trường chính → heuristic layout
| Trường | Ảnh hưởng chính |
|--------|-----------------|
| lighting_orientation | Tránh đặt màn hình trực diện nguồn sáng mạnh; ưu tiên quay lệch 30–90° |
| openings.windows[] | Xác định vùng sáng gián tiếp & khoảng cách an toàn (>=40cm) |
| primary_use | Ưu tiên ánh sáng (office) vs khoảng trống (living) |
| workstation.screens | Chiều sâu bàn tối thiểu (1 màn ≥60cm; 2 màn ≥70cm) |
| obstacles[] | Cắt bỏ vùng candidate đặt bàn |

---
Tham chiếu từ: `ai_interior_agent_plan.md` & `ai_interior_agent_technical_spec_v_1.md`.
