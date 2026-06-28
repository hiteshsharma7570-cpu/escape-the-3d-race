import { BOARD_TILES } from "@/lib/gameLogic";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface GameBoard2DProps {
  currentPosition: number;
  diceValue: number | null;
}

export const GameBoard2D = ({ currentPosition, diceValue }: GameBoard2DProps) => {
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
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [displayedPosition, currentPosition]);

  const TILE_COUNT = BOARD_TILES.length;
  const currentTile = BOARD_TILES[displayedPosition];

  // Hex ring layout — tiles arranged in a circle
  // Container has padding; we position via center + radius using angles.
  // We render in a square; size driven by parent.
  const radiusPct = 40; // % of half-side
  const tileSize = 76;  // px
  const hexClip = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

  return (
    <div
      className="w-full mx-auto rounded-xl border-2 border-amber-900/40 shadow-inner relative"
      style={{
        background:
          "radial-gradient(ellipse at center, #0f3d2e 0%, #082218 80%), repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 2px, transparent 2px 6px)",
        aspectRatio: "1 / 1",
        maxWidth: 560,
      }}
    >
      {/* Center display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-amber-200/70 text-xs tracking-[0.3em] uppercase mb-1">
          Current Tile
        </div>
        <div className="text-3xl mb-1">{currentTile?.icon}</div>
        <div className="text-amber-100 text-lg font-bold">{currentTile?.label}</div>
        {diceValue !== null && (
          <div className="mt-3 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-100 text-sm">
            🎲 Rolled {diceValue}
          </div>
        )}
      </div>

      {BOARD_TILES.map((tile, index) => {
        const angle = (index / TILE_COUNT) * 2 * Math.PI - Math.PI / 2;
        const x = 50 + radiusPct * Math.cos(angle);
        const y = 50 + radiusPct * Math.sin(angle);
        const isCurrent = displayedPosition === index;
        const wasVisited = visited.has(index);

        return (
          <div
            key={tile.id}
            className="absolute transition-all"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: tileSize,
              height: tileSize,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className="w-full h-full flex flex-col items-center justify-center text-center shadow-lg"
              style={{
                clipPath: hexClip,
                background: tile.gradient || tile.color,
                boxShadow: isCurrent
                  ? "0 0 24px 4px rgba(255, 215, 0, 0.8)"
                  : wasVisited
                  ? "0 0 10px 1px rgba(255, 215, 0, 0.35)"
                  : "0 2px 6px rgba(0,0,0,0.4)",
                opacity: wasVisited || isCurrent ? 1 : 0.85,
              }}
            >
              <div className="text-xl leading-none">{tile.icon}</div>
              <div className="text-[9px] font-bold text-white drop-shadow px-1 leading-tight mt-1">
                {tile.label}
              </div>
            </div>

            {isCurrent && (
              <motion.div
                layoutId="player-pawn"
                initial={false}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 border-2 border-white shadow-[0_0_12px_rgba(255,215,0,0.9)]"
                />
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
};
