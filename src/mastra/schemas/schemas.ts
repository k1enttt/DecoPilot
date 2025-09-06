import { z } from 'zod';

// Định nghĩa schema cho Room Input
export const DimensionsSchema = z.object({
  width_m: z.number().gt(0),
  length_m: z.number().gt(0),
  height_m: z.number().gt(0).optional(),
});

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const WindowSchema = z.object({
  position: PositionSchema,
  width: z.number().gt(0),
  height: z.number().gt(0),
  orientation: z.enum(["N","S","E","W","NE","NW","SE","SW"]),
});

export const OpeningsSchema = z.object({
  door: z.object({ position: PositionSchema }),
  windows: z.array(WindowSchema).min(1),
});

export const RoomInputSchema = z.object({
  dimensions: DimensionsSchema,
  openings: OpeningsSchema,
  primary_use: z.enum(['office','bedroom','living','mixed']),
  workstation: z.object({ screens: z.number().int().min(1).max(2) }).default({ screens: 1 }),
  lighting_orientation: z.enum(['N','S','E','W','NE','NW','SE','SW']).optional(),
});

// Định nghĩa schema cho Suggestion Output
export const SuggestionOutputSchema = z.object({
  style: z.array(z.string()),
  color_palette: z.array(z.string()),
  materials: z.array(z.string()),
  layout: z.any(),
  decor: z.array(z.string()),
  rationales: z.array(z.string()),
  sources: z.array(z.string()).optional(),
  // confidence: z.number().min(0).max(1),
});
