import { useState } from "react";
import { GameBoard3D } from "@/components/game/GameBoard3D";
import { GameDashboard } from "@/components/game/GameDashboard";
import { INITIAL_GAME_STATE } from "@/types/game";
import { GameState } from "@/types/game";
import { BOARD_TILES, handleTileEffect } from "@/lib/gameLogic";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trophy, HelpCircle } from "lucide-react";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);

  const rollDice = () => {
    if (gameState.isRolling) return;

    setGameState((prev) => ({ ...prev, isRolling: true }));

    const diceValue = Math.floor(Math.random() * 6) + 1;
    
    setTimeout(() => {
      const newPosition = (gameState.position + diceValue) % BOARD_TILES.length;
      const landedTile = BOARD_TILES[newPosition];
      
      setGameState((prev) => {
        const updatedState = {
          ...prev,
          diceValue,
          position: newPosition,
          isRolling: false,
        };
        
        return handleTileEffect(updatedState, landedTile);
      });

      toast.info(`Rolled ${diceValue}! Landed on ${landedTile.label}`);
    }, 500);
  };

  const takeLoan = () => {
    const loanAmount = 100000;
    const monthlyPayment = 5000;
    
    setGameState((prev) => ({
      ...prev,
      cash: prev.cash + loanAmount,
      liabilities: [
        ...prev.liabilities,
        {
          id: `loan-${Date.now()}`,
          name: "Bank Loan",
          amount: loanAmount,
          monthlyPayment,
        },
      ],
      gameLog: [`Took a loan of ₹${loanAmount.toLocaleString()}. Monthly payment: ₹${monthlyPayment.toLocaleString()}`, ...prev.gameLog.slice(0, 9)],
    }));
    
    toast.success(`Loan approved! ₹${loanAmount.toLocaleString()} added to cash`);
  };

  const repayLoan = () => {
    const loanIndex = gameState.liabilities.findIndex(l => l.name === "Bank Loan");
    
    if (loanIndex === -1) {
      toast.error("No active loan to repay");
      return;
    }

    const loan = gameState.liabilities[loanIndex];
    
    if (gameState.cash >= loan.amount) {
      setGameState((prev) => ({
        ...prev,
        cash: prev.cash - loan.amount,
        liabilities: prev.liabilities.filter((_, i) => i !== loanIndex),
        gameLog: [`Repaid loan of ₹${loan.amount.toLocaleString()}`, ...prev.gameLog.slice(0, 9)],
      }));
      toast.success("Loan fully repaid!");
    } else {
      toast.error("Insufficient funds to repay loan");
    }
  };

  const payOffDebts = () => {
    if (gameState.liabilities.length === 0) {
      toast.error("No debts to pay off");
      return;
    }

    const totalDebt = gameState.liabilities.reduce((sum, l) => sum + l.amount, 0);
    
    if (gameState.cash >= totalDebt) {
      setGameState((prev) => ({
        ...prev,
        cash: prev.cash - totalDebt,
        liabilities: [],
        gameLog: [`Paid off all debts totaling ₹${totalDebt.toLocaleString()}`, ...prev.gameLog.slice(0, 9)],
      }));
      toast.success("All debts cleared!");
    } else {
      toast.error("Insufficient funds to pay off all debts");
    }
  };

  const showInstructions = () => {
    toast.info(
      "Roll the dice to move around the board. Land on different tiles to trigger financial events. Your goal: Build passive income to exceed your expenses and escape the Rat Race!",
      { duration: 6000 }
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Rat Race 3D</h1>
            <p className="text-muted-foreground">Escape the Rat Race, then conquer the Fast Track to win!</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={showInstructions}
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
            {gameState.hasEscapedRatRace && (
              <div className="flex items-center gap-2 bg-success text-success-foreground px-4 py-2 rounded-lg">
                <Trophy className="h-5 w-5" />
                <span className="font-bold">Rat Race Escaped!</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GameBoard3D 
              currentPosition={gameState.position} 
              diceValue={gameState.diceValue}
            />
          </div>
          
          <div>
            <GameDashboard
              gameState={gameState}
              onRollDice={rollDice}
              onTakeLoan={takeLoan}
              onRepayLoan={repayLoan}
              onPayOffDebts={payOffDebts}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
