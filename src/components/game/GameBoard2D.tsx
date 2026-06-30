import { BOARD_TILES, calculateNetWorth, calculateTotalExpenses } from "@/lib/gameLogic";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GameState } from "@/types/game";
import { getTileMeta } from "@/lib/tileMeta";
import { DiceRoll } from "./HudPanels";

interface GameBoard2DProps {
  currentPosition: number;
  diceValue: number | null;
  gameState?: GameState;
  isRolling?: boolean;
  onRollDice?: () => void;
  actionBar?: React.ReactNode;
}

// NxN perimeter ring, clockwise from top-left. 10x10 -> 36 cells.
const BOARD_SIZE = 10;
function buildPerimeter(n: number = BOARD_SIZE): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let c = 0; c < n; c++) cells.push([0, c]);
  for (let r = 1; r < n; r++) cells.push([r, n - 1]);
  for (let c = n - 2; c >= 0; c--) cells.push([n - 1, c]);
  for (let r = n - 2; r > 0; r--) cells.push([r, 0]);
  return cells;
}

export const GameBoard2D = ({ currentPosition, diceValue, gameState, isRolling, onRollDice, actionBar }: GameBoard2DProps) => {
  const [displayedPosition, setDisplayedPosition] = useState(currentPosition);
  const [visited, setVisited] = useState<Set<number>>(new Set([currentPosition]));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (displayedPosition === currentPosition) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDisplayedPosition((prev) => {
        if (prev === currentPosition) return prev;
        const next = (prev + 1) % BOARD_TILES.length;
        setVisited((v) => new Set(v).add(next));
        return next;
      });
    }, 220);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [displayedPosition, currentPosition]);

  const cells = useMemo(buildPerimeter, []);
  const currentTile = BOARD_TILES[displayedPosition];
  const currentMeta = getTileMeta(currentTile.type);
  const netWorth = gameState ? calculateNetWorth(gameState) : 0;
  const totalExpenses = gameState ? calculateTotalExpenses(gameState) : 0;

  return (
    <div
      className="relative w-full mx-auto rounded-3xl overflow-hidden"
      style={{
        aspectRatio: "1 / 1",
        maxWidth: 820,
        background:
          "radial-gradient(ellipse at 50% 50%, hsl(225 60% 11%) 0%, hsl(225 70% 6%) 60%, hsl(225 80% 3%) 100%)",
        boxShadow:
          "0 0 0 1px hsla(45, 95%, 55%, 0.25), 0 30px 80px hsla(0, 0%, 0%, 0.6), inset 0 0 80px hsla(220, 80%, 35%, 0.15)",
      }}
    >
      {/* Skyline silhouette ambience (top) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-90"
        style={{
          background:
            "radial-gradient(ellipse at 20% 20%, hsla(210, 100%, 50%, 0.18), transparent 55%), radial-gradient(ellipse at 80% 25%, hsla(325, 90%, 55%, 0.14), transparent 55%), radial-gradient(ellipse at 50% 80%, hsla(170, 80%, 45%, 0.12), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(hsla(45, 100%, 70%, 0.55) 0.6px, transparent 1.2px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.9) 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.9) 75%)",
        }}
      />

      {/* 7x7 grid */}
      <div
        className="relative grid h-full w-full p-3 gap-1.5"
        style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)` }}
      >
        {BOARD_TILES.map((tile, index) => {
          const [row, col] = cells[index];
          const isCurrent = displayedPosition === index;
          const wasVisited = visited.has(index);
          const meta = getTileMeta(tile.type);
          const neon = `hsl(${meta.neonHsl})`;
          const neonSoft = `hsla(${meta.neonHsl.split(" ").join(", ").replace(/%/g, "%")}, 0.55)`;
          // Build hsla properly
          const [h, s, l] = meta.neonHsl.split(" ");
          const neonGlow40 = `hsla(${h}, ${s}, ${l}, 0.40)`;
          const neonGlow70 = `hsla(${h}, ${s}, ${l}, 0.70)`;
          const neonGlow15 = `hsla(${h}, ${s}, ${l}, 0.15)`;

          return (
            <div
              key={tile.id}
              className="relative"
              style={{ gridRow: row + 1, gridColumn: col + 1 }}
            >
              {/* Pulsing halo on active tile */}
              {isCurrent && (
                <motion.div
                  aria-hidden
                  className="absolute -inset-2 rounded-xl pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${neonGlow70} 0%, transparent 70%)`,
                    filter: "blur(8px)",
                  }}
                  animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.1, 0.95] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              <motion.div
                className="relative w-full h-full rounded-lg flex flex-col items-center justify-between text-center overflow-hidden py-1.5 px-0.5"
                animate={{
                  scale: isCurrent ? [1, 1.08, 1.03] : 1,
                  boxShadow: isCurrent
                    ? `0 0 0 2px ${neon}, 0 0 22px 4px ${neonGlow70}, inset 0 0 18px ${neonGlow40}`
                    : `0 0 0 1.5px ${neon}, 0 0 10px ${neonGlow40}, inset 0 0 10px hsla(0,0%,0%,0.5)`,
                }}
                transition={{ duration: isCurrent ? 0.8 : 0.3, ease: "easeOut" }}
                style={{
                  background: `linear-gradient(160deg, ${neonGlow15} 0%, hsla(225, 55%, 8%, 0.85) 60%, hsla(225, 70%, 5%, 0.95) 100%)`,
                  opacity: wasVisited || isCurrent ? 1 : 0.85,
                }}
              >
                {/* Top glossy sheen */}
                <div
                  className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to bottom, hsla(0, 0%, 100%, 0.10), transparent)",
                  }}
                />

                {/* Icon */}
                <motion.div
                  className="relative text-[18px] sm:text-[22px] leading-none"
                  style={{ filter: `drop-shadow(0 2px 6px ${neonGlow70})` }}
                  animate={isCurrent ? { scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] } : { scale: 1 }}
                  transition={{ duration: 0.7 }}
                >
                  {meta.icon}
                </motion.div>

                {/* Title */}
                <div
                  className="relative font-extrabold leading-none tracking-wider text-white"
                  style={{
                    fontSize: "0.5rem",
                    textShadow: `0 0 6px ${neonGlow70}, 0 1px 2px hsla(0,0%,0%,0.9)`,
                  }}
                >
                  {meta.category}
                </div>

                {/* Subtitle */}
                <div
                  className="relative leading-none tracking-[0.1em] font-mono-num font-semibold"
                  style={{
                    fontSize: "0.45rem",
                    color: `hsl(${h}, ${s}, 80%)`,
                  }}
                >
                  {meta.subtitle}
                </div>
              </motion.div>

              {/* Pawn */}
              {isCurrent && (
                <motion.div
                  layoutId="player-pawn"
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  className="absolute inset-0 flex items-end justify-center pointer-events-none pb-0.5"
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div
                      className="w-3.5 h-5 rounded-t-full"
                      style={{
                        background:
                          "linear-gradient(180deg, hsl(45, 100%, 75%) 0%, hsl(42, 95%, 55%) 55%, hsl(35, 80%, 30%) 100%)",
                        boxShadow:
                          "0 0 10px 2px hsla(45, 100%, 65%, 0.85), inset 0 -2px 3px hsla(0, 0%, 0%, 0.4)",
                      }}
                    />
                  </motion.div>
                </motion.div>
              )}
            </div>
          );
        })}

        {/* Center — illustrated island + financial dashboard */}
        <div
          className="relative flex flex-col items-center justify-center"
          style={{ gridRow: `2 / span ${BOARD_SIZE - 2}`, gridColumn: `2 / span ${BOARD_SIZE - 2}` }}
        >
          {/* Decorative island base */}
          <div
            className="absolute inset-2 rounded-2xl pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 60%, hsl(150, 30%, 18%) 0%, hsl(220, 40%, 10%) 55%, hsl(225, 70%, 5%) 100%)",
              boxShadow: "inset 0 0 40px hsla(0, 0%, 0%, 0.6), 0 0 30px hsla(45, 95%, 55%, 0.1)",
            }}
          />
          {/* Decorative pin lights around island */}
          <div
            className="absolute inset-4 rounded-2xl pointer-events-none opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 25%, hsla(45, 100%, 70%, 0.9) 1px, transparent 2px), radial-gradient(circle at 75% 20%, hsla(200, 100%, 75%, 0.9) 1px, transparent 2px), radial-gradient(circle at 30% 75%, hsla(325, 100%, 75%, 0.85) 1px, transparent 2px), radial-gradient(circle at 80% 80%, hsla(45, 100%, 70%, 0.85) 1px, transparent 2px)",
            }}
          />

          {/* Glass dashboard */}
          <div className="relative glass-card gold-border rounded-2xl px-5 py-4 w-[88%] max-w-[440px] flex flex-col items-center">
            <div className="font-display text-[11px] tracking-[0.3em] text-gold font-bold mb-3">
              FINANCIAL DASHBOARD
            </div>

            {gameState ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-200 w-full">
                <Stat label="Cash"          value={`₹${gameState.cash.toLocaleString()}`}          tone="green" />
                <Stat label="Expenses"      value={`₹${totalExpenses.toLocaleString()} /m`}        tone="red" />
                <Stat label="Salary"        value={`₹${gameState.salary.toLocaleString()} /m`} />
                <Stat label="Net Worth"     value={`₹${netWorth.toLocaleString()}`} tone={netWorth >= 0 ? "green" : "red"} />
                <Stat label="Passive"       value={`₹${gameState.passiveIncome.toLocaleString()} /m`} tone="gold" />
                <Stat label="Assets / Debts / Bills" value={
                  <>
                    <span className="text-emerald-400">{gameState.assets.length}</span>
                    <span className="text-slate-500"> / </span>
                    <span className="text-rose-400">{gameState.liabilities.length}</span>
                    <span className="text-slate-500"> / </span>
                    <span className="text-amber-400">{gameState.expenses.length}</span>
                  </>
                } />
              </div>
            ) : (
              <div className="text-slate-400 text-xs">Awaiting game state…</div>
            )}

            <div className="mt-4 w-full px-3 py-2 rounded-md border text-center" style={{ borderColor: "hsla(140, 90%, 55%, 0.4)", background: "hsla(140, 90%, 55%, 0.08)" }}>
              <div className="text-[10px] tracking-[0.25em] text-gold-deep font-bold">GOAL</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Passive Income &gt; Monthly Expenses</div>
              <div className="text-sm font-display font-bold mt-0.5" style={{ color: "hsl(140, 90%, 65%)", textShadow: "0 0 10px hsla(140, 90%, 55%, 0.6)" }}>
                Escape The Rat Race!
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-300">
              <span className="text-slate-500">On Tile: </span>
              <span className="font-semibold">{currentMeta.icon} {currentMeta.category}</span>
            </div>

            {onRollDice && (
              <div className="mt-4 pt-4 w-full border-t border-amber-500/20 flex justify-center">
                <DiceRoll
                  diceValue={diceValue}
                  isRolling={!!isRolling}
                  onRoll={onRollDice}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "green" | "red" | "gold";
}) => {
  const color =
    tone === "green" ? "text-emerald-400" :
    tone === "red"   ? "text-rose-400"    :
    tone === "gold"  ? "text-gold"        : "text-slate-100";
  return (
    <div className="text-left">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`font-mono-num font-bold text-[13px] ${color}`}>{value}</div>
    </div>
  );
};
