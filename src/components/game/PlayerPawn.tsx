import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { BOARD_TILES } from "@/lib/gameLogic";

interface PlayerPawnProps {
  position: number;
}

export const PlayerPawn = ({ position }: PlayerPawnProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetPosition = useRef(new THREE.Vector3(0, 0.5, 0));
  
  useEffect(() => {
    const tilesPerRow = 4;
    const spacing = 2.5;
    const index = position % BOARD_TILES.length;
    const row = Math.floor(index / tilesPerRow);
    const col = index % tilesPerRow;
    
    let x = 0;
    let z = 0;

    if (row === 0) {
      x = col * spacing - (tilesPerRow - 1) * spacing / 2;
      z = spacing * 1.5;
    } else if (row === 1) {
      x = spacing * 1.5;
      z = spacing * 1.5 - (index - tilesPerRow) * spacing;
    } else if (row === 2) {
      x = spacing * 1.5 - (index - tilesPerRow * 2) * spacing;
      z = -spacing * 1.5;
    } else {
      x = -spacing * 1.5;
      z = -spacing * 1.5 + (index - tilesPerRow * 3) * spacing;
    }

    targetPosition.current.set(x, 0.5, z);
  }, [position]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.lerp(targetPosition.current, 0.1);
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
      <coneGeometry args={[0.3, 0.8, 4]} />
      <meshStandardMaterial color="#eab308" metalness={0.5} roughness={0.3} />
    </mesh>
  );
};
