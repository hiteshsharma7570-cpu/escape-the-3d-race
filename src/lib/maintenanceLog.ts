import { supabase } from "@/integrations/supabase/client";
import type { GameState } from "@/types/game";

export type MaintenanceErrorType =
  | "render_crash"
  | "tile_effect"
  | "periodic_mechanics"
  | "ai_request_failed"
  | "ai_validation_failed"
  | "decision_apply"
  | "unknown";

export interface MaintenanceContext {
  turnCount?: number;
  tileType?: string;
  [key: string]: unknown;
}

/**
 * Best-effort error reporter. Never throws — failing to log must never be the
 * thing that breaks the game. Mirrors to console either way.
 */
export async function logMaintenanceError(params: {
  errorType: MaintenanceErrorType;
  error: unknown;
  context?: MaintenanceContext;
  gameState?: GameState | null;
}): Promise<void> {
  const { errorType, error, context = {}, gameState = null } = params;
  const err = error instanceof Error ? error : new Error(String(error));

  // Always log locally — this is the developer's primary signal even if the
  // network is offline or the table is unreachable.
  console.error(`[maintenance:${errorType}]`, err, { context, gameState });

  try {
    const { data, error: insertError } = await supabase
      .from("ai_maintenance_log")
      .insert({
        error_type: errorType,
        error_message: err.message?.slice(0, 2000) ?? null,
        stack: err.stack?.slice(0, 4000) ?? null,
        context: JSON.parse(JSON.stringify(context)),
        game_state: gameState ? JSON.parse(JSON.stringify(gameState)) : null,
      })
      .select("id")
      .single();

    if (insertError) {
      console.warn("[maintenance] failed to persist log row", insertError);
      return;
    }

    // Fire-and-forget AI diagnosis. We don't await it — the game must not wait
    // on the AI to finish reasoning about the error.
    if (data?.id) {
      void supabase.functions
        .invoke("ai-diagnose-error", { body: { id: data.id } })
        .catch((e) => console.warn("[maintenance] diagnosis trigger failed", e));
    }
  } catch (e) {
    console.warn("[maintenance] reporter threw, swallowing", e);
  }
}