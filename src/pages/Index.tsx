import { useState, useEffect, useRef } from "react";
import { GameBoard2D } from "@/components/game/GameBoard2D";
import { PlayerSetup } from "@/components/game/PlayerSetup";
import { LEADERBOARD_UPDATE_EVENT } from "@/components/game/LocalLeaderboard";
import { DecisionModal } from "@/components/game/DecisionModal";
import { CashCertificateModal } from "@/components/game/CashCertificateModal";
import { FiveCroreCertificate } from "@/components/game/FiveCroreCertificate";
import { WelcomeModal } from "@/components/game/WelcomeModal";
import { createInitialGameState, GameState } from "@/types/game";
import {
  BOARD_TILES,
  handleTileEffect,
  applyCharityDecision,
  applyOpportunityDecision,
  generateMarketHint,
  sellAsset,
  applyPeriodicMechanics,
  calculateNetWorth,
  repayLiability,
} from "@/lib/gameLogic";
import { RepayLoanDialog } from "@/components/game/RepayLoanDialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HelpCircle, Music, Volume2, VolumeX, RotateCcw, Check, LogOut, Settings as SettingsIcon } from "lucide-react";
import { useGameSounds } from "@/hooks/useGameSounds";
import { WinScreen } from "@/components/game/WinScreen";
import { ACHIEVEMENTS, meetsThreshold } from "@/lib/achievements";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PlayerPanel, MarketStatusPanel, PlayersPanel, GameLogPanel,
  TopCenterHud,
} from "@/components/game/HudPanels";


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
  const [showFiveCrore, setShowFiveCrore] = useState(false);
  const [fiveCroreAwarded, setFiveCroreAwarded] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showWinScreen, setShowWinScreen] = useState(false);
  const [repayOpen, setRepayOpen] = useState(false);
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

  // Primary win: ₹5 Crore in cash
  useEffect(() => {
    if (gameMode === "playing" && !fiveCroreAwarded && gameState.cash >= 50000000) {
      setFiveCroreAwarded(true);
      setShowFiveCrore(true);
      playSound("payDay");
      toast.success("🏆 You reached ₹5 Crore! You've escaped the Rat Race!");
    }
  }, [gameState.cash, gameMode, fiveCroreAwarded]);

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
        // Backward compat: ensure new fields exist (preserve persisted flags — do not recompute from current cash)
        if (parsed.turnCount === undefined) parsed.turnCount = 0;
        if (parsed.loansTaken === undefined) parsed.loansTaken = 0;
        if (parsed.hasReachedFiveCrore === undefined) parsed.hasReachedFiveCrore = false;
        // Backfill new array fields (older saves may pre-date the expense/liability split).
        if (!Array.isArray(parsed.assets)) parsed.assets = [];
        if (!Array.isArray(parsed.liabilities)) parsed.liabilities = [];
        if (!Array.isArray(parsed.expenses)) parsed.expenses = [];
        if (!Array.isArray(parsed.gameLog)) parsed.gameLog = [];
        setGameState(parsed);
        // Suppress the milestone modals on resume — they fire once per achievement, not per session.
        setCertificateAwarded(true);
        setFiveCroreAwarded(parsed.hasReachedFiveCrore === true);
        setWinRecorded(parsed.hasEscapedRatRace);
        setShowWelcome(false);
        setGameMode("playing");
        toast.success(`Welcome back, ${playerName}! Resuming your game.`);
        return;
      }
    } catch (err) {
      console.error("Failed to load saved game", err);
    }

    // No saved game confirmed — start fresh and show welcome.
    const initialState = createInitialGameState(playerName, profession);
    setGameState(initialState);
    setCertificateAwarded(initialState.cash >= 10000000);
    setFiveCroreAwarded(false);
    setWinRecorded(false);
    setShowWelcome(true);
    toast.success(`Welcome, ${playerName}! Starting a fresh game as a ${profession}.`);
  };

  // "Change Player": go back to setup screen (keeps saved game).
  const handleChangePlayer = () => {
    if (!confirm("Switch to a different player? Your current game is already saved.")) return;
    setGameState(createInitialGameState());
    setCertificateAwarded(false);
    setFiveCroreAwarded(false);
    setWinRecorded(false);
    setShowWinScreen(false);
    setShowWelcome(false);
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
      // Apply periodic mechanics (inflation, salary review, depreciation)
      const periodic = applyPeriodicMechanics(updated);
      updated = periodic.state;
      periodic.events.forEach((e) => setTimeout(() => toast.info(e), 200));
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
    // Delay the toast so it lands after the pawn animation starts, not before.
    setTimeout(() => toast.info(`Rolled ${diceValue}!`), 150);
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
    const monthlyEMI = 5000;
    
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
          category: "personal_loan" as const,
          principal: loanAmount,
          monthlyEMI,
          interestRate: 12,
        },
      ],
      gameLog: [
        `[Turn ${prev.turnCount}] Took a loan of ₹${loanAmount.toLocaleString()}. Monthly EMI: ₹${monthlyEMI.toLocaleString()}`,
        ...prev.gameLog.slice(0, 19),
      ],
    }));
    
    toast.success(`Loan approved! ₹${loanAmount.toLocaleString()} added to cash`);
  };

  const repayLoan = () => {
    if (gameState.liabilities.length === 0) {
      toast.error("You have no outstanding loans.");
      return;
    }
    setRepayOpen(true);
  };

  const handleRepaySpecific = (liabilityId: string, amount: number) => {
    const result = repayLiability(gameState, liabilityId, amount);
    if (!result.ok) {
      playSound("loseMoney");
      toast.error(result.error ?? "Could not repay loan.");
      return;
    }
    playSound("earnMoney");
    setGameState(result.state);
    toast.success("Loan payment applied!");
  };

  const payOffDebts = () => {
    // Every liability now has an outstanding principal — all are clearable in a lump sum.
    // Recurring expenses live in their own array and cannot be paid off this way.
    const clearable = gameState.liabilities.filter((l) => (l.principal ?? 0) > 0);
    if (clearable.length === 0) {
      toast.error("No outstanding loans to clear. Recurring expenses can't be paid off in a lump sum.");
      return;
    }
    const totalDebt = clearable.reduce((sum, l) => sum + (l.principal ?? 0), 0);
    if (!confirm(`Pay off ${clearable.length} loan(s) totaling ₹${totalDebt.toLocaleString()}? Recurring expenses (rent, bills, subscriptions) will remain.`)) {
      return;
    }
    if (gameState.cash >= totalDebt) {
      playSound("earnMoney");
      const clearableIds = new Set(clearable.map((l) => l.id));
      setGameState((prev) => ({
        ...prev,
        cash: prev.cash - totalDebt,
        liabilities: prev.liabilities.filter((l) => !clearableIds.has(l.id)),
        gameLog: [
          `[Turn ${prev.turnCount}] Paid off loans totaling ₹${totalDebt.toLocaleString()}`,
          ...prev.gameLog.slice(0, 19),
        ],
      }));
      toast.success("Loans cleared! Recurring expenses remain.");
    } else {
      playSound("loseMoney");
      toast.error("Insufficient funds to pay off all loans");
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

  // Modal state for bottom action buttons
  const [openPanel, setOpenPanel] = useState<null | "portfolio" | "assets" | "leaderboard" | "achievements">(null);

  if (gameMode === "setup") {
    return (
      <>
        <PlayerSetup
          sessionName="Cashflow"
          onPlayerCreate={handlePlayerCreate}
        />
        <WelcomeModal
          open={showWelcome && !!gameState.playerName}
          playerName={gameState.playerName}
          profession={gameState.profession}
          onStart={() => {
            setShowWelcome(false);
            setGameMode("playing");
          }}
          onChangeProfession={() => setShowWelcome(false)}
        />
      </>
    );
  }

  const netWorth = calculateNetWorth(gameState);
  return (
    <TooltipProvider delayDuration={150}>
    <div className="relative min-h-screen overflow-hidden p-3 md:p-5">
      {/* Night-city ambient backdrop layers */}
      <div className="pointer-events-none absolute inset-0 -z-10" style={{
        background:
          "radial-gradient(ellipse 70% 50% at 50% 0%, hsla(220, 80%, 30%, 0.4), transparent 70%), radial-gradient(ellipse 50% 40% at 85% 25%, hsla(290, 75%, 40%, 0.28), transparent 70%), radial-gradient(ellipse 50% 40% at 15% 30%, hsla(190, 80%, 45%, 0.22), transparent 70%), linear-gradient(180deg, hsl(225 65% 6%) 0%, hsl(225 80% 3%) 100%)",
      }} />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-50" style={{
        backgroundImage:
          "radial-gradient(circle at 10% 35%, hsla(45, 100%, 70%, 0.85) 0.6px, transparent 1.4px), radial-gradient(circle at 25% 25%, hsla(200, 100%, 75%, 0.7) 0.6px, transparent 1.4px), radial-gradient(circle at 45% 40%, hsla(45, 100%, 70%, 0.85) 0.6px, transparent 1.4px), radial-gradient(circle at 70% 30%, hsla(325, 100%, 75%, 0.7) 0.6px, transparent 1.4px), radial-gradient(circle at 88% 38%, hsla(45, 100%, 70%, 0.85) 0.6px, transparent 1.4px), radial-gradient(circle at 60% 18%, hsla(45, 100%, 70%, 0.7) 0.5px, transparent 1.2px)",
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, transparent 65%)",
        WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, transparent 65%)",
      }} />
      {/* Distant city silhouette */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[42vh] -z-10 opacity-40" style={{
        background: "linear-gradient(180deg, transparent 60%, hsl(225 70% 4%) 100%)",
      }} />

      {/* === TOP CENTER HUD === */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
        <TopCenterHud gameState={gameState} />
      </div>

      {/* === TOP-RIGHT controls === */}
      <div className="absolute top-3 right-3 z-30 flex gap-2">
        <IconBtn onClick={toggleSound} title="Sound">
          {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </IconBtn>
        <IconBtn onClick={toggleMusic} title="Music">
          {isMusicEnabled ? <Music className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </IconBtn>
        <IconBtn onClick={showInstructions} title="Help">
          <HelpCircle className="w-4 h-4" />
        </IconBtn>
        <IconBtn onClick={handleChangePlayer} title="Change player">
          <LogOut className="w-4 h-4" />
        </IconBtn>
        <IconBtn onClick={handleResetMyGame} title="Restart">
          <RotateCcw className="w-4 h-4" />
        </IconBtn>
      </div>

      {/* === MAIN GRID LAYOUT === */}
      <div className="max-w-[1600px] mx-auto pt-16 pb-4 flex flex-col xl:flex-row gap-4 items-stretch justify-center">

        {/* LEFT column: player panel + game log */}
        <div className="flex flex-col justify-between gap-3 order-2 xl:order-1">
          <PlayerPanel gameState={gameState} />
          <GameLogPanel gameState={gameState} />
        </div>

        {/* CENTER: board + dice + actions */}
        <div className="flex-1 flex flex-col items-center gap-3 order-1 xl:order-2">
          <GameBoard2D
            currentPosition={gameState.position}
            diceValue={gameState.diceValue}
            gameState={gameState}
            isRolling={gameState.isRolling}
            onRollDice={rollDice}
            actionBar={
              <ActionBar
                onPortfolio={() => setOpenPanel("portfolio")}
                onAssets={() => setOpenPanel("assets")}
                onLeaderboard={() => setOpenPanel("leaderboard")}
                onAchievements={() => setOpenPanel("achievements")}
              />
            }
          />

          {saveStatus.show && (
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" /> {saveStatus.message}
            </div>
          )}
        </div>

        {/* RIGHT column: market status + players list */}
        <div className="flex flex-col gap-3 order-3">
          <MarketStatusPanel gameState={gameState} />
          <PlayersPanel currentPlayerName={gameState.playerName} currentNetWorth={netWorth} />
        </div>
      </div>

      {/* === Modals for action bar === */}
      <Dialog open={openPanel === "portfolio" || openPanel === "assets"} onOpenChange={(o) => !o && setOpenPanel(null)}>
        <DialogContent className="max-w-3xl glass-card gold-border">
          <DialogHeader>
            <DialogTitle className="font-display text-gold tracking-widest">
              {openPanel === "portfolio" ? "PORTFOLIO" : "ASSETS & LIABILITIES"}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <GameDashboard
              gameState={gameState}
              onRollDice={rollDice}
              onTakeLoan={takeLoan}
              onRepayLoan={repayLoan}
              onPayOffDebts={payOffDebts}
              onSellAsset={handleSellAsset}
            />
          </div>
        </DialogContent>
      </Dialog>

      <RepayLoanDialog
        open={repayOpen}
        onOpenChange={setRepayOpen}
        gameState={gameState}
        onRepay={handleRepaySpecific}
      />

      <Dialog open={openPanel === "leaderboard"} onOpenChange={(o) => !o && setOpenPanel(null)}>
        <DialogContent className="max-w-2xl glass-card gold-border">
          <DialogHeader>
            <DialogTitle className="font-display text-gold tracking-widest">LEADERBOARD</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <LocalLeaderboard currentPlayerName={gameState.playerName} limit={10} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openPanel === "achievements"} onOpenChange={(o) => !o && setOpenPanel(null)}>
        <DialogContent className="max-w-2xl glass-card gold-border">
          <DialogHeader>
            <DialogTitle className="font-display text-gold tracking-widest">ACHIEVEMENTS</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <AchievementsPanel
              achievements={ACHIEVEMENTS.map((a) => ({ ...a, threshold: a.threshold ?? 0 })) as any}
              isUnlocked={(id) => unlockedAchIds.includes(id)}
              getProgress={(a: any) => {
                if (meetsThreshold(a as any, gameState, gamesWon)) return 100;
                return 0;
              }}
              gameState={gameState}
              gamesWon={gamesWon}
            />
          </div>
        </DialogContent>
      </Dialog>

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

      <FiveCroreCertificate
        open={showFiveCrore}
        playerName={gameState.playerName}
        turnCount={gameState.turnCount}
        onClose={() => setShowFiveCrore(false)}
        onPlayAgain={() => {
          setShowFiveCrore(false);
          setGameState(createInitialGameState());
          setCertificateAwarded(false);
          setFiveCroreAwarded(false);
          setWinRecorded(false);
          setGameMode("setup");
        }}
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

const IconBtn = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    title={title}
    className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-slate-200 hover:text-gold hover:border-amber-500/50 transition-all"
  >
    {children}
  </button>
);
