import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GameState } from "@/types/game";
import { calculateNetWorth, calculateTotalExpenses } from "@/lib/gameLogic";
import { Trophy, Share2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface WinScreenProps {
  open: boolean;
  gameState: GameState;
  onPlayAgain: () => void;
}

export const WinScreen = ({ open, gameState, onPlayAgain }: WinScreenProps) => {
  const netWorth = calculateNetWorth(gameState);
  const expenses = calculateTotalExpenses(gameState);
  const best = [...gameState.assets].sort((a, b) => b.monthlyIncome - a.monthlyIncome)[0];

  const share = async () => {
    const text =
      `🎉 ${gameState.playerName} escaped the Rat Race!\n` +
      `Turns: ${gameState.turnCount}\n` +
      `Net Worth: ₹${netWorth.toLocaleString()}\n` +
      `Passive Income: ₹${gameState.passiveIncome.toLocaleString()}/mo\n` +
      `Assets owned: ${gameState.assets.length}\n` +
      (best ? `Best investment: ${best.name} (₹${best.monthlyIncome.toLocaleString()}/mo)` : "");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Score copied to clipboard!");
    } catch {
      toast.error("Could not copy. Try selecting manually.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg">
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
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-accent/40 rounded-md p-3">
              <div className="text-muted-foreground text-xs">Total Turns</div>
              <div className="text-lg font-bold">{gameState.turnCount}</div>
            </div>
            <div className="bg-accent/40 rounded-md p-3">
              <div className="text-muted-foreground text-xs">Final Net Worth</div>
              <div className="text-lg font-bold text-success">₹{netWorth.toLocaleString()}</div>
            </div>
            <div className="bg-accent/40 rounded-md p-3">
              <div className="text-muted-foreground text-xs">Monthly Passive Income</div>
              <div className="text-lg font-bold">₹{gameState.passiveIncome.toLocaleString()}</div>
            </div>
            <div className="bg-accent/40 rounded-md p-3">
              <div className="text-muted-foreground text-xs">Assets Owned</div>
              <div className="text-lg font-bold">{gameState.assets.length}</div>
            </div>
          </div>
          {best && (
            <div className="bg-primary/10 border border-primary/40 rounded-md p-3 text-sm">
              <span className="font-semibold">Best investment:</span> {best.name} — ₹
              {best.monthlyIncome.toLocaleString()}/mo
            </div>
          )}
          <div className="bg-success/10 border border-success/40 rounded-md p-3 text-sm">
            💡 You succeeded because your passive income of ₹{gameState.passiveIncome.toLocaleString()} now
            covers your monthly expenses of ₹{expenses.toLocaleString()}. This is the core principle of
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