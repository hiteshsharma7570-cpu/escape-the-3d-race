import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameState, calculateMonthlyCashFlow, calculateTotalExpenses, calculateNetWorth } from "@/lib/gameLogic";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const InfoLabel = ({ label, tip }: { label: string; tip: string }) => (
  <TooltipProvider delayDuration={150}>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help">
          {label}
          <Info className="w-3 h-3 text-muted-foreground" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{tip}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

interface GameDashboardProps {
  gameState: GameState;
  onRollDice: () => void;
  onTakeLoan: () => void;
  onRepayLoan: () => void;
  onPayOffDebts: () => void;
  onSellAsset: (assetId: string) => void;
}

export const GameDashboard = ({ 
  gameState, 
  onRollDice, 
  onTakeLoan, 
  onRepayLoan,
  onPayOffDebts,
  onSellAsset,
}: GameDashboardProps) => {
  const monthlyCashFlow = calculateMonthlyCashFlow(gameState);
  const totalExpenses = calculateTotalExpenses(gameState);
  const netWorth = calculateNetWorth(gameState);
  const escapePct = totalExpenses > 0
    ? Math.min((gameState.passiveIncome / totalExpenses) * 100, 100)
    : 0;
  const escapeColor =
    escapePct >= 100 ? "bg-success" : escapePct >= 50 ? "bg-yellow-500" : "bg-destructive";
  const milestones = [25, 50, 75, 100];

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-card to-accent border-border">
        {gameState.marketHint && (
          <div
            className={`mb-4 p-3 rounded-lg border text-sm font-medium ${
              gameState.marketHint.sentiment === "bullish"
                ? "bg-green-500/10 border-green-500/40 text-green-700 dark:text-green-300"
                : gameState.marketHint.sentiment === "bearish"
                ? "bg-red-500/10 border-red-500/40 text-red-700 dark:text-red-300"
                : "bg-yellow-500/10 border-yellow-500/40 text-yellow-700 dark:text-yellow-300"
            }`}
          >
            {gameState.marketHint.headline}
          </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-primary">The Rat Race</h1>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Market</p>
            <p className="text-lg font-semibold capitalize">{gameState.marketCondition}</p>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-2">Cash on Hand</p>
          <p className="text-5xl font-bold text-success tracking-wider">
            ₹{gameState.cash.toLocaleString()}
          </p>
        </div>

        {/* Escape Progress */}
        <div className="mb-6 bg-accent/40 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">Escape Progress</p>
            <p className="text-xs text-muted-foreground">{escapePct.toFixed(0)}%</p>
          </div>
          {totalExpenses === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              Add investments and take on liabilities to begin
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-2">
                Passive ₹{gameState.passiveIncome.toLocaleString()} / Expenses ₹
                {totalExpenses.toLocaleString()}
              </p>
              <div className="relative h-3 rounded-full bg-background overflow-hidden">
                <div
                  className={`h-full transition-all ${escapeColor}`}
                  style={{ width: `${escapePct}%` }}
                />
                {milestones.map((m) => (
                  <div
                    key={m}
                    className="absolute top-0 bottom-0 w-px bg-foreground/30"
                    style={{ left: `${m}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                {milestones.map((m) => (
                  <span key={m} className={escapePct >= m ? "text-success font-semibold" : ""}>
                    {m}%
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {gameState.diceValue && (
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center border-2 border-border">
              <span className="text-4xl font-bold">{gameState.diceValue}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={onRollDice} 
            disabled={gameState.isRolling}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          >
            Roll Dice
          </Button>
          <Button 
            onClick={onTakeLoan}
            size="lg"
            className="bg-success hover:bg-success/90 text-success-foreground font-bold"
          >
            Take Loan
          </Button>
          <Button 
            onClick={onRepayLoan}
            size="lg"
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold"
          >
            Repay Loan
          </Button>
          <Button 
            onClick={onPayOffDebts}
            size="lg"
            className="bg-info hover:bg-info/90 text-info-foreground font-bold"
          >
            Pay Off Other Debts
          </Button>
        </div>
      </Card>

      {/* Financial Stats */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-bold mb-4 border-b border-primary pb-2">
          {gameState.playerName}'s Game
        </h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {gameState.profession} · Starting salary ₹{gameState.salary.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Loans taken: <span className="font-semibold">{gameState.loansTaken}</span>
            </p>
          </div>

          <div>
            <h3 className="text-success font-bold mb-2">Income</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Salary:</span>
                <span>₹{gameState.salary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span><InfoLabel label="Passive Income" tip="Money you earn without actively working — rent, dividends, business profits. The goal is to make this exceed your expenses." /></span>
                <span>₹{gameState.passiveIncome.toLocaleString()}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total Income:</span>
                <span>₹{(gameState.salary + gameState.passiveIncome).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-destructive font-bold mb-2">
              <InfoLabel label="Expenses" tip="Total of all monthly liability payments — what you must pay every month." />
            </h3>
            <div className="space-y-1 text-sm">
              {gameState.liabilities.map((liability) => (
                <div key={liability.id} className="flex justify-between">
                  <span>{liability.name}:</span>
                  <span>₹{liability.monthlyPayment.toLocaleString()}</span>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total Expenses:</span>
                <span>₹{totalExpenses.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-accent p-3 rounded-lg">
            <h3 className="font-bold mb-2">
              <InfoLabel label="Monthly Cash Flow" tip="Salary + passive income minus all monthly liability payments. Negative means you're going backwards." />
            </h3>
            <p className={`text-2xl font-bold ${monthlyCashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
              ₹{monthlyCashFlow.toLocaleString()}
            </p>
          </div>

        {gameState.assets.length > 0 && (
            <div>
              <h3 className="text-info font-bold mb-2">
                <InfoLabel label="Assets" tip="Things you own that generate income or hold value." />
              </h3>
              <div className="space-y-2 text-sm">
                {gameState.assets.map((asset) => (
                  <div key={asset.id} className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          asset.risk === "low"
                            ? "bg-green-500"
                            : asset.risk === "medium"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="truncate">{asset.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-success text-right">
                        ₹{asset.value.toLocaleString()}
                        {asset.monthlyIncome > 0 && (
                          <span className="text-xs ml-1">+₹{asset.monthlyIncome.toLocaleString()}/mo</span>
                        )}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => onSellAsset(asset.id)}
                      >
                        Sell
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gameState.liabilities.length > 0 && (
            <div>
              <h3 className="text-destructive font-bold mb-2">
                <InfoLabel label="Liabilities" tip="Debts that cost you money every month — loans, mortgages, credit cards." />
              </h3>
              <div className="space-y-1 text-sm">
                {gameState.liabilities.map((liability) => (
                  <div key={liability.id} className="flex justify-between">
                    <span>{liability.name}:</span>
                    <span className="text-destructive">
                      ₹{liability.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-primary/10 p-3 rounded-lg border border-primary">
            <div className="flex justify-between items-center">
              <span className="font-bold">
                <InfoLabel label="Net Worth" tip="Total assets minus total liabilities. Positive means you own more than you owe." />
              </span>
              <span className={`text-xl font-bold ${netWorth >= 0 ? 'text-success' : 'text-destructive'}`}>
                ₹{netWorth.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Game Log */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-bold mb-4 border-b border-primary pb-2">Game Log</h3>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {gameState.gameLog.map((log, index) => (
              <p
                key={index}
                className={`text-sm ${log.includes("💡") ? "text-muted-foreground italic" : ""}`}
              >
                <span className="text-primary font-bold">→</span> {log}
              </p>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};
