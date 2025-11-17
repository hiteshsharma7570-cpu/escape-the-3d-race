import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: string;
  tier: string;
  isUnlocked: boolean;
  progress?: number;
}

const tierColors = {
  bronze: "from-amber-700 to-amber-900",
  silver: "from-gray-300 to-gray-500",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-blue-300 to-purple-400",
};

const tierBorders = {
  bronze: "border-amber-700",
  silver: "border-gray-400",
  gold: "border-yellow-500",
  platinum: "border-purple-400",
};

export const AchievementBadge = ({
  name,
  description,
  icon,
  tier,
  isUnlocked,
  progress = 0,
}: AchievementBadgeProps) => {
  const IconComponent = (Icons[icon as keyof typeof Icons] || Icons.Trophy) as LucideIcon;
  const tierColor = tierColors[tier as keyof typeof tierColors] || tierColors.bronze;
  const tierBorder = tierBorders[tier as keyof typeof tierBorders] || tierBorders.bronze;

  return (
    <Card
      className={`p-4 transition-all ${
        isUnlocked
          ? `bg-gradient-to-br ${tierColor} border-2 ${tierBorder} shadow-lg`
          : "bg-card opacity-60 grayscale"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            isUnlocked ? "bg-white/20" : "bg-muted"
          }`}
        >
          <IconComponent
            className={`w-6 h-6 ${isUnlocked ? "text-white" : "text-muted-foreground"}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-bold ${isUnlocked ? "text-white" : "text-foreground"}`}>
            {name}
          </h3>
          <p
            className={`text-sm ${
              isUnlocked ? "text-white/90" : "text-muted-foreground"
            }`}
          >
            {description}
          </p>

          {!isUnlocked && progress !== undefined && (
            <div className="mt-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(0)}% complete</p>
            </div>
          )}

          {isUnlocked && (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-white/20 px-2 py-1 rounded">
                ✓ Unlocked
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
