import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Crown, Medal, Trophy, TrendingUp } from "lucide-react";
import type { GameState } from "@/types/game";
import { calculateNetWorth } from "@/lib/gameLogic";

const SAVE_KEY_PREFIX = "cashflow_game_save_v1:";
export const LEADERBOARD_UPDATE_EVENT = "cashflow-leaderboard-update";

interface Entry {
  playerName: string;
  profession: string;
  netWorth: number;
  cash: number;
  passiveIncome: number;
  hasEscapedRatRace: boolean;
}

const readEntries = (): Entry[] => {
  const entries: Entry[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(SAVE_KEY_PREFIX)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const state = JSON.parse(raw) as GameState;
        entries.push({
          playerName: state.playerName,
          profession: state.profession,
          netWorth: calculateNetWorth(state),
          cash: state.cash,
          passiveIncome: state.passiveIncome,
          hasEscapedRatRace: state.hasEscapedRatRace,
        });
      } catch {
        // ignore malformed save
      }
    }
  } catch {
    // localStorage unavailable
  }
  return entries.sort((a, b) => b.netWorth - a.netWorth);
};

interface LocalLeaderboardProps {
  currentPlayerName?: string;
  limit?: number;
}

export const LocalLeaderboard = ({ currentPlayerName, limit = 5 }: LocalLeaderboardProps) => {
  const [entries, setEntries] = useState<Entry[]>(() => readEntries());

  useEffect(() => {
    const refresh = () => setEntries(readEntries());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(LEADERBOARD_UPDATE_EVENT, refresh);
    const interval = setInterval(refresh, 2000);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(LEADERBOARD_UPDATE_EVENT, refresh);
      clearInterval(interval);
    };
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
    return <span className="w-4 text-center text-xs font-bold text-muted-foreground">{rank}</span>;
  };

  const top = entries.slice(0, limit);

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h2 className="text-base font-bold">Live Leaderboard</h2>
        <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">
          Top {limit} · Net Worth
        </span>
      </div>

      {top.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-4">
          No players yet. Start playing!
        </p>
      ) : (
        <ol className="space-y-2">
          {top.map((entry, index) => {
            const rank = index + 1;
            const isCurrent =
              currentPlayerName &&
              entry.playerName.trim().toLowerCase() ===
                currentPlayerName.trim().toLowerCase();
            return (
              <li
                key={`${entry.playerName}-${rank}`}
                className={`flex items-center gap-3 rounded-md px-2 py-2 transition-colors ${
                  isCurrent ? "bg-primary/10 border border-primary" : "hover:bg-accent/40"
                }`}
              >
                <div className="flex-shrink-0 w-5 flex justify-center">
                  {getRankIcon(rank)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold truncate">
                      {entry.playerName}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] text-primary">(You)</span>
                    )}
                    {entry.hasEscapedRatRace && (
                      <TrendingUp className="w-3 h-3 text-success" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {entry.profession}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-success">
                    ₹{entry.netWorth.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Passive ₹{entry.passiveIncome.toLocaleString()}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
};