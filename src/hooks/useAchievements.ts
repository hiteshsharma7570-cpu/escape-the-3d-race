import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GameState } from "@/types/game";
import { calculateNetWorth } from "@/lib/gameLogic";
import { toast } from "sonner";
import { useRealtimeSubscription } from "./useRealtimeSubscription";

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: string;
  threshold: number;
  icon: string;
  tier: string;
}

interface PlayerAchievement {
  id: string;
  player_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export const useAchievements = (playerId: string | null) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<PlayerAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .order("threshold", { ascending: true });

    if (!error && data) {
      setAchievements(data);
    }
    setIsLoading(false);
  }, []);

  const fetchPlayerAchievements = useCallback(async () => {
    if (!playerId) return;

    const { data, error } = await supabase
      .from("player_achievements")
      .select("*")
      .eq("player_id", playerId);

    if (!error && data) {
      setUnlockedAchievements(data);
    }
  }, [playerId]);

  useEffect(() => {
    fetchAchievements();
    if (playerId) {
      fetchPlayerAchievements();
    }
  }, [fetchAchievements, fetchPlayerAchievements, playerId]);

  useRealtimeSubscription({
    table: "player_achievements",
    event: "INSERT",
    filter: playerId ? `player_id=eq.${playerId}` : undefined,
    channelName: playerId ? `player_achievements_changes_${playerId}` : undefined,
    onChange: fetchPlayerAchievements,
  });

  const checkAchievements = async (gameState: GameState, gamesWon: number) => {
    if (!playerId) return;

    const netWorth = calculateNetWorth(gameState);
    const assetCount = gameState.assets.length;
    const passiveIncome = gameState.passiveIncome;

    const unlockedIds = unlockedAchievements.map((ua) => ua.achievement_id);
    const newAchievements: Achievement[] = [];

    for (const achievement of achievements) {
      if (unlockedIds.includes(achievement.id)) continue;

      let shouldUnlock = false;

      switch (achievement.type) {
        case "net_worth":
          shouldUnlock = netWorth >= achievement.threshold;
          break;
        case "assets":
          shouldUnlock = assetCount >= achievement.threshold;
          break;
        case "passive_income":
          shouldUnlock = passiveIncome >= achievement.threshold;
          break;
        case "games_won":
          shouldUnlock = gamesWon >= achievement.threshold;
          break;
      }

      if (shouldUnlock) {
        await unlockAchievement(achievement.id);
        newAchievements.push(achievement);
      }
    }

    // Show toast for newly unlocked achievements
    if (newAchievements.length > 0) {
      newAchievements.forEach((achievement) => {
        toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`, {
          description: achievement.description,
          duration: 4000,
        });
      });
    }
  };

  const unlockAchievement = async (achievementId: string) => {
    if (!playerId) return;

    await supabase.from("player_achievements").insert({
      player_id: playerId,
      achievement_id: achievementId,
    });
  };

  const getProgress = (achievement: Achievement, gameState: GameState, gamesWon: number): number => {
    let current = 0;

    switch (achievement.type) {
      case "net_worth":
        current = calculateNetWorth(gameState);
        break;
      case "assets":
        current = gameState.assets.length;
        break;
      case "passive_income":
        current = gameState.passiveIncome;
        break;
      case "games_won":
        current = gamesWon;
        break;
    }

    if (!Number.isFinite(current) || !achievement.threshold) return 0;
    const pct = (current / achievement.threshold) * 100;
    return Number.isFinite(pct) ? Math.min(Math.max(0, pct), 100) : 0;
  };

  const isUnlocked = (achievementId: string): boolean => {
    return unlockedAchievements.some((ua) => ua.achievement_id === achievementId);
  };

  return {
    achievements,
    unlockedAchievements,
    isLoading,
    checkAchievements,
    getProgress,
    isUnlocked,
  };
};
