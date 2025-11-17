import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementBadge } from "./AchievementBadge";
import { Award } from "lucide-react";
import { GameState } from "@/types/game";

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: string;
  threshold: number;
  icon: string;
  tier: string;
}

interface AchievementsPanelProps {
  achievements: Achievement[];
  isUnlocked: (id: string) => boolean;
  getProgress: (achievement: Achievement, gameState: GameState, gamesWon: number) => number;
  gameState: GameState;
  gamesWon: number;
}

export const AchievementsPanel = ({
  achievements,
  isUnlocked,
  getProgress,
  gameState,
  gamesWon,
}: AchievementsPanelProps) => {
  const unlockedCount = achievements.filter((a) => isUnlocked(a.id)).length;

  const filterByType = (type: string) => {
    return achievements.filter((a) => a.type === type);
  };

  return (
    <Card className="p-6 bg-card border-border h-full">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-primary">
        <Award className="w-6 h-6 text-yellow-500" />
        <div>
          <h2 className="text-xl font-bold">Achievements</h2>
          <p className="text-sm text-muted-foreground">
            {unlockedCount} / {achievements.length} unlocked
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="net_worth">Worth</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="passive_income">Income</TabsTrigger>
          <TabsTrigger value="games_won">Games</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-350px)]">
          <TabsContent value="all" className="space-y-3 mt-0">
            {achievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                name={achievement.name}
                description={achievement.description}
                icon={achievement.icon}
                tier={achievement.tier}
                isUnlocked={isUnlocked(achievement.id)}
                progress={getProgress(achievement, gameState, gamesWon)}
              />
            ))}
          </TabsContent>

          <TabsContent value="net_worth" className="space-y-3 mt-0">
            {filterByType("net_worth").map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                name={achievement.name}
                description={achievement.description}
                icon={achievement.icon}
                tier={achievement.tier}
                isUnlocked={isUnlocked(achievement.id)}
                progress={getProgress(achievement, gameState, gamesWon)}
              />
            ))}
          </TabsContent>

          <TabsContent value="assets" className="space-y-3 mt-0">
            {filterByType("assets").map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                name={achievement.name}
                description={achievement.description}
                icon={achievement.icon}
                tier={achievement.tier}
                isUnlocked={isUnlocked(achievement.id)}
                progress={getProgress(achievement, gameState, gamesWon)}
              />
            ))}
          </TabsContent>

          <TabsContent value="passive_income" className="space-y-3 mt-0">
            {filterByType("passive_income").map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                name={achievement.name}
                description={achievement.description}
                icon={achievement.icon}
                tier={achievement.tier}
                isUnlocked={isUnlocked(achievement.id)}
                progress={getProgress(achievement, gameState, gamesWon)}
              />
            ))}
          </TabsContent>

          <TabsContent value="games_won" className="space-y-3 mt-0">
            {filterByType("games_won").map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                name={achievement.name}
                description={achievement.description}
                icon={achievement.icon}
                tier={achievement.tier}
                isUnlocked={isUnlocked(achievement.id)}
                progress={getProgress(achievement, gameState, gamesWon)}
              />
            ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
};
