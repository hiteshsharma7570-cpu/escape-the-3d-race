import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GameState } from "@/types/game";
import { calculateNetWorth, calculateTotalExpenses, calculateOutstandingDebt } from "@/lib/gameLogic";
import { Trophy, Share2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { buildReportCard, gradeColor } from "@/lib/reportCard";
import { useMemo } from "react";

interface WinScreenProps {
  open: boolean;
  gameState: GameState;
  onPlayAgain: () => void;
}

export const WinScreen = ({ open, gameState, onPlayAgain }: WinScreenProps) => {
  const netWorth = calculateNetWorth(gameState);
  const expenses = calculateTotalExpenses(gameState);
  const outstandingDebt = calculateOutstandingDebt(gameState);
  const best = [...(gameState.assets ?? [])].sort((a, b) => (b.monthlyIncome ?? 0) - (a.monthlyIncome ?? 0))[0];
  const report = useMemo(() => buildReportCard(gameState), [gameState]);

  const share = async () => {
    const grades = report.categories
      .map((c) => `${c.label}: ${c.grade}`)
      .join(" · ");
    const text =
      `🎉 ${gameState.playerName} escaped the Rat Race!\n` +
      `Overall Grade: ${report.overall} (${report.overallScore}/100)\n` +
      `${grades}\n` +
      `Turns: ${gameState.turnCount ?? 0} · Net Worth: ₹${(netWorth ?? 0).toLocaleString()}\n` +
      `Passive Income: ₹${(gameState.passiveIncome ?? 0).toLocaleString()}/mo` +
      (best ? `\nBest investment: ${best.name} (₹${(best.monthlyIncome ?? 0).toLocaleString()}/mo)` : "");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Score copied to clipboard!");
    } catch {
      toast.error("Could not copy. Try selecting manually.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl text-center flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            You Escaped the Rat Race!
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center text-muted-foreground">
            Congratulations, <span className="font-semibold text-foreground">{gameState.playerName}</span>!
          </div>

          {/* Financial Report Card */}
          <div className="rounded-lg border-2 border-primary/40 bg-gradient-to-br from-card to-accent/20 p-4">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Financial Report Card</div>
                <div className="text-sm italic text-muted-foreground mt-0.5">{report.headline}</div>
              </div>
              <div className="text-right">
                <div className={`text-5xl font-extrabold leading-none ${gradeColor(report.overall)}`}>
                  {report.overall}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{report.overallScore}/100</div>
              </div>
            </div>
            <div className="space-y-2">
              {report.categories.map((cat) => (
                <div key={cat.key} className="flex items-start gap-3 p-2 rounded-md hover:bg-accent/30 transition-colors">
                  <div className={`text-2xl font-bold w-12 text-center ${gradeColor(cat.grade)}`}>
                    {cat.grade}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-sm">{cat.label}</div>
                      <div className="text-xs text-muted-foreground tabular-nums">{Math.round(cat.score)}/100</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{cat.summary}</div>
                    <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-success transition-all"
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-accent/40 rounded-md p-3">
              <div className="text-muted-foreground text-xs">Total Turns</div>
              <div className="text-lg font-bold">{gameState.turnCount ?? 0}</div>
            </div>
            <div className="bg-accent/40 rounded-md p-3">
              <div className="text-muted-foreground text-xs">Final Net Worth</div>
              <div className="text-lg font-bold text-success">₹{(netWorth ?? 0).toLocaleString()}</div>
            </div>
            <div className="bg-accent/40 rounded-md p-3">
              <div className="text-muted-foreground text-xs">Monthly Passive Income</div>
              <div className="text-lg font-bold">₹{(gameState.passiveIncome ?? 0).toLocaleString()}</div>
            </div>
            <div className="bg-accent/40 rounded-md p-3">
              <div className="text-muted-foreground text-xs">Assets Owned</div>
              <div className="text-lg font-bold">{gameState.assets?.length ?? 0}</div>
            </div>
          </div>
          {best && (
            <div className="bg-primary/10 border border-primary/40 rounded-md p-3 text-sm">
              <span className="font-semibold">Best investment:</span> {best.name} — ₹
              {(best.monthlyIncome ?? 0).toLocaleString()}/mo
            </div>
          )}
          <div className="bg-success/10 border border-success/40 rounded-md p-3 text-sm">
            💡 You succeeded because your passive income of ₹{(gameState.passiveIncome ?? 0).toLocaleString()} now
            covers your monthly expenses of ₹{(expenses ?? 0).toLocaleString()}. This is the core principle of
            financial freedom.
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={onPlayAgain}>
              <RotateCcw className="w-4 h-4 mr-2" /> Play Again
            </Button>
            <Button variant="outline" className="flex-1" onClick={share}>
              <Share2 className="w-4 h-4 mr-2" /> Share Score
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};