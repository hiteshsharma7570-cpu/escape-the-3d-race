import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { GameState } from "@/types/game";
import { calculateNetWorth } from "@/lib/gameLogic";
import { playerSchema } from "@/lib/validationSchemas";
import { toast } from "sonner";

type GamePlayer = Tables<"game_players">;

export const useGamePlayers = (sessionId: string | null) => {
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    fetchPlayers();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("game_players_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_players",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          fetchPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const fetchPlayers = async () => {
    if (!sessionId) return;

    const { data, error } = await supabase
      .from("game_players")
      .select("*")
      .eq("session_id", sessionId)
      .order("net_worth", { ascending: false });

    if (!error && data) {
      setPlayers(data);
    }
  };

  const createPlayer = async (
    sessionId: string,
    playerName: string,
    profession: string,
    gameState: GameState
  ) => {
    // Validate input
    const result = playerSchema.safeParse({ playerName, profession });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return null;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to join a game");
      return null;
    }

    const netWorth = calculateNetWorth(gameState);

    const { data, error } = await supabase
      .from("game_players")
      .insert({
        session_id: sessionId,
        player_name: result.data.playerName,
        profession: result.data.profession,
        cash: gameState.cash,
        salary: gameState.salary,
        passive_income: gameState.passiveIncome,
        net_worth: netWorth,
        position: gameState.position,
        has_escaped_rat_race: gameState.hasEscapedRatRace,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create player");
      return null;
    }
    if (data) {
      setCurrentPlayerId(data.id);
      return data;
    }
    return null;
  };

  const updatePlayer = async (playerId: string, gameState: GameState) => {
    const netWorth = calculateNetWorth(gameState);

    await supabase
      .from("game_players")
      .update({
        cash: gameState.cash,
        salary: gameState.salary,
        passive_income: gameState.passiveIncome,
        net_worth: netWorth,
        position: gameState.position,
        has_escaped_rat_race: gameState.hasEscapedRatRace,
      })
      .eq("id", playerId);
  };

  return {
    players,
    currentPlayerId,
    createPlayer,
    updatePlayer,
    fetchPlayers,
  };
};
