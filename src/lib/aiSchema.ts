import { z } from "zod";

/**
 * Schema contract for ANY AI-generated game effect that may be applied to GameState.
 *
 * Hard rules enforced here (never relaxed):
 *  - Liabilities carry ONLY a principal. No interestRate, no monthlyEMI,
 *    no monthlyPayment, no servicing, no emi — anywhere, ever. Debts must
 *    feel like a fixed outstanding amount, never a rate.
 *  - Principals must be >= 0.
 *  - Cash deltas must be finite numbers.
 *  - Recurring monthly expenses have been removed from the game — the
 *    AI must never produce `addExpenses`.
 *
 * Any AI response that fails .parse() MUST be discarded by the caller and
 * deterministic static logic used as the fallback.
 */

// Reject any object that includes EMI-shaped fields, regardless of name casing.
const FORBIDDEN_LIABILITY_KEYS = [
  "monthlyEMI",
  "monthlyemi",
  "monthly_emi",
  "emi",
  "monthlyPayment",
  "monthly_payment",
  "monthlyDebtServicing",
  "debtServicing",
  "interestRate",
  "interest_rate",
  "interest",
  "apr",
  "rate",
];

export const aiLiabilitySchema = z
  .object({
    name: z.string().min(1).max(120),
    category: z.string().min(1).max(60),
    principal: z.number().finite().min(0),
  })
  .strict()
  .refine(
    (l) => !FORBIDDEN_LIABILITY_KEYS.some((k) => k in (l as Record<string, unknown>)),
    { message: "Liability must not carry any monthly payment / EMI field" },
  );

export const aiTileResponseSchema = z.object({
  narrative: z.string().min(1).max(2000),
  cashDelta: z.number().finite().optional(),
  addLiabilities: z.array(aiLiabilitySchema).max(5).optional(),
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
  // Belt-and-braces: re-check the EMI ban after parse, in case schema is ever loosened.
  for (const l of parsed.data.addLiabilities ?? []) {
    for (const k of FORBIDDEN_LIABILITY_KEYS) {
      if (k in (l as Record<string, unknown>)) {
        return { ok: false, error: `Liability "${l.name}" carries forbidden field "${k}"` };
      }
    }
  }
  return { ok: true, data: parsed.data };
}