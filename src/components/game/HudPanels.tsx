import { motion } from "framer-motion";
import { GameState } from "@/types/game";
import { calculateNetWorth, calculateTotalExpenses } from "@/lib/gameLogic";
import { TrendingUp, TrendingDown, Minus, User } from "lucide-react";

/* =============================================================================
 * PLAYER PANEL (top-left)
 * ============================================================================= */
export const PlayerPanel = ({ gameState }: { gameState: GameState }) => {
  const netWorth = calculateNetWorth(gameState);
  const totalExpenses = calculateTotalExpenses(gameState);
  const TEN_CR = 100000000;
  const freedomPct = Math.min((gameState.cash / TEN_CR) * 100, 100);
  const initial = (gameState.playerName || "P").charAt(0).toUpperCase();

  return (
    <div className="glass-card rounded-2xl p-3 w-[260px]">
      <div className="flex items-center gap-3 pb-3 border-b border-amber-500/15">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-lg text-gold"
          style={{
            background: "radial-gradient(circle, hsla(45,95%,55%,0.25), hsla(225,60%,12%,0.9))",
            border: "1.5px solid hsla(45, 95%, 55%, 0.5)",
            boxShadow: "0 0 14px hsla(45, 95%, 55%, 0.4)",
          }}
        >
          {initial || <User className="w-5 h-5" />}
        </div>
        <div className="min-w-0">
          <div className="font-display font-bold text-white truncate text-base leading-tight">
            {gameState.playerName || "Player"}
          </div>
          <div className="text-[11px] text-slate-400 truncate">{gameState.profession}</div>
        </div>
      </div>

      <div className="space-y-1.5 mt-2.5 text-[12px]">
        <StatRow label="Cash"          value={`₹${gameState.cash.toLocaleString()}`}          tone="green" />
        <StatRow label="Salary"        value={`₹${gameState.salary.toLocaleString()} /m`} />
        <StatRow label="Passive Income" value={`₹${gameState.passiveIncome.toLocaleString()} /m`} tone="green" />
        <StatRow label="Expenses"      value={`₹${totalExpenses.toLocaleString()} /m`}        tone="red" />
        <StatRow label="Net Worth"     value={`₹${netWorth.toLocaleString()}`} tone={netWorth >= 0 ? "white" : "red"} />
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
          <span className="tracking-wider uppercase">Financial Freedom</span>
          <span className="font-mono-num text-emerald-400 font-bold">{freedomPct.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${freedomPct}%` }}
            transition={{ duration: 0.8 }}
            style={{
              background: "linear-gradient(90deg, hsl(140, 90%, 50%), hsl(170, 90%, 55%))",
              boxShadow: "0 0 10px hsla(140, 90%, 55%, 0.7)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const StatRow = ({
  label, value, tone = "white",
}: { label: string; value: string; tone?: "green" | "red" | "white" }) => {
  const color =
    tone === "green" ? "text-emerald-400" :
    tone === "red"   ? "text-rose-400"    : "text-slate-100";
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400">{label}</span>
      <span className={`font-mono-num font-bold ${color}`}>{value}</span>
    </div>
  );
};

/* =============================================================================
 * MARKET STATUS PANEL (top-right)
 * ============================================================================= */
export const MarketStatusPanel = ({ gameState }: { gameState: GameState }) => {
  const cond = gameState.marketCondition;
  const isBull = cond === "boom";
  const isBear = cond === "crash";
  const sensex = (72000 + Math.round((gameState.turnCount * 27) % 2500) + (isBull ? 800 : isBear ? -800 : 0));
  const pctChange = isBull ? 1.35 : isBear ? -1.42 : 0.18;

  const sentimentLabel = isBull ? "Bullish" : isBear ? "Bearish" : "Neutral";
  const sentimentColor = isBull ? "hsl(140, 90%, 55%)" : isBear ? "hsl(0, 90%, 60%)" : "hsl(45, 95%, 60%)";
  const Icon = isBull ? TrendingUp : isBear ? TrendingDown : Minus;

  return (
    <div className="glass-card rounded-2xl p-3 w-[230px]">
      <div className="text-[10px] tracking-[0.3em] text-gold font-bold pb-2 border-b border-amber-500/15">
        MARKET STATUS
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl" style={{ filter: `drop-shadow(0 0 8px ${sentimentColor})` }}>
            {isBull ? "🐂" : isBear ? "🐻" : "📊"}
          </span>
          <div>
            <div className="text-[10px] text-slate-400 tracking-wider">SENSEX</div>
            <div className="font-mono-num font-bold text-base" style={{ color: sentimentColor }}>
              {sensex.toLocaleString()}
            </div>
            <div className="font-mono-num text-[11px]" style={{ color: sentimentColor }}>
              {pctChange > 0 ? "+" : ""}{pctChange.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-amber-500/10">
        <div className="text-[10px] text-slate-400 tracking-wider">MARKET HINT</div>
        <div className="flex items-center gap-1.5 mt-0.5" style={{ color: sentimentColor }}>
          <span className="font-display font-bold text-sm">{sentimentLabel}</span>
          <Icon className="w-4 h-4" />
        </div>
        {gameState.marketHint && (
          <div className="text-[10px] text-slate-300 mt-1 leading-snug">
            {gameState.marketHint.headline}
          </div>
        )}
      </div>
    </div>
  );
};

/* =============================================================================
 * PLAYERS PANEL (right side, stacked list)
 * Reads localStorage saves like LocalLeaderboard does.
 * ============================================================================= */
import { useEffect, useState } from "react";
import { LEADERBOARD_UPDATE_EVENT } from "@/components/game/LocalLeaderboard";

interface PlayerEntry {
  playerName: string;
  netWorth: number;
}

const SAVE_KEY_PREFIX = "cashflow_game_save_v1:";

const readPlayers = (): PlayerEntry[] => {
  const out: PlayerEntry[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(SAVE_KEY_PREFIX)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const s = JSON.parse(raw) as GameState;
        out.push({ playerName: s.playerName, netWorth: calculateNetWorth(s) });
      } catch {/*ignore*/}
    }
  } catch {/*ignore*/}
  return out.sort((a, b) => b.netWorth - a.netWorth).slice(0, 4);
};

export const PlayersPanel = ({ currentPlayerName, currentNetWorth }: { currentPlayerName: string; currentNetWorth: number }) => {
  const [players, setPlayers] = useState<PlayerEntry[]>(() => readPlayers());

  useEffect(() => {
    const refresh = () => setPlayers(readPlayers());
    refresh();
    window.addEventListener(LEADERBOARD_UPDATE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(LEADERBOARD_UPDATE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // Ensure current player appears even if not yet saved
  const merged = (() => {
    const has = players.find((p) => p.playerName?.toLowerCase() === currentPlayerName.toLowerCase());
    const list = has ? players : [{ playerName: currentPlayerName, netWorth: currentNetWorth }, ...players];
    return list.slice(0, 4);
  })();

  return (
    <div className="glass-card rounded-2xl p-3 w-[230px]">
      <div className="text-[10px] tracking-[0.3em] text-gold font-bold pb-2 border-b border-amber-500/15">
        PLAYERS
      </div>
      <div className="mt-2 space-y-1.5">
        {merged.length === 0 ? (
          <div className="text-xs text-slate-500 italic py-2">No players yet</div>
        ) : merged.map((p) => {
          const isActive = p.playerName?.toLowerCase() === currentPlayerName.toLowerCase();
          const initial = (p.playerName || "?").charAt(0).toUpperCase();
          return (
            <div
              key={p.playerName}
              className="flex items-center gap-2.5 p-1.5 rounded-lg transition-all"
              style={isActive ? {
                background: "hsla(45, 95%, 55%, 0.08)",
                border: "1px solid hsla(45, 95%, 55%, 0.45)",
                boxShadow: "0 0 14px hsla(45, 95%, 55%, 0.18)",
              } : { border: "1px solid transparent" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-display font-bold flex-shrink-0"
                style={{
                  background: isActive
                    ? "radial-gradient(circle, hsla(45,95%,55%,0.35), hsla(225,60%,10%,0.9))"
                    : "hsla(225, 40%, 18%, 0.8)",
                  color: isActive ? "hsl(45, 100%, 75%)" : "hsl(210, 30%, 80%)",
                  border: isActive ? "1px solid hsla(45, 95%, 55%, 0.5)" : "1px solid hsla(225, 30%, 30%, 0.6)",
                }}
              >
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-bold text-white truncate leading-tight">{p.playerName}</div>
                <div className="text-[11px] font-mono-num text-gold leading-tight">₹{p.netWorth.toLocaleString()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* =============================================================================
 * GAME LOG (bottom-left)
 * ============================================================================= */
export const GameLogPanel = ({ gameState }: { gameState: GameState }) => {
  const logs = gameState.gameLog.slice(0, 5);
  return (
    <div className="glass-card rounded-2xl p-3 w-[300px]">
      <div className="text-[10px] tracking-[0.3em] text-gold font-bold pb-2 border-b border-amber-500/15">
        GAME LOG
      </div>
      <div className="mt-2 space-y-1.5">
        {logs.length === 0 && (
          <div className="text-xs text-slate-500 italic">Roll to begin…</div>
        )}
        {logs.map((entry, i) => {
          // Crude tone detection from text content
          const amountMatch = entry.match(/₹([\d,]+)/);
          const isLoss = /lost|paid|expense|tax|crash|loan|downsized|baby|medical|deduct/i.test(entry);
          const isGain = /received|earned|sold|payday|inheritance|bonus|dividend|boom/i.test(entry);
          const color = isLoss ? "text-rose-400" : isGain ? "text-emerald-400" : "text-slate-200";
          // Strip [Turn X] prefix for cleaner display
          const clean = entry.replace(/^\[Turn \d+\]\s*/, "");
          return (
            <motion.div
              key={`${i}-${entry.slice(0, 20)}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 text-[11px]"
            >
              <span className="w-1 h-1 mt-1.5 rounded-full flex-shrink-0" style={{
                background: isLoss ? "hsl(0, 90%, 60%)" : isGain ? "hsl(140, 90%, 55%)" : "hsl(45, 95%, 60%)",
                boxShadow: `0 0 6px ${isLoss ? "hsl(0, 90%, 60%)" : isGain ? "hsl(140, 90%, 55%)" : "hsl(45, 95%, 60%)"}`,
              }} />
              <span className={`leading-snug flex-1 ${color}`}>
                {amountMatch ? (
                  <>
                    {clean.split(amountMatch[0])[0]}
                    <span className="font-mono-num font-bold">{amountMatch[0]}</span>
                    {clean.split(amountMatch[0])[1]}
                  </>
                ) : clean}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/* =============================================================================
 * TOP-CENTER HUD pill — Month + market sentiment
 * ============================================================================= */
export const TopCenterHud = ({ gameState }: { gameState: GameState }) => {
  const cond = gameState.marketCondition;
  const label = cond === "boom" ? "Bull Market" : cond === "crash" ? "Bear Market" : "Steady Market";
  const color = cond === "boom" ? "hsl(140, 90%, 60%)" : cond === "crash" ? "hsl(0, 90%, 60%)" : "hsl(45, 100%, 65%)";
  return (
    <div className="glass-card gold-border rounded-full px-5 py-2 flex items-center gap-3">
      <span className="text-base" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
        {cond === "boom" ? "🐂" : cond === "crash" ? "🐻" : "📊"}
      </span>
      <div className="flex items-center gap-2">
        <span className="font-display font-bold text-sm text-gold tracking-wider">
          MONTH {gameState.turnCount}
        </span>
        <span className="text-slate-500">·</span>
        <span className="font-display font-bold text-sm" style={{ color }}>{label}</span>
      </div>
    </div>
  );
};

/* =============================================================================
 * DICE + ROLL BUTTON (bottom-center)
 * ============================================================================= */
export const DiceRoll = ({
  diceValue, isRolling, onRoll,
}: { diceValue: number | null; isRolling: boolean; onRoll: () => void }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-3 h-14 items-center">
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-2xl text-slate-900"
            style={{
              background: "linear-gradient(160deg, #fff 0%, #d8dde6 100%)",
              boxShadow: "0 6px 16px hsla(0,0%,0%,0.5), inset 0 -3px 6px hsla(0,0%,0%,0.15), inset 0 1px 0 hsla(0,0%,100%,0.9)",
            }}
            animate={
              isRolling
                ? { rotate: [0, 360, 720], scale: [1, 1.1, 1], y: [0, -8, 0] }
                : { rotate: 0, scale: 1, y: 0 }
            }
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            {isRolling ? "?" : (diceValue ?? (i === 0 ? 3 : 4))}
          </motion.div>
        ))}
      </div>
      <button
        onClick={onRoll}
        disabled={isRolling}
        className="relative rounded-full px-9 py-3.5 font-display font-bold text-white tracking-widest text-base disabled:opacity-70 disabled:cursor-not-allowed animate-roll-glow transition-transform hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(180deg, hsl(275, 75%, 60%) 0%, hsl(260, 70%, 45%) 100%)",
          border: "1.5px solid hsla(280, 90%, 75%, 0.6)",
        }}
      >
        ROLL DICE
        <div className="text-[9px] font-sans font-normal opacity-80 tracking-normal -mt-0.5">Click to Roll</div>
      </button>
    </div>
  );
};

/* =============================================================================
 * BOTTOM ACTION BUTTONS
 * ============================================================================= */
import { Briefcase, Building2, Trophy, Star } from "lucide-react";

interface ActionBtnProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}
const ActionBtn = ({ icon: Icon, label, onClick }: ActionBtnProps) => (
  <button
    onClick={onClick}
    className="glass-card rounded-xl px-4 py-2.5 flex flex-col items-center gap-1 transition-all hover:scale-105 hover:border-amber-500/50 group min-w-[88px]"
  >
    <Icon className="w-5 h-5 text-gold group-hover:drop-shadow-[0_0_8px_hsl(45_95%_55%/0.8)]" />
    <span className="text-[10px] font-display font-bold tracking-wider text-slate-200">{label}</span>
  </button>
);

export const ActionBar = ({
  onPortfolio, onAssets, onLeaderboard, onAchievements,
}: {
  onPortfolio: () => void;
  onAssets: () => void;
  onLeaderboard: () => void;
  onAchievements: () => void;
}) => (
  <div className="flex gap-2">
    <ActionBtn icon={Briefcase} label="PORTFOLIO" onClick={onPortfolio} />
    <ActionBtn icon={Building2} label="ASSETS" onClick={onAssets} />
    <ActionBtn icon={Trophy} label="LEADERBOARD" onClick={onLeaderboard} />
    <ActionBtn icon={Star} label="ACHIEVEMENTS" onClick={onAchievements} />
  </div>
);