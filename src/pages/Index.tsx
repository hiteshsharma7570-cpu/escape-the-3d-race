import { useState, useEffect, useRef } from "react";
import { GameBoard2D } from "@/components/game/GameBoard2D";
import { GameDashboard } from "@/components/game/GameDashboard";
import { Dice } from "@/components/game/Dice";
import { PlayerSetup } from "@/components/game/PlayerSetup";
import { LocalLeaderboard, LEADERBOARD_UPDATE_EVENT } from "@/components/game/LocalLeaderboard";
import { DecisionModal } from "@/components/game/DecisionModal";
import { CashCertificateModal } from "@/components/game/CashCertificateModal";
import { createInitialGameState, GameState } from "@/types/game";
import { BOARD_TILES, handleTileEffect, applyCharityDecision, applyOpportunityDecision, generateMarketHint, sellAsset } from "@/lib/gameLogic";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HelpCircle, Music, Volume2, VolumeX, RotateCcw, Check, LogOut } from "lucide-react";
import { useGameSounds } from "@/hooks/useGameSounds";
import { WinScreen } from "@/components/game/WinScreen";
import { AchievementsPanel } from "@/components/game/AchievementsPanel";
import { ACHIEVEMENTS, meetsThreshold, getProgress as getAchProgress } from "@/lib/achievements";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SAVE_KEY_PREFIX = "cashflow_game_save_v1:";
const saveKeyFor = (name: string) => `${SAVE_KEY_PREFIX}${name.trim().toLowerCase()}`;
const ACH_KEY_PREFIX = "cashflow_achievements_v1:";
const achKeyFor = (name: string) => `${ACH_KEY_PREFIX}${name.trim().toLowerCase()}`;
const GAMES_WON_KEY_PREFIX = "cashflow_games_won_v1:";
const gamesWonKeyFor = (name: string) => `${GAMES_WON_KEY_PREFIX}${name.trim().toLowerCase()}`;

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState());
  const [gameMode, setGameMode] = useState<"setup" | "playing">("setup");
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateAwarded, setCertificateAwarded] = useState(false);
  const [showWinScreen, setShowWinScreen] = useState(false);
  const [winRecorded, setWinRecorded] = useState(false);
  const [unlockedAchIds, setUnlockedAchIds] = useState<string[]>([]);
  const [gamesWon, setGamesWon] = useState(0);
  const [saveStatus, setSaveStatus] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "Saved just now",
  });
  const saveStatusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { playSound, isMusicEnabled, isSoundEnabled, toggleMusic, toggleSound } = useGameSounds();

  const flashSaved = () => {
    setSaveStatus({ show: true, message: "Saved just now" });
    if (saveStatusTimer.current) clearTimeout(saveStatusTimer.current);
    saveStatusTimer.current = setTimeout(() => {
      setSaveStatus((prev) => ({ ...prev, show: false }));
    }, 2000);
  };

  // Debounced persist game state to localStorage while playing (per-player)
  useEffect(() => {
    if (gameMode !== "playing" || !gameState.playerName) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(saveKeyFor(gameState.playerName), JSON.stringify(gameState));
        flashSaved();
        window.dispatchEvent(new Event(LEADERBOARD_UPDATE_EVENT));
      } catch (err) {
        console.error("Failed to save game", err);
      }
    }, 400);
    return () => clearTimeout(timer);
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

  // Show win screen on rat-race escape (once) and bump games_won
  useEffect(() => {
    if (gameMode !== "playing") return;
    if (gameState.hasEscapedRatRace && !winRecorded) {
      setWinRecorded(true);
      setShowWinScreen(true);
      try {
        const next = gamesWon + 1;
        localStorage.setItem(gamesWonKeyFor(gameState.playerName), String(next));
        setGamesWon(next);
      } catch {}
    }
  }, [gameState.hasEscapedRatRace, gameMode, winRecorded, gamesWon, gameState.playerName]);

  // Check achievements whenever game state or gamesWon changes
  useEffect(() => {
    if (gameMode !== "playing" || !gameState.playerName) return;
    const newlyUnlocked: string[] = [];
    for (const ach of ACHIEVEMENTS) {
      if (unlockedAchIds.includes(ach.id)) continue;
      if (meetsThreshold(ach, gameState, gamesWon)) newlyUnlocked.push(ach.id);
    }
    if (newlyUnlocked.length > 0) {
      const updated = [...unlockedAchIds, ...newlyUnlocked];
      setUnlockedAchIds(updated);
      try {
        localStorage.setItem(achKeyFor(gameState.playerName), JSON.stringify(updated));
      } catch {}
      newlyUnlocked.forEach((id) => {
        const ach = ACHIEVEMENTS.find((a) => a.id === id);
        if (ach) {
          toast.success(`🏆 Achievement Unlocked: ${ach.name}!`, {
            description: ach.description,
            duration: 4000,
          });
        }
      });
    }
  }, [gameState, gamesWon, gameMode, unlockedAchIds]);

  const handlePlayerCreate = (playerName: string, profession: string) => {
    // Load achievements + games won for this player
    try {
      const a = localStorage.getItem(achKeyFor(playerName));
      setUnlockedAchIds(a ? (JSON.parse(a) as string[]) : []);
    } catch { setUnlockedAchIds([]); }
    try {
      const w = localStorage.getItem(gamesWonKeyFor(playerName));
      setGamesWon(w ? parseInt(w, 10) || 0 : 0);
    } catch { setGamesWon(0); }

    // If this player has a saved game, resume it. Otherwise start fresh.
    try {
      const saved = localStorage.getItem(saveKeyFor(playerName));
      if (saved) {
        const parsed = JSON.parse(saved) as GameState;
        // Backward compat: ensure new fields exist
        if (parsed.turnCount === undefined) parsed.turnCount = 0;
        if (parsed.loansTaken === undefined) parsed.loansTaken = 0;
        setGameState(parsed);
        setCertificateAwarded(parsed.cash >= 10000000);
        setWinRecorded(parsed.hasEscapedRatRace);
        setGameMode("playing");
        toast.success(`Welcome back, ${playerName}! Resuming your game.`);
        return;
      }
    } catch (err) {
      console.error("Failed to load saved game", err);
    }

    const initialState = createInitialGameState(playerName, profession);
    setGameState(initialState);
    setCertificateAwarded(initialState.cash >= 10000000);
    setWinRecorded(false);
    setGameMode("playing");
    toast.success(`Welcome, ${playerName}! Starting a fresh game as a ${profession}.`);
  };

  // "Change Player": go back to setup screen (keeps saved game).
  const handleChangePlayer = () => {
    if (!confirm("Switch to a different player? Your current game is already saved.")) return;
    setGameState(createInitialGameState());
    setCertificateAwarded(false);
    setWinRecorded(false);
    setShowWinScreen(false);
    setGameMode("setup");
    toast.info("Pick a player to continue");
  };

  // "Restart": reset state but keep same player and profession.
  const handleResetMyGame = () => {
    if (!confirm("Reset your saved progress and restart from the beginning?")) return;
    const { playerName, profession } = gameState;
    if (playerName) {
      localStorage.removeItem(saveKeyFor(playerName));
    }
    const fresh = createInitialGameState(playerName, profession);
    setGameState(fresh);
    setCertificateAwarded(false);
    setWinRecorded(false);
    setShowWinScreen(false);
    setGameMode("playing");
    toast.info(`${playerName}, your game has been reset to the starting point.`);
  };

  const rollDice = () => {
    if (gameState.isRolling) return;
    playSound("diceRoll");
    const diceValue = Math.floor(Math.random() * 6) + 1;
    setGameState((prev) => {
      const newPosition = (prev.position + diceValue) % BOARD_TILES.length;
      const landedTile = BOARD_TILES[newPosition];
      let updated: GameState = {
        ...prev,
        diceValue,
        position: newPosition,
        isRolling: false,
        turnCount: prev.turnCount + 1,
      };
      updated = handleTileEffect(updated, landedTile);
      if (
        !updated.marketHint &&
        !updated.pendingDecision &&
        landedTile.type !== "market" &&
        Math.random() < 0.4
      ) {
        updated.marketHint = generateMarketHint();
        updated.gameLog = [
          `[Turn ${updated.turnCount}] ${updated.marketHint.headline}`,
          ...updated.gameLog.slice(0, 19),
        ];
      }
      // Tile sound based on type
      setTimeout(() => {
        if (landedTile.type === "payday") playSound("payDay");
        else if (landedTile.type === "opportunity") playSound("opportunity");
        else if (landedTile.type === "market") playSound("market");
        else if (landedTile.type === "charity") playSound("charity");
        else if (landedTile.type === "baby") playSound("baby");
        else if (landedTile.type === "downsized") playSound("downsized");
        else if (landedTile.type === "dinner" || landedTile.type === "vacation")
          playSound("loseMoney");
      }, 100);
      return updated;
    });
    toast.info(`Rolled ${diceValue}!`);
  };

  const handleSellAsset = (assetId: string) => {
    playSound("earnMoney");
    setGameState((prev) => sellAsset(prev, assetId));
    toast.success("Asset sold!");
  };

  const takeLoan = () => {
    const activeBankLoans = gameState.liabilities.filter((l) => l.name === "Bank Loan").length;
    if (activeBankLoans >= 3) {
      toast.error("You already have 3 active bank loans. Repay one before taking another.");
      return;
    }
    const loanAmount = 100000;
    const monthlyPayment = 5000;
    
    playSound("earnMoney");
    setGameState((prev) => ({
      ...prev,
      cash: prev.cash + loanAmount,
      loansTaken: prev.loansTaken + 1,
      liabilities: [
        ...prev.liabilities,
        {
          id: `loan-${Date.now()}`,
          name: "Bank Loan",
          amount: loanAmount,
          monthlyPayment,
        },
      ],
      gameLog: [
        `[Turn ${prev.turnCount}] Took a loan of ₹${loanAmount.toLocaleString()}. Monthly payment: ₹${monthlyPayment.toLocaleString()}`,
        ...prev.gameLog.slice(0, 19),
      ],
    }));
    
    toast.success(`Loan approved! ₹${loanAmount.toLocaleString()} added to cash`);
  };

  const repayLoan = () => {
    // Repay the most recently taken Bank Loan
    let loanIndex = -1;
    for (let i = gameState.liabilities.length - 1; i >= 0; i--) {
      if (gameState.liabilities[i].name === "Bank Loan") { loanIndex = i; break; }
    }
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
        gameLog: [
          `[Turn ${prev.turnCount}] Repaid loan of ₹${loan.amount.toLocaleString()}`,
          ...prev.gameLog.slice(0, 19),
        ],
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
    if (!confirm(`Pay off ALL liabilities totaling ₹${totalDebt.toLocaleString()}? This cannot be undone.`)) {
      return;
    }
    if (gameState.cash >= totalDebt) {
      playSound("earnMoney");
      setGameState((prev) => ({
        ...prev,
        cash: prev.cash - totalDebt,
        liabilities: [],
        gameLog: [
          `[Turn ${prev.turnCount}] Paid off all debts totaling ₹${totalDebt.toLocaleString()}`,
          ...prev.gameLog.slice(0, 19),
        ],
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
    <TooltipProvider delayDuration={150}>
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 p-4">
      {/* Top Controls */}
      <div className="flex justify-between items-center mb-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{gameState.playerName}'s Game</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleChangePlayer} className="gap-2">
                <LogOut className="w-4 h-4" />
                Change Player
              </Button>
            </TooltipTrigger>
            <TooltipContent>Switch to a different player (your save stays).</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleResetMyGame} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Restart
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset state, keep your player and profession.</TooltipContent>
          </Tooltip>
          {saveStatus.show && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Check className="w-3 h-3 text-success" />
              {saveStatus.message}
            </span>
          )}
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
        <div className="space-y-4">
          <LocalLeaderboard currentPlayerName={gameState.playerName} limit={5} />
          <AchievementsPanel
            achievements={ACHIEVEMENTS}
            isUnlocked={(id) => unlockedAchIds.includes(id)}
            getProgress={getAchProgress}
            gameState={gameState}
            gamesWon={gamesWon}
          />
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

      <WinScreen
        open={showWinScreen}
        gameState={gameState}
        onPlayAgain={() => {
          setShowWinScreen(false);
          setGameState(createInitialGameState());
          setCertificateAwarded(false);
          setWinRecorded(false);
          setGameMode("setup");
        }}
      />
    </div>
    </TooltipProvider>
  );
};

export default Index;
