import { z } from "zod";

/**
 * Schema contract for ANY AI-generated game effect that may be applied to GameState.
 * Loans/liabilities and recurring expenses have been removed from the game — the
 * AI must only produce cash deltas and narrative.
 */
export const aiTileResponseSchema = z.object({
  narrative: z.string().min(1).max(2000),
  cashDelta: z.number().finite().optional(),
  lessons: z.array(z.string().max(500)).max(5).optional(),
});

export type AITileResponse = z.infer<typeof aiTileResponseSchema>;

export function validateAiTileResponse(raw: unknown):
  | { ok: true; data: AITileResponse }
  | { ok: false; error: string } {
  const parsed = aiTileResponseSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  }
  return { ok: true, data: parsed.data };
}