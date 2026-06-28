import { BOARD_TILES } from "@/lib/gameLogic";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface GameBoard2DProps {
  currentPosition: number;
  diceValue: number | null;
}

export const GameBoard2D = ({ currentPosition, diceValue }: GameBoard2DProps) => {
  const [displayedPosition, setDisplayedPosition] = useState(currentPosition);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step the pawn tile-by-tile toward the target position so each dice roll
  // visibly travels across the board.
  useEffect(() => {
    if (displayedPosition === currentPosition) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDisplayedPosition((prev) => {
        if (prev === currentPosition) return prev;
        // Always step forward (dice only moves forward), wrapping the board.
        return (prev + 1) % BOARD_TILES.length;
      });
    }, 280);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [displayedPosition, currentPosition]);

  // Create board layout: 4x4 grid path
  const getTilePosition = (index: number) => {
    const positions = [
      // Top row (left to right)
      { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 },
      // Right column (top to bottom)
      { row: 1, col: 3 }, { row: 2, col: 3 }, { row: 3, col: 3 },
      // Bottom row (right to left)
      { row: 3, col: 2 }, { row: 3, col: 1 }, { row: 3, col: 0 },
      // Left column (bottom to top)
      { row: 2, col: 0 }, { row: 1, col: 0 },
      // Inner tiles
      { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 2, col: 2 }, { row: 2, col: 1 }
    ];
    return positions[index] || { row: 0, col: 0 };
  };

  return (
    <div className="w-full aspect-square max-w-[600px] mx-auto p-4 rounded-xl border border-border bg-gradient-to-br from-background to-accent/20">
      <div className="grid grid-cols-4 grid-rows-4 gap-2 h-full">
        {BOARD_TILES.map((tile, index) => {
          const pos = getTilePosition(index);
          const isCurrentPosition = displayedPosition === index;
          
          return (
            <div
              key={tile.id}
              className="relative rounded-lg border-2 border-border overflow-hidden transition-all"
              style={{
                gridRow: pos.row + 1,
                gridColumn: pos.col + 1,
                backgroundColor: tile.color,
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                <span className="text-xs sm:text-sm font-bold text-white drop-shadow-lg">
                  {tile.label}
                </span>
              </div>
              
              {isCurrentPosition && (
                <motion.div
                  layoutId="player-pawn"
                  initial={false}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="w-8 h-8 bg-yellow-500 rounded-full border-4 border-white shadow-lg"
                  />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
