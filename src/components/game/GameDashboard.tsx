import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameState, calculateMonthlyCashFlow, calculateTotalExpenses, calculateNetWorth } from "@/lib/gameLogic";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface GameDashboardProps {
  gameState: GameState;
  onRollDice: () => void;
  onTakeLoan: () => void;
  onRepayLoan: () => void;
  onPayOffDebts: () => void;
}

export const GameDashboard = ({ 
  gameState, 
  onRollDice, 
  onTakeLoan, 
  onRepayLoan,
  onPayOffDebts 
}: GameDashboardProps) => {
  const monthlyCashFlow = calculateMonthlyCashFlow(gameState);
  const totalExpenses = calculateTotalExpenses(gameState);
  const netWorth = calculateNetWorth(gameState);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-card to-accent border-border">
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
              {gameState.profession} <span className="text-success">(120% Eff.)</span>
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
                <span>Passive Income:</span>
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
            <h3 className="text-destructive font-bold mb-2">Expenses</h3>
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
            <h3 className="font-bold mb-2">Monthly Cash Flow:</h3>
            <p className={`text-2xl font-bold ${monthlyCashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
              ₹{monthlyCashFlow.toLocaleString()}
            </p>
          </div>

        {gameState.assets.length > 0 && (
            <div>
              <h3 className="text-info font-bold mb-2">Assets</h3>
              <div className="space-y-2 text-sm">
                {gameState.assets.map((asset) => (
                  <div key={asset.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          asset.risk === "low"
                            ? "bg-green-500"
                            : asset.risk === "medium"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span>{asset.name}</span>
                    </div>
                    <span className="text-success">
                      ₹{asset.value.toLocaleString()}
                      {asset.monthlyIncome > 0 && (
                        <span className="text-xs ml-1">+₹{asset.monthlyIncome.toLocaleString()}/mo</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gameState.liabilities.length > 0 && (
            <div>
              <h3 className="text-destructive font-bold mb-2">Liabilities</h3>
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
              <span className="font-bold">Net Worth:</span>
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
              <p key={index} className="text-sm">
                <span className="text-primary font-bold">→</span> {log}
              </p>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};
