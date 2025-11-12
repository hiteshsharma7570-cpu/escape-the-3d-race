import { useState } from "react";
import { GameBoard2D } from "@/components/game/GameBoard2D";
import { GameDashboard } from "@/components/game/GameDashboard";
import { Dice } from "@/components/game/Dice";
import { INITIAL_GAME_STATE } from "@/types/game";
import { GameState } from "@/types/game";
import { BOARD_TILES, handleTileEffect } from "@/lib/gameLogic";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trophy, HelpCircle, Music, Volume2, VolumeX } from "lucide-react";
import { useGameSounds } from "@/hooks/useGameSounds";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const { playSound, isMusicEnabled, isSoundEnabled, toggleMusic, toggleSound } = useGameSounds();

  const rollDice = () => {
    if (gameState.isRolling) return;

    playSound("diceRoll");
    setGameState((prev) => ({ ...prev, isRolling: true }));

    const diceValue = Math.floor(Math.random() * 6) + 1;
    
    setTimeout(() => {
      const newPosition = (gameState.position + diceValue) % BOARD_TILES.length;
      const landedTile = BOARD_TILES[newPosition];
      
      let updatedState: GameState;
      
      setGameState((prev) => {
        updatedState = {
          ...prev,
          diceValue,
          position: newPosition,
          isRolling: false,
        };
        
        return handleTileEffect(updatedState, landedTile);
      });

      // Play sound based on tile type
      setTimeout(() => {
        if (landedTile.type === "payday") {
          playSound("payDay");
        } else if (landedTile.type === "opportunity") {
          playSound("opportunity");
        } else if (landedTile.type === "market") {
          playSound("market");
        } else if (landedTile.type === "charity") {
          playSound("charity");
        } else if (landedTile.type === "baby") {
          playSound("baby");
        } else if (landedTile.type === "downsized") {
          playSound("downsized");
        } else if (landedTile.type === "dinner" || landedTile.type === "vacation") {
          playSound("loseMoney");
        }
      }, 100);

      toast.info(`Rolled ${diceValue}! Landed on ${landedTile.label}`);
    }, 500);
  };

  const takeLoan = () => {
    const loanAmount = 100000;
    const monthlyPayment = 5000;
    
    playSound("earnMoney");
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
      playSound("earnMoney");
      setGameState((prev) => ({
        ...prev,
        cash: prev.cash - loan.amount,
        liabilities: prev.liabilities.filter((_, i) => i !== loanIndex),
        gameLog: [`Repaid loan of ₹${loan.amount.toLocaleString()}`, ...prev.gameLog.slice(0, 9)],
      }));
      toast.success("Loan fully repaid!");
    } else {
      playSound("loseMoney");
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
      playSound("earnMoney");
      setGameState((prev) => ({
        ...prev,
        cash: prev.cash - totalDebt,
        liabilities: [],
        gameLog: [`Paid off all debts totaling ₹${totalDebt.toLocaleString()}`, ...prev.gameLog.slice(0, 9)],
      }));
      toast.success("All debts cleared!");
    } else {
      playSound("loseMoney");
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
              onClick={toggleSound}
              title={isSoundEnabled ? "Mute Sound Effects" : "Unmute Sound Effects"}
            >
              {isSoundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMusic}
              title={isMusicEnabled ? "Stop Music" : "Play Music"}
            >
              <Music className={`h-5 w-5 ${isMusicEnabled ? 'text-primary' : ''}`} />
            </Button>
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
          <div className="lg:col-span-2 space-y-4">
            <GameBoard2D 
              currentPosition={gameState.position} 
              diceValue={gameState.diceValue}
            />
            
            {/* Dice Display */}
            <div className="flex justify-center">
              <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
                <Dice value={gameState.diceValue} isRolling={gameState.isRolling} />
              </div>
            </div>
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
