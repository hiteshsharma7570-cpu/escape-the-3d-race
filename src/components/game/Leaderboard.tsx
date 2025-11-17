import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Crown, Medal, TrendingUp } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type GamePlayer = Tables<"game_players">;

interface LeaderboardProps {
  players: GamePlayer[];
  currentPlayerId: string | null;
}

export const Leaderboard = ({ players, currentPlayerId }: LeaderboardProps) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center font-bold text-muted-foreground">{rank}</span>;
    }
  };

  return (
    <Card className="p-6 bg-card border-border h-full">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-primary">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-bold">Live Leaderboard</h2>
      </div>

      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-2">
          {players.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No players yet. Be the first to join!
            </p>
          ) : (
            players.map((player, index) => {
              const isCurrentPlayer = player.id === currentPlayerId;
              const rank = index + 1;

              return (
                <Card
                  key={player.id}
                  className={`p-4 transition-all ${
                    isCurrentPlayer
                      ? "bg-primary/10 border-primary border-2 shadow-lg"
                      : "bg-card hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 flex justify-center">
                      {getRankIcon(rank)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">
                          {player.player_name}
                          {isCurrentPlayer && (
                            <span className="ml-2 text-xs text-primary">(You)</span>
                          )}
                        </h3>
                        {player.has_escaped_rat_race && (
                          <TrendingUp className="w-4 h-4 text-success" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{player.profession}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-success">
                        ₹{player.net_worth.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Net Worth</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Cash</p>
                      <p className="font-semibold">₹{player.cash.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Passive</p>
                      <p className="font-semibold">₹{player.passive_income.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Position</p>
                      <p className="font-semibold">{player.position}</p>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
