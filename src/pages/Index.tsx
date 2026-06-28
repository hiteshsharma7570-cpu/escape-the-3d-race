import { useState, useEffect } from "react";
import { GameBoard2D } from "@/components/game/GameBoard2D";
import { GameDashboard } from "@/components/game/GameDashboard";
import { Dice } from "@/components/game/Dice";
import { PlayerSetup } from "@/components/game/PlayerSetup";
import { DecisionModal } from "@/components/game/DecisionModal";
import { CashCertificateModal } from "@/components/game/CashCertificateModal";
import { INITIAL_GAME_STATE } from "@/types/game";
import { GameState } from "@/types/game";
import { BOARD_TILES, handleTileEffect, applyCharityDecision, applyOpportunityDecision, generateMarketHint, sellAsset } from "@/lib/gameLogic";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HelpCircle, Music, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { useGameSounds } from "@/hooks/useGameSounds";

const SAVE_KEY_PREFIX = "cashflow_game_save_v1:";
const saveKeyFor = (name: string) => `${SAVE_KEY_PREFIX}${name.trim().toLowerCase()}`;

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [gameMode, setGameMode] = useState<"setup" | "playing">("setup");
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateAwarded, setCertificateAwarded] = useState(false);
  const { playSound, isMusicEnabled, isSoundEnabled, toggleMusic, toggleSound } = useGameSounds();

  // Persist game state to localStorage while playing (per-player)
  useEffect(() => {
    if (gameMode === "playing" && gameState.playerName) {
      try {
        localStorage.setItem(saveKeyFor(gameState.playerName), JSON.stringify(gameState));
      } catch (err) {
        console.error("Failed to save game", err);
      }
    }
  }, [gameState, gameMode]);

  // Autosave on page unload so progress is never lost mid-session
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (gameMode === "playing" && gameState.playerName) {
        try {
          localStorage.setItem(saveKeyFor(gameState.playerName), JSON.stringify(gameState));
        } catch (err) {
          console.error("Failed to save on unload", err);
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
    };
  }, [gameState, gameMode]);

  // Award Crorepati certificate the first time cash crosses ₹1 crore
  useEffect(() => {
    if (gameMode === "playing" && !certificateAwarded && gameState.cash >= 10000000) {
      setCertificateAwarded(true);
      setShowCertificate(true);
      playSound("payDay");
      toast.success("🏆 Crorepati! You crossed ₹1 Crore in cash!");
    }
  }, [gameState.cash, gameMode, certificateAwarded]);

  const handlePlayerCreate = (playerName: string, profession: string) => {
    // If this player has a saved game, resume it. Otherwise start fresh.
    try {
      const saved = localStorage.getItem(saveKeyFor(playerName));
      if (saved) {
        const parsed = JSON.parse(saved) as GameState;
        setGameState(parsed);
        setCertificateAwarded(parsed.cash >= 10000000);
        setGameMode("playing");
        toast.success(`Welcome back, ${playerName}! Resuming your game.`);
        return;
      }
    } catch (err) {
      console.error("Failed to load saved game", err);
    }

    const initialState = { ...INITIAL_GAME_STATE, playerName, profession };
    setGameState(initialState);
    setCertificateAwarded(initialState.cash >= 10000000);
    setGameMode("playing");
    toast.success(`Welcome, ${playerName}!`);
  };

  const handleNewGame = () => {
    if (!confirm("Start a new game? Your current progress will be lost.")) return;
    if (gameState.playerName) {
      localStorage.removeItem(saveKeyFor(gameState.playerName));
    }
    setGameState(INITIAL_GAME_STATE);
    setCertificateAwarded(false);
    setGameMode("setup");
    toast.info("Starting a new game");
  };

  const handleResetMyGame = () => {
    if (!confirm("Reset your saved progress and restart from the beginning?")) return;
    const { playerName, profession } = gameState;
    if (playerName) {
      localStorage.removeItem(saveKeyFor(playerName));
    }
    const fresh = { ...INITIAL_GAME_STATE, playerName, profession };
    setGameState(fresh);
    setCertificateAwarded(false);
    setGameMode("playing");
    toast.info(`${playerName}, your game has been reset to the starting point.`);
  };

  const rollDice = () => {
    if (gameState.isRolling) return;

    playSound("diceRoll");
    // Generate a market news hint at the start of each roll (30% chance, only if no active hint)
    setGameState((prev) => ({
      ...prev,
      isRolling: true,
    }));

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
        
        const afterTile = handleTileEffect(updatedState, landedTile);
        // 40% chance to generate a market news hint for the next roll
        // (only if not already on a market tile and no pending decision)
        if (
          !afterTile.marketHint &&
          !afterTile.pendingDecision &&
          landedTile.type !== "market" &&
          Math.random() < 0.4
        ) {
          afterTile.marketHint = generateMarketHint();
          afterTile.gameLog = [afterTile.marketHint.headline, ...afterTile.gameLog.slice(0, 9)];
        }
        return afterTile;
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

  const handleSellAsset = (assetId: string) => {
    playSound("earnMoney");
    setGameState((prev) => sellAsset(prev, assetId));
    toast.success("Asset sold!");
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

  const handleDecisionAccept = () => {
    if (!gameState.pendingDecision) return;
    
    if (gameState.pendingDecision.type === "charity") {
      playSound("charity");
      setGameState((prev) => applyCharityDecision(prev, true));
    } else if (gameState.pendingDecision.type === "opportunity") {
      playSound("opportunity");
      setGameState((prev) => applyOpportunityDecision(prev, true));
    }
  };

  const handleDecisionDecline = () => {
    if (!gameState.pendingDecision) return;
    
    if (gameState.pendingDecision.type === "charity") {
      setGameState((prev) => applyCharityDecision(prev, false));
    } else if (gameState.pendingDecision.type === "opportunity") {
      setGameState((prev) => applyOpportunityDecision(prev, false));
    }
  };

  const showInstructions = () => {
    toast.info(
      "Roll the dice to move around the board. Land on different tiles to trigger financial events. Your goal: Build passive income to exceed your expenses and escape the Rat Race!",
      { duration: 6000 }
    );
  };

  if (gameMode === "setup") {
    return (
      <PlayerSetup
        sessionName="Cashflow"
        onPlayerCreate={handlePlayerCreate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 p-4">
      {/* Top Controls */}
      <div className="flex justify-between items-center mb-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{gameState.playerName}'s Game</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewGame}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            New Game
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetMyGame}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset My Game
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMusic}
            className="bg-card"
          >
            {isMusicEnabled ? <Music className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSound}
            className="bg-card"
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-card"
            onClick={showInstructions}
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        <div className="lg:col-span-2 space-y-4">
          <GameBoard2D currentPosition={gameState.position} diceValue={gameState.diceValue} />
          <Dice value={gameState.diceValue} isRolling={gameState.isRolling} />
        </div>
        <div>
          <GameDashboard
            gameState={gameState}
            onRollDice={rollDice}
            onTakeLoan={takeLoan}
            onRepayLoan={repayLoan}
            onPayOffDebts={payOffDebts}
            onSellAsset={handleSellAsset}
          />
        </div>
      </div>

      <DecisionModal
        pendingDecision={gameState.pendingDecision}
        cash={gameState.cash}
        onAccept={handleDecisionAccept}
        onDecline={handleDecisionDecline}
      />

      <CashCertificateModal
        open={showCertificate}
        onClose={() => setShowCertificate(false)}
        playerName={gameState.playerName}
        cash={gameState.cash}
      />
    </div>
  );
};

export default Index;
