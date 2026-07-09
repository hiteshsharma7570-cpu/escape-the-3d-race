import { BOARD_TILES, FAST_TRACK_TILES, calculateNetWorth } from "@/lib/gameLogic";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GameState } from "@/types/game";
import { getTileMeta } from "@/lib/tileMeta";
import { DiceRoll } from "./HudPanels";
import { useViewport } from "@/hooks/useViewport";

interface GameBoard2DProps {
  currentPosition: number;
  diceValue: number | null;
  gameState?: GameState;
  isRolling?: boolean;
  onRollDice?: () => void;
}


// NxN perimeter ring, clockwise from top-left. Size auto-fits BOARD_TILES.length
// (perimeter of NxN = 4*(N-1) cells, so N = ceil(tiles/4) + 1, min 4).
// At 24 tiles this resolves to a clean 7x7 board (4*7 - 4 = 24).
const BOARD_SIZE = Math.max(4, Math.ceil(BOARD_TILES.length / 4) + 1);
function buildPerimeter(n: number = BOARD_SIZE): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let c = 0; c < n; c++) cells.push([0, c]);
  for (let r = 1; r < n; r++) cells.push([r, n - 1]);
  for (let c = n - 2; c >= 0; c--) cells.push([n - 1, c]);
  for (let r = n - 2; r > 0; r--) cells.push([r, 0]);
  return cells;
}

export const GameBoard2D = ({ currentPosition, diceValue, gameState, isRolling, onRollDice }: GameBoard2DProps) => {
  const vp = useViewport();
  const onFastTrack = !!gameState?.onFastTrack;
  const tiles = onFastTrack ? FAST_TRACK_TILES : BOARD_TILES;
  const activePosition = onFastTrack ? (gameState?.ftPosition ?? 0) : currentPosition;
  const [displayedPosition, setDisplayedPosition] = useState(activePosition);
  const [visited, setVisited] = useState<Set<number>>(new Set([activePosition]));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When switching boards (Rat Race → Fast Track), snap to the new position
  // and reset visited tiles so we don't animate through nonexistent indices.
  useEffect(() => {
    setDisplayedPosition(activePosition);
    setVisited(new Set([activePosition]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFastTrack]);

  useEffect(() => {
    if (displayedPosition === activePosition) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDisplayedPosition((prev) => {
        if (prev === activePosition) return prev;
        const next = (prev + 1) % tiles.length;
        setVisited((v) => new Set(v).add(next));
        return next;
      });
    }, 220);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [displayedPosition, activePosition, tiles.length]);

  const boardSize = Math.max(4, Math.ceil(tiles.length / 4) + 1);
  const cells = useMemo(() => buildPerimeter(boardSize), [boardSize]);
  const safePosition = ((displayedPosition % tiles.length) + tiles.length) % tiles.length;
  const currentTile = tiles[safePosition];
  const currentMeta = getTileMeta(currentTile.type);
  const netWorth = gameState ? calculateNetWorth(gameState) : 0;

  // Live-computed square board size. Reacts to rotation and browser-chrome
  // changes (URL bar collapsing, keyboard opening) via useViewport.
  //   - Reserve room for the top HUD (≈120px portrait, ≈70px landscape).
  //   - Reserve horizontal room for side panels when we're in the 3-column
  //     phone-landscape layout (~72% of width goes to panels).
  // Reserved space above the board: top HUD (Month ribbon + icons) + page
  // padding + a bit of breathing room. Landscape has less vertical HUD.
  const reservedHeight = vp.isShort ? 100 : 160;
  // Horizontal reserve accounts for page padding (p-3 = 24px total) plus
  // side panels in the phone-landscape 3-column layout.
  const widthCap = vp.isShort && vp.width < 900
    ? Math.floor(vp.width * 0.36)
    : vp.width - 32;
  const heightCap = vp.height - reservedHeight;
  const boardMax = Math.max(220, Math.min(820, widthCap, heightCap));

  return (
    <div
      className="relative w-full mx-auto rounded-3xl overflow-hidden"
      style={{
        aspectRatio: "1 / 1",
        // Live JS-computed cap (updates on resize/orientation/visualViewport).
        maxWidth: boardMax,
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
        className="relative grid h-full w-full p-1.5 sm:p-3 gap-1 sm:gap-1.5"
        style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)`, gridTemplateRows: `repeat(${boardSize}, 1fr)` }}
      >
        {tiles.map((tile, index) => {
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
                className="relative w-full h-full rounded-md sm:rounded-lg flex flex-col items-center justify-between text-center overflow-hidden py-0.5 px-0.5 sm:py-1.5"
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
                  className="relative text-[14px] sm:text-[22px] md:text-[28px] leading-none"
                  style={{ filter: `drop-shadow(0 2px 6px ${neonGlow70})` }}
                  animate={isCurrent ? { scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] } : { scale: 1 }}
                  transition={{ duration: 0.7 }}
                >
                  {meta.icon}
                </motion.div>

                {/* Title */}
                <div
                  className="relative font-extrabold leading-[1.05] tracking-tight text-white break-words w-full px-0.5"
                  style={{
                    fontSize: "clamp(0.42rem, 1.5vw, 0.72rem)",
                    textShadow: `0 0 6px ${neonGlow70}, 0 1px 2px hsla(0,0%,0%,0.9)`,
                  }}
                >
                  {meta.category}
                </div>

                {/* Subtitle */}
                <div
                  className="relative leading-tight tracking-[0.04em] font-mono-num font-semibold break-words w-full px-0.5"
                  style={{
                    fontSize: "clamp(0.38rem, 1.2vw, 0.62rem)",
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
          style={{ gridRow: `2 / span ${boardSize - 2}`, gridColumn: `2 / span ${boardSize - 2}` }}
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
          <div className="relative glass-card gold-border rounded-xl sm:rounded-2xl px-2 py-2 sm:px-6 sm:py-5 w-[94%] h-[92%] max-w-[560px] flex flex-col items-center justify-between gap-1">
            <div className="font-display text-[9px] sm:text-[12px] tracking-[0.2em] sm:tracking-[0.3em] text-gold font-bold text-center">
              FINANCIAL DASHBOARD
            </div>

            {gameState ? (
              <div className="grid grid-cols-2 gap-x-2 sm:gap-x-8 gap-y-1 sm:gap-y-3 text-[10px] sm:text-xs text-slate-200 w-full">
                <Stat label="Cash"          value={`₹${(gameState.cash ?? 0).toLocaleString()}`}          tone="green" />
                <Stat label="Salary"        value={`₹${(gameState.salary ?? 0).toLocaleString()} /m`} />
                <Stat label="Passive"       value={`₹${(gameState.passiveIncome ?? 0).toLocaleString()} /m`} tone="gold" />
                <Stat label="Net Worth"     value={`₹${(netWorth ?? 0).toLocaleString()}`} tone={(netWorth ?? 0) >= 0 ? "green" : "red"} />
                <Stat label="Assets" value={
                  <span className="text-emerald-400">{gameState.assets.length}</span>
                } />
              </div>
            ) : (
              <div className="text-slate-400 text-xs">Awaiting game state…</div>
            )}

            <div className="hidden sm:block w-full px-3 py-2 rounded-md border text-center" style={{ borderColor: "hsla(140, 90%, 55%, 0.4)", background: "hsla(140, 90%, 55%, 0.08)" }}>
              <div className="text-[10px] tracking-[0.25em] text-gold-deep font-bold">GOAL</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Grow Cash to ₹5 Crore</div>
              <div className="text-sm font-display font-bold mt-0.5" style={{ color: "hsl(140, 90%, 65%)", textShadow: "0 0 10px hsla(140, 90%, 55%, 0.6)" }}>
                Escape The Rat Race!
              </div>
            </div>

            <div className="text-[9px] sm:text-[11px] text-slate-300 text-center">
              <span className="text-slate-500">On Tile: </span>
              <span className="font-semibold">{currentMeta.icon} {currentMeta.category}</span>
            </div>

            {onRollDice && (
              <div className="pt-1 sm:pt-3 w-full border-t border-amber-500/20 flex items-center justify-center gap-2 sm:gap-4">
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
