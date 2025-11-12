import { motion } from "framer-motion";

interface DiceProps {
  value: number | null;
  isRolling: boolean;
}

export const Dice = ({ value, isRolling }: DiceProps) => {
  const getDiceDots = (num: number) => {
    const dotPositions: { [key: number]: string[] } = {
      1: ["center"],
      2: ["top-left", "bottom-right"],
      3: ["top-left", "center", "bottom-right"],
      4: ["top-left", "top-right", "bottom-left", "bottom-right"],
      5: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
      6: ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right"],
    };
    return dotPositions[num] || [];
  };

  const getDotPosition = (position: string) => {
    const positions: { [key: string]: string } = {
      "top-left": "top-[15%] left-[15%]",
      "top-right": "top-[15%] right-[15%]",
      "middle-left": "top-1/2 left-[15%] -translate-y-1/2",
      "middle-right": "top-1/2 right-[15%] -translate-y-1/2",
      "bottom-left": "bottom-[15%] left-[15%]",
      "bottom-right": "bottom-[15%] right-[15%]",
      "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    };
    return positions[position] || "";
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="relative w-20 h-20 bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-2xl border-2 border-gray-300"
        animate={
          isRolling
            ? {
                rotateX: [0, 360, 720, 1080],
                rotateY: [0, 360, 720, 1080],
                rotateZ: [0, 180, 360, 540],
                scale: [1, 1.1, 1, 1.1, 1],
              }
            : {
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                scale: 1,
              }
        }
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Dice face */}
        <div className="absolute inset-0 flex items-center justify-center">
          {value && !isRolling && getDiceDots(value).map((position, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`absolute w-3 h-3 bg-primary rounded-full ${getDotPosition(position)}`}
            />
          ))}
          
          {isRolling && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.3, repeat: Infinity }}
              className="text-4xl font-bold text-primary"
            >
              ?
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
