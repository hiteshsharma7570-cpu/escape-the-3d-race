import { BOARD_TILES } from "@/lib/gameLogic";
import { motion } from "framer-motion";
import { useEffect, useState, useRef, useMemo } from "react";
import { calculateNetWorth, calculateTotalExpenses } from "@/lib/gameLogic";
import type { GameState } from "@/types/game";

interface GameBoard2DProps {
  currentPosition: number;
  diceValue: number | null;
  gameState?: GameState;
}

// Map BOARD_TILES indices to (row, col) on a 7x7 perimeter ring.
// 7+6+6+5 = 24 cells. Order goes clockwise starting top-left.
function buildPerimeter(): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let c = 0; c < 7; c++) cells.push([0, c]);          // top row L→R
  for (let r = 1; r < 7; r++) cells.push([r, 6]);           // right col T→B
  for (let c = 5; c >= 0; c--) cells.push([6, c]);          // bottom row R→L
  for (let r = 5; r > 0; r--) cells.push([r, 0]);           // left col B→T
  return cells;
}

export const GameBoard2D = ({ currentPosition, diceValue, gameState }: GameBoard2DProps) => {
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
    }, 240);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [displayedPosition, currentPosition]);

  const cells = useMemo(buildPerimeter, []);
  const currentTile = BOARD_TILES[displayedPosition];
  const netWorth = gameState ? calculateNetWorth(gameState) : 0;
  const totalExpenses = gameState ? calculateTotalExpenses(gameState) : 0;

  return (
    <div
      className="relative w-full mx-auto rounded-2xl overflow-hidden ring-1 ring-amber-500/30 shadow-2xl"
      style={{
        aspectRatio: "1 / 1",
        maxWidth: 720,
        background:
          "radial-gradient(ellipse at 50% 30%, #1a2a55 0%, #0a1530 45%, #050a18 100%)",
      }}
    >
      {/* Skyline silhouette ambience (top) */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 opacity-60 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 80%, rgba(79,158,255,0.25), transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(255,107,157,0.18), transparent 60%)",
        }}
      />
      {/* Distant city lights — subtle dots */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,220,120,0.5) 1px, transparent 1.5px)",
          backgroundSize: "26px 26px",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 35%, transparent 55%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 35%, transparent 55%)",
        }}
      />

      {/* 7x7 grid */}
      <div className="relative grid h-full w-full p-3 gap-1.5"
           style={{ gridTemplateColumns: "repeat(7, 1fr)", gridTemplateRows: "repeat(7, 1fr)" }}>
        {BOARD_TILES.map((tile, index) => {
          const [row, col] = cells[index];
          const isCurrent = displayedPosition === index;
          const wasVisited = visited.has(index);

          return (
            <div
              key={tile.id}
              className="relative"
              style={{ gridRow: row + 1, gridColumn: col + 1 }}
            >
              <div
                className="relative w-full h-full rounded-md flex flex-col items-center justify-center text-center overflow-hidden transition-all"
                style={{
                  background: tile.gradient || tile.color,
                  boxShadow: isCurrent
                    ? `0 0 0 2px ${tile.color}, 0 0 22px 4px ${tile.color}cc, inset 0 0 14px rgba(255,255,255,0.18)`
                    : `0 0 0 1.5px ${tile.color}, 0 0 10px ${tile.color}80, inset 0 0 8px rgba(0,0,0,0.4)`,
                  opacity: wasVisited || isCurrent ? 1 : 0.92,
                }}
              >
                {/* Glossy top sheen */}
                <div
                  className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(255,255,255,0.22), rgba(255,255,255,0))",
                  }}
                />
                <div className="relative text-lg sm:text-xl leading-none drop-shadow-md">
                  {tile.icon}
                </div>
                <div
                  className="relative font-extrabold text-white px-1 leading-tight mt-0.5 tracking-wide"
                  style={{
                    fontSize: "0.55rem",
                    textShadow: "0 1px 3px rgba(0,0,0,0.85)",
                  }}
                >
                  {tile.label.toUpperCase()}
                </div>
              </div>

              {isCurrent && (
                <motion.div
                  layoutId="player-pawn"
                  initial={false}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  className="absolute inset-0 flex items-end justify-center pointer-events-none pb-1"
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    {/* Pawn — gold rounded silhouette */}
                    <div
                      className="w-4 h-6 rounded-t-full"
                      style={{
                        background:
                          "linear-gradient(180deg, #ffe082 0%, #f6b73c 55%, #a06a0c 100%)",
                        boxShadow:
                          "0 0 10px 2px rgba(255,200,80,0.85), inset 0 -2px 3px rgba(0,0,0,0.4)",
                      }}
                    />
                    <div
                      className="w-5 h-1 -mt-0.5 mx-auto rounded-full"
                      style={{ background: "rgba(0,0,0,0.45)", filter: "blur(1px)" }}
                    />
                  </motion.div>
                </motion.div>
              )}
            </div>
          );
        })}

        {/* Center dashboard — spans rows 2..6 / cols 2..6 (5x5 interior) */}
        <div
          className="relative rounded-xl border border-amber-500/30 bg-slate-950/70 backdrop-blur-md p-3 sm:p-4 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(0,0,0,0.5)_inset]"
          style={{ gridRow: "2 / span 5", gridColumn: "2 / span 5" }}
        >
          <div className="text-[10px] tracking-[0.3em] text-amber-300/80 font-semibold mb-2">
            FINANCIAL DASHBOARD
          </div>

          {gameState ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] sm:text-xs text-slate-200">
              <div className="text-left">
                <div className="text-slate-400">Cash</div>
                <div className="text-emerald-400 font-bold">₹{gameState.cash.toLocaleString()}</div>
              </div>
              <div className="text-left">
                <div className="text-slate-400">Expenses</div>
                <div className="text-rose-400 font-bold">₹{totalExpenses.toLocaleString()} /m</div>
              </div>
              <div className="text-left">
                <div className="text-slate-400">Salary</div>
                <div className="font-bold">₹{gameState.salary.toLocaleString()} /m</div>
              </div>
              <div className="text-left">
                <div className="text-slate-400">Net Worth</div>
                <div className={`font-bold ${netWorth >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  ₹{netWorth.toLocaleString()}
                </div>
              </div>
              <div className="text-left">
                <div className="text-slate-400">Passive</div>
                <div className="text-amber-300 font-bold">₹{gameState.passiveIncome.toLocaleString()} /m</div>
              </div>
              <div className="text-left">
                <div className="text-slate-400">Assets / Liab.</div>
                <div className="font-bold">
                  <span className="text-emerald-400">{gameState.assets.length}</span>
                  <span className="text-slate-500"> / </span>
                  <span className="text-rose-400">{gameState.liabilities.length}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-xs">Awaiting game state…</div>
          )}

          <div className="mt-3 px-3 py-1.5 rounded-md border border-amber-400/40 bg-amber-500/10 text-amber-100 text-[10px] sm:text-[11px] max-w-[90%]">
            <span className="text-amber-300/80">GOAL: </span>
            Passive Income &gt; Monthly Expenses —{" "}
            <span className="font-bold text-amber-300">Escape The Rat Race!</span>
          </div>

          <div className="mt-3 text-xs text-slate-300">
            <span className="text-slate-400">On Tile: </span>
            <span className="font-semibold">{currentTile?.icon} {currentTile?.label}</span>
          </div>

          {diceValue !== null && (
            <div className="mt-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-100 text-xs font-bold">
              🎲 Rolled {diceValue}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
