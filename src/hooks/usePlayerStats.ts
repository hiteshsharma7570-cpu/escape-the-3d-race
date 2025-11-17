import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PlayerStats {
  gamesWon: number;
}

export const usePlayerStats = (playerId: string | null) => {
  const [stats, setStats] = useState<PlayerStats>({ gamesWon: 0 });

  useEffect(() => {
    if (playerId) {
      fetchStats();
    }
  }, [playerId]);

  const fetchStats = async () => {
    if (!playerId) return;

    // Count how many times this player has escaped the rat race
    const { data, error } = await supabase
      .from("game_players")
      .select("has_escaped_rat_race")
      .eq("id", playerId);

    if (!error && data) {
      const wins = data.filter((record) => record.has_escaped_rat_race).length;
      setStats({ gamesWon: wins });
    }
  };

  const incrementGamesWon = () => {
    setStats((prev) => ({ ...prev, gamesWon: prev.gamesWon + 1 }));
  };

  return {
    stats,
    incrementGamesWon,
    fetchStats,
  };
};
