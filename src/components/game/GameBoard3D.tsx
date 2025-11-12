import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { BoardTiles } from "./BoardTiles";
import { PlayerPawn } from "./PlayerPawn";

interface GameBoard3DProps {
  currentPosition: number;
  diceValue: number | null;
}

export const GameBoard3D = ({ currentPosition, diceValue }: GameBoard3DProps) => {
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-border bg-gradient-to-b from-background to-accent">
      <Canvas camera={{ position: [0, 8, 12], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, 10, -5]} intensity={0.5} />
        
        <BoardTiles />
        <PlayerPawn position={currentPosition} />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={8}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
    </div>
  );
};
